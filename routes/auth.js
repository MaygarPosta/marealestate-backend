const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@marealestate.cl';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET || 'marealestate_secret_2026';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, token });
});

module.exports = router;
