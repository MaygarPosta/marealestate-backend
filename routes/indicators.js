const express = require('express');
const router = express.Router();
const axios = require('axios');

let cache = { data: null, timestamp: null };
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

router.get('/', async (req, res) => {
  try {
    const ahora = Date.now();
    if (cache.data && cache.timestamp && (ahora - cache.timestamp) < CACHE_DURATION) {
      return res.json(cache.data);
    }

    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    const [ufRes, usdRes, euroRes, utmRes] = await Promise.allSettled([
      axios.get(`https://mindicador.cl/api/uf/${dia}-${mes}-${anio}`),
      axios.get(`https://mindicador.cl/api/dolar/${dia}-${mes}-${anio}`),
      axios.get(`https://mindicador.cl/api/euro/${dia}-${mes}-${anio}`),
      axios.get(`https://mindicador.cl/api/utm/${dia}-${mes}-${anio}`),
    ]);

    const getValue = (result) => {
      if (result.status === 'fulfilled' && result.value.data?.serie?.[0]?.valor) {
        return result.value.data.serie[0].valor;
      }
      return null;
    };

    const data = {
      uf: getValue(ufRes),
      usd: getValue(usdRes),
      euro: getValue(euroRes),
      utm: getValue(utmRes),
      fecha: `${dia}-${mes}-${anio}`
    };

    cache = { data, timestamp: ahora };
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
