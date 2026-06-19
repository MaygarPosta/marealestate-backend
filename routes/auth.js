const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'marealestate_secret_2026';

const ADMINS = [
  { email: process.env.ADMIN_EMAIL || 'admin@marealestate.cl', hash: process.env.ADMIN_PASSWORD_HASH },
  { email: process.env.ADMIN_EMAIL_2, hash: process.env.ADMIN_PASSWORD_HASH_2 },
].filter(a => a.email && a.hash);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = ADMINS.find(a => a.email === email);
  if (!admin) return res.status(401).json({ error: 'Credenciales incorrectas' });
  const valid = await bcrypt.compare(password, admin.hash);
  if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '4h' });
  res.json({ success: true, token });
});

module.exports = router;
