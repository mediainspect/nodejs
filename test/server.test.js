const assert = require('assert');
const { spawn } = require('child_process');
const axios = require('axios');

describe('Media Processing Servers', function() {
  let streamServer, fileServer;

  before(function(done) {
    streamServer = spawn('node', ['media_server.js']);
    fileServer = spawn('node', ['media_converter_server.js']);
    setTimeout(done, 1000); // Give servers time to start
  });

  after(function() {
    streamServer.kill();
    fileServer.kill();
  });

  it('should start the stream conversion server', async function() {
    const response = await axios.get('http://localhost:3000');
    assert.strictEqual(response.status, 200);
  });

  it('should start the file conversion server', async function() {
    const response = await axios.get('http://localhost:3001');
    assert.strictEqual(response.status, 200);
  });

  // Add more specific tests for each server's functionality
});
