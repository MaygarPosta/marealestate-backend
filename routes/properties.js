const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET todas las propiedades
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM properties WHERE active = true
      ORDER BY
        CASE estado
          WHEN 'disponible' THEN 1
          WHEN 'reservado' THEN 2
          WHEN 'vendido' THEN 3
          ELSE 4
        END,
        created_at DESC
    `);
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

// GET filtros disponibles
router.get('/filtros', async (req, res) => {
  try {
    const regiones = await pool.query("SELECT DISTINCT region FROM properties WHERE active = true AND region IS NOT NULL ORDER BY region");
    const comunas = await pool.query("SELECT DISTINCT comuna, region FROM properties WHERE active = true AND comuna IS NOT NULL ORDER BY comuna");
    const tipos = await pool.query("SELECT DISTINCT tipo FROM properties WHERE active = true AND tipo IS NOT NULL ORDER BY tipo");
    const precios = await pool.query("SELECT MIN(precio_uf) as min, MAX(precio_uf) as max FROM properties WHERE active = true");
    res.json({
      regiones: regiones.rows.map(r => r.region),
      comunas: comunas.rows,
      tipos: tipos.rows.map(t => t.tipo),
      precio_min: precios.rows[0].min,
      precio_max: precios.rows[0].max
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET propiedades filtradas
router.get('/buscar', async (req, res) => {
  try {
    const { region, comuna, tipo, precio_max } = req.query;
    let query = `SELECT * FROM properties WHERE active = true`;
    const params: any[] = [];
    let i = 1;
    if (region) { query += ` AND region = $${i++}`; params.push(region); }
    if (comuna) { query += ` AND comuna = $${i++}`; params.push(comuna); }
    if (tipo) { query += ` AND tipo = $${i++}`; params.push(tipo); }
    if (precio_max) { query += ` AND precio_uf <= $${i++}`; params.push(precio_max); }
    query += ` ORDER BY CASE estado WHEN 'disponible' THEN 1 WHEN 'reservado' THEN 2 WHEN 'vendido' THEN 3 ELSE 4 END, created_at DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
