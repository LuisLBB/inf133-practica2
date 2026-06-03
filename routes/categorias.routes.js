const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajusta la ruta según tu proyecto

// ─────────────────────────────────────────────────────────────
// POST /categorias — Registrar nueva categoría
// ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El campo "nombre" es requerido.' });
    }

    const [result] = await db.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion ?? null]
    );

    const [rows] = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('POST /categorias:', error);
    res.status(500).json({ error: 'Error al crear la categoría.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /categorias — Listar todas las categorías
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [categorias] = await db.query(
      'SELECT * FROM categorias ORDER BY id ASC'
    );

    res.json(categorias);
  } catch (error) {
    console.error('GET /categorias:', error);
    res.status(500).json({ error: 'Error al obtener las categorías.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /categorias/:id — Categoría + sus productos
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [categorias] = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );

    if (categorias.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    // ⚠️  Verifica que el FK en tu tabla productos se llame "categoriaId"
    //     Cámbialo por "categoria_id" o "id_categoria" si usas otra convención
    const [productos] = await db.query(
      'SELECT * FROM productos WHERE categoriaId = ?',
      [id]
    );

    res.json({ ...categorias[0], productos });
  } catch (error) {
    console.error('GET /categorias/:id:', error);
    res.status(500).json({ error: 'Error al obtener la categoría.' });
  }
});

// ─────────────────────────────────────────────────────────────
// PATCH /categorias/:id — Actualizar categoría
// ─────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    const current = existing[0];

    await db.query(
      `UPDATE categorias
       SET nombre      = ?,
           descripcion = ?,
           updatedAt   = NOW()
       WHERE id = ?`,
      [
        nombre      !== undefined ? nombre      : current.nombre,
        descripcion !== undefined ? descripcion : current.descripcion,
        id,
      ]
    );

    const [updated] = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('PATCH /categorias/:id:', error);
    res.status(500).json({ error: 'Error al actualizar la categoría.' });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /categorias/:id — Eliminar categoría y sus productos
// ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    // Primero eliminar los productos de la categoría,
    // luego la categoría (evita error de FK constraint)
    await db.query('DELETE FROM productos WHERE categoriaId = ?', [id]);
    await db.query('DELETE FROM categorias WHERE id = ?', [id]);

    res.json({
      message: `Categoría #${id} y todos sus productos fueron eliminados.`,
    });
  } catch (error) {
    console.error('DELETE /categorias/:id:', error);
    res.status(500).json({ error: 'Error al eliminar la categoría.' });
  }
});

module.exports = router;
