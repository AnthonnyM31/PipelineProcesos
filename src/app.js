const express = require('express');

const app = express();
app.use(express.json());

const CATEGORIAS_VALIDAS = ['cuerda', 'viento', 'percusion', 'teclado'];

let inventario = [
  { id: 1, nombre: 'Guitarra Acústica', categoria: 'cuerda', precio: 250, stock: 5 },
  { id: 2, nombre: 'Flauta Traversa', categoria: 'viento', precio: 180, stock: 3 },
  { id: 3, nombre: 'Batería Acústica', categoria: 'percusion', precio: 850, stock: 2 }
];
let siguienteId = 4;

// GET /health -> Estado del servicio y versión
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

// GET /instrumentos -> Lista el inventario (filtro opcional ?categoria=)
app.get('/instrumentos', (req, res) => {
  const { categoria } = req.query;
  if (categoria) {
    const filtrados = inventario.filter(
      (item) => item.categoria.toLowerCase() === categoria.toLowerCase()
    );
    return res.status(200).json(filtrados);
  }
  return res.status(200).json(inventario);
});

// GET /instrumentos/:id -> Consulta un instrumento por ID
app.get('/instrumentos/:id', (req, res) => {
  const id = Number(req.params.id);
  const instrumento = inventario.find((item) => item.id === id);
  if (!instrumento) {
    return res.status(404).json({ error: 'Instrumento no encontrado' });
  }
  return res.status(200).json(instrumento);
});

// POST /instrumentos -> Crea un instrumento con validaciones
app.post('/instrumentos', (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  if (
    !nombre ||
    typeof nombre !== 'string' ||
    !categoria ||
    !CATEGORIAS_VALIDAS.includes(categoria.toLowerCase()) ||
    typeof precio !== 'number' ||
    precio <= 0 ||
    typeof stock !== 'number' ||
    stock < 0
  ) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos. Verifique nombre, categoria, precio (>0) y stock (>=0).'
    });
  }

  const nuevo = {
    id: siguienteId++,
    nombre: nombre.trim(),
    categoria: categoria.toLowerCase(),
    precio,
    stock
  };
  inventario.push(nuevo);
  return res.status(201).json(nuevo);
});

// PUT /instrumentos/:id -> Actualiza un instrumento existente
app.put('/instrumentos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = inventario.findIndex((item) => item.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: 'Instrumento no encontrado' });
  }

  const { nombre, categoria, precio, stock } = req.body;
  if (
    !nombre ||
    typeof nombre !== 'string' ||
    !categoria ||
    !CATEGORIAS_VALIDAS.includes(categoria.toLowerCase()) ||
    typeof precio !== 'number' ||
    precio <= 0 ||
    typeof stock !== 'number' ||
    stock < 0
  ) {
    return res.status(400).json({ error: 'Datos de actualización inválidos' });
  }

  inventario[indice] = {
    id,
    nombre: nombre.trim(),
    categoria: categoria.toLowerCase(),
    precio,
    stock
  };
  return res.status(200).json(inventario[indice]);
});

// DELETE /instrumentos/:id -> Elimina un instrumento
app.delete('/instrumentos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = inventario.findIndex((item) => item.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: 'Instrumento no encontrado' });
  }
  const eliminado = inventario.splice(indice, 1)[0];
  return res.status(200).json(eliminado);
});

function resetInventario() {
  inventario = [
    { id: 1, nombre: 'Guitarra Acústica', categoria: 'cuerda', precio: 250, stock: 5 },
    { id: 2, nombre: 'Flauta Traversa', categoria: 'viento', precio: 180, stock: 3 },
    { id: 3, nombre: 'Batería Acústica', categoria: 'percusion', precio: 850, stock: 2 }
  ];
  siguienteId = 4;
}

module.exports = { app, resetInventario };
