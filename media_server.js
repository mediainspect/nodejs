require('dotenv').config();
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

// Load environment variables
const PORT = process.env.STREAM_SERVER_PORT || 3000;
const MAX_PORT_ATTEMPTS = 10;

app.use(express.json());

// Load protocols and file extensions
const protocols = JSON.parse(fs.readFileSync('media_protocols.json', 'utf8'));
const fileExtensions = JSON.parse(fs.readFileSync('media_file_extensions.json', 'utf8'));

// Generic media operations
const mediaOperations = {
  convert: (input, inputFormat, outputFormat) => {
    // Implementation for converting media formats
  },
  transcode: (input, outputCodec) => {
    // Implementation for transcoding media
  },
  extractAudio: (input, output) => {
    // Implementation for extracting audio from video
  },
  extractMetadata: (input) => {
    // Implementation for extracting metadata from media files
  }
};

app.get('/convert', (req, res) => {
  const { input, inputProtocol, outputProtocol } = req.query;

  if (!input || !inputProtocol || !outputProtocol) {
    return res.status(400).send('Missing required parameters');
  }

  const supportedProtocols = protocols.map(p => p.protocol.toLowerCase());

  if (!supportedProtocols.includes(inputProtocol.toLowerCase()) || !supportedProtocols.includes(outputProtocol.toLowerCase())) {
    return res.status(400).send('Unsupported protocol');
  }

  const ffmpeg = spawn('ffmpeg', [
    '-i', `${inputProtocol}:${input}`,
    '-c:v', process.env.FFMPEG_VIDEO_CODEC || 'libx264',
    '-c:a', process.env.FFMPEG_AUDIO_CODEC || 'aac',
    '-f', outputProtocol,
    'pipe:1'
  ]);

  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg Error: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    if (code !== 0) {
      console.error(`FFmpeg process exited with code ${code}`);
      if (!res.headersSent) {
        res.status(500).send('Conversion failed');
      }
    }
  });
});

// New endpoint for generic media operations
app.post('/media/operation', (req, res) => {
  const { operation, input, params } = req.body;

  if (!operation || !input) {
    return res.status(400).send('Missing required parameters');
  }

  if (!mediaOperations[operation]) {
    return res.status(400).send('Unsupported operation');
  }

  try {
    const result = mediaOperations[operation](input, ...params);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function startServer(port, attempt = 1) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
      if (attempt < MAX_PORT_ATTEMPTS) {
        const nextPort = port + 1;
        console.log(`Trying port ${nextPort}`);
        startServer(nextPort, attempt + 1);
      } else {
        console.error(`Failed to find an available port after ${MAX_PORT_ATTEMPTS} attempts.`);
        process.exit(1);
      }
    } else {
      console.error('An error occurred while starting the server:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);
