const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

router.get('/leads', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/leads/:id', auth, async (req, res) => {
  try {
    const { estado, notas } = req.body;
    const result = await pool.query(
      'UPDATE leads SET estado = $1, notas = $2 WHERE id = $3 RETURNING *',
      [estado, notas, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/leads/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/properties', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/properties', auth, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, precio_uf, superficie, ubicacion, region, comuna, video_url } = req.body;
    const result = await pool.query(
      `INSERT INTO properties (titulo, descripcion, tipo, precio_uf, superficie, ubicacion, region, comuna, video_url, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true) RETURNING *`,
      [titulo, descripcion, tipo, precio_uf, superficie, ubicacion, region, comuna, video_url]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/properties/:id', auth, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, precio_uf, superficie, ubicacion, region, comuna, video_url, estado, active } = req.body;
    const result = await pool.query(
      `UPDATE properties SET titulo=$1, descripcion=$2, tipo=$3, precio_uf=$4, superficie=$5, ubicacion=$6, region=$7, comuna=$8, video_url=$9, estado=$10, active=$11 WHERE id=$12 RETURNING *`,
      [titulo, descripcion, tipo, precio_uf, superficie, ubicacion, region, comuna, video_url, estado, active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/properties/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
