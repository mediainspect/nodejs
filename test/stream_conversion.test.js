const assert = require('assert');
const axios = require('axios');
const { spawn } = require('child_process');

describe('Stream Conversion Server', function() {
  let server;

  before(function(done) {
    server = spawn('node', ['media_server.js']);
    setTimeout(done, 1000); // Give server time to start
  });

  after(function() {
    server.kill();
  });

  it('should return 400 for missing parameters', async function() {
    try {
      await axios.get('http://localhost:3000/convert');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
      assert.strictEqual(error.response.data, 'Missing required parameters');
    }
  });

  it('should return 400 for unsupported protocols', async function() {
    try {
      await axios.get('http://localhost:3000/convert?input=test&inputProtocol=unsupported&outputProtocol=rtmp');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
      assert.strictEqual(error.response.data, 'Unsupported protocol');
    }
  });

  // Add more tests for successful conversions (these would require mock streams)
});
