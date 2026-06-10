const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET todas las propiedades
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties WHERE active = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET propiedad por id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Propiedad no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
