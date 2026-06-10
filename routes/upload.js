const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/property/:id', auth, upload.array('fotos', 10), async (req, res) => {
  try {
    const urls = [];
    for (const file of req.files) {
      const key = `propiedades/${req.params.id}/${Date.now()}-${file.originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));
      urls.push(`${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`);
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

module.exports = router;
