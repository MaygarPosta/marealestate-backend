const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const auth = require('../middleware/auth');
const pool = require('../db/pool');

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

router.post('/property/:id', auth, (req, res, next) => {
  upload.array('fotos', 50)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No se recibieron archivos' });
    const urls = [];
    for (const file of req.files) {
      const ext = file.originalname.split('.').pop();
      const key = `propiedades/${req.params.id}/${Date.now()}-${Math.random().toString(36).substr(2,6)}.${ext}`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));
      urls.push(`${process.env.R2_PUBLIC_URL}/${key}`);
    }
    const prop = await pool.query('SELECT fotos FROM properties WHERE id = $1', [req.params.id]);
    const fotosActuales = prop.rows[0]?.fotos || [];
    const todasFotos = [...fotosActuales, ...urls];
    await pool.query('UPDATE properties SET fotos = $1 WHERE id = $2', [todasFotos, req.params.id]);
    res.json({ success: true, fotos: todasFotos });
  } catch (error) {
    console.error('Error upload:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/property/:id/foto', auth, async (req, res) => {
  try {
    const { url } = req.body;
    const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
    const prop = await pool.query('SELECT fotos FROM properties WHERE id = $1', [req.params.id]);
    const nuevasFotos = (prop.rows[0]?.fotos || []).filter((f) => f !== url);
    await pool.query('UPDATE properties SET fotos = $1 WHERE id = $2', [nuevasFotos, req.params.id]);
    res.json({ success: true, fotos: nuevasFotos });
  } catch (error) {
    console.error('Error delete foto:', error.message);
    res.status(500).json({ error: error.message });
  }
});


router.put('/property/:id/reorder', auth, async (req, res) => {
  try {
    const { fotos } = req.body;
    await pool.query('UPDATE properties SET fotos = $1 WHERE id = $2', [fotos, req.params.id]);
    res.json({ success: true, fotos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;