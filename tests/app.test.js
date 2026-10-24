const request = require('supertest');
const { app, resetInventario } = require('../src/app');

beforeEach(() => {
  resetInventario();
});

describe('API REST de Inventario de Instrumentos Musicales', () => {
  test('1. GET /health devuelve el estado del servicio y versión', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', version: '1.0.0' });
  });

  test('2. GET /instrumentos lista todo el inventario y permite filtrar por ?categoria=', async () => {
    const todos = await request(app).get('/instrumentos');
    expect(todos.statusCode).toBe(200);
    expect(todos.body).toHaveLength(3);

    const cuerda = await request(app).get('/instrumentos?categoria=cuerda');
    expect(cuerda.statusCode).toBe(200);
    expect(cuerda.body).toHaveLength(1);
    expect(cuerda.body[0].nombre).toBe('Guitarra Acústica');
  });

  test('3. GET /instrumentos/:id obtiene un instrumento existente o devuelve 404 si no existe', async () => {
    const ok = await request(app).get('/instrumentos/1');
    expect(ok.statusCode).toBe(200);
    expect(ok.body.nombre).toBe('Guitarra Acústica');

    const noExiste = await request(app).get('/instrumentos/999');
    expect(noExiste.statusCode).toBe(404);
  });

  test('4. POST /instrumentos crea un nuevo instrumento válido', async () => {
    const nuevo = {
      nombre: 'Piano Digital',
      categoria: 'teclado',
      precio: 620,
      stock: 4
    };
    const res = await request(app).post('/instrumentos').send(nuevo);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(4);
    expect(res.body.nombre).toBe('Piano Digital');
  });

  test('5. POST /instrumentos rechaza datos de entrada inválidos con 400', async () => {
    const invalido = {
      nombre: '',
      categoria: 'invalida',
      precio: -10,
      stock: -1
    };
    const res = await request(app).post('/instrumentos').send(invalido);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('6. PUT /instrumentos/:id actualiza un instrumento y valida errores 400 y 404', async () => {
    const actualizado = {
      nombre: 'Guitarra Clásica Pro',
      categoria: 'cuerda',
      precio: 300,
      stock: 6
    };
    const ok = await request(app).put('/instrumentos/1').send(actualizado);
    expect(ok.statusCode).toBe(200);
    expect(ok.body.nombre).toBe('Guitarra Clásica Pro');

    const badReq = await request(app).put('/instrumentos/1').send({ nombre: '' });
    expect(badReq.statusCode).toBe(400);

    const notFound = await request(app).put('/instrumentos/999').send(actualizado);
    expect(notFound.statusCode).toBe(404);
  });

  test('7. DELETE /instrumentos/:id elimina un instrumento existente o devuelve 404', async () => {
    const ok = await request(app).delete('/instrumentos/2');
    expect(ok.statusCode).toBe(200);
    expect(ok.body.id).toBe(2);

    const notFound = await request(app).delete('/instrumentos/999');
    expect(notFound.statusCode).toBe(404);
  });
});
