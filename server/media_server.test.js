require('dotenv').config();
const request = require('supertest');
const app = require('./media_server');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const baseURL = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`;

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

    it('should convert a stream', async () => {
      const response = await request(app)
        .get('/convert')
        .set('x-access-token', authToken)
        .query({
          input: 'http://example.com/test.mp4',
          inputProtocol: 'http',
          outputProtocol: 'rtmp'
        });
      expect(response.statusCode).toBe(200);
    });

    it('should perform a media operation', async () => {
      const response = await request(app)
        .post('/media/operation')
        .set('x-access-token', authToken)
        .send({
          operation: 'convert',
          input: 'input.mp4',
          params: ['output.avi']
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should upload and convert a file', async () => {
      const testFilePath = path.join(__dirname, 'test_files', 'test_video.mp4');
      const response = await request(app)
        .post('/upload')
        .set('x-access-token', authToken)
        .attach('file', testFilePath)
        .field('outputFormat', 'avi');
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('File uploaded and converted successfully');
    });
  });

  describe('Configuration', () => {
    it('should load protocols from the correct JSON file', () => {
      const protocols = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.PROTOCOLS_JSON_PATH), 'utf8'));
      expect(protocols).toBeDefined();
      expect(Array.isArray(protocols)).toBe(true);
    });

    it('should load file extensions from the correct JSON file', () => {
      const fileExtensions = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.FILE_EXTENSIONS_JSON_PATH), 'utf8'));
      expect(fileExtensions).toBeDefined();
      expect(Array.isArray(fileExtensions)).toBe(true);
    });
  });

  test('GET /api/media returns a list of media files', async () => {
    const response = await axios.get(`${baseURL}/api/media`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
