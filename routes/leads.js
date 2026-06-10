const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// POST nuevo lead
router.post('/', async (req, res) => {
  const {
    nombre, apellido, email, telefono, mensaje,
    tipo_formulario, propiedad_id,
    consent_given
  } = req.body;

  if (!consent_given) {
    return res.status(400).json({ error: 'Se requiere consentimiento para procesar la solicitud' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads 
        (nombre, apellido, email, telefono, mensaje, tipo_formulario, propiedad_id, consent_given, consent_date, consent_ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9)
       RETURNING id`,
      [nombre, apellido, email, telefono, mensaje, tipo_formulario, propiedad_id || null, consent_given, req.ip]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET todos los leads (para ADM)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
