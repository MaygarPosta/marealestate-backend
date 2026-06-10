const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.post('/', async (req, res) => {
  console.log('Body recibido:', req.body);
  const {
    nombre, apellido, email, telefono, mensaje,
    tipo_formulario, propiedad_id, consent_given
  } = req.body;

  if (!consent_given) {
    return res.status(400).json({ error: 'Se requiere consentimiento' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads 
        (nombre, apellido, email, telefono, mensaje, tipo_formulario, propiedad_id, consent_given, consent_date, consent_ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9)
       RETURNING id`,
      [nombre, apellido, email, telefono, mensaje, tipo_formulario, propiedad_id || null, consent_given, req.ip]
    );
    console.log('Lead creado id:', result.rows[0].id);
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error SQL:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
