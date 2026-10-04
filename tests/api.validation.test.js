const request = require('supertest');
const app = require('../src/app');

describe('Validaciones y Manejo de Errores en TaskFlow API', () => {
  describe('Health check & Rutas inexistentes', () => {
    test('GET /health responde 200 con status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('GET /api/inexistente responde 404 con error estructurado', async () => {
      const res = await request(app).get('/api/inexistente');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Validación de formato de ID (CastError -> 400)', () => {
    test('GET /api/users/:id con ID inválido responde 400', async () => {
      const res = await request(app).get('/api/users/id-no-valido-123');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/Formato de ID no válido/);
    });

    test('GET /api/teams/:id con ID inválido responde 400', async () => {
      const res = await request(app).get('/api/teams/id-no-valido-123');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/Formato de ID no válido/);
    });

    test('GET /api/tasks/:id con ID inválido responde 400', async () => {
      const res = await request(app).get('/api/tasks/id-no-valido-123');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/Formato de ID no válido/);
    });
  });

  describe('Validación de datos obligatorios en tareas', () => {
    test('POST /api/tasks sin campo team responde 400', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Tarea sin equipo' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/El campo team es obligatorio/);
    });
  });
});
