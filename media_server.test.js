const request = require('supertest');
const app = require('./media_server');

describe('Media Server API', () => {
  let authToken;

  beforeAll(async () => {
    // Register a user
    await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' });

    // Login and get token
    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });

    authToken = loginResponse.body.token;
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: 'newuser', password: 'newpassword' });
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should login a user', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'testpassword' });
      expect(response.statusCode).toBe(200);
      expect(response.body.auth).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });

  describe('Media Operations', () => {
    it('should get media items with pagination', async () => {
      const response = await request(app)
        .get('/media')
        .set('x-access-token', authToken)
        .query({ page: 1, limit: 10 });
      expect(response.statusCode).toBe(200);
      expect(response.body.results).toBeDefined();
    });

    it('should create a new media item', async () => {
      const response = await request(app)
        .post('/media')
        .set('x-access-token', authToken)
        .send({ title: 'Test Media', type: 'video', url: 'http://example.com/test.mp4' });
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Media item created successfully');
    });

    // Add more tests for other endpoints (update, delete, convert, etc.)
  });
});
