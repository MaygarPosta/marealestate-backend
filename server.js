const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/properties', require('./routes/properties'));
app.use('/api/leads', require('./routes/leads'));

app.get('/', (req, res) => {
  res.json({ status: 'Marea Real Estate API funcionando' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
