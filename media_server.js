require('dotenv').config();
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const app = express();

// Load environment variables
const PORT = process.env.STREAM_SERVER_PORT || 3000;
const MAX_PORT_ATTEMPTS = 10;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const CONVERTED_DIR = process.env.CONVERTED_DIR || 'converted';

app.use(express.json());

// Ensure upload and converted directories exist
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(CONVERTED_DIR, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Load protocols and file extensions
const protocols = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.PROTOCOLS_JSON_PATH), 'utf8'));
const fileExtensions = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.FILE_EXTENSIONS_JSON_PATH), 'utf8'));

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

// Mock user database (replace with a real database in production)
const users = [];

// Mock media items (replace with a real database in production)
const mediaItems = [];

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
};

// User registration endpoint
app.post('/register', (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 8);
  
  users.push({
    id: users.length + 1,
    username: req.body.username,
    password: hashedPassword
  });
  
  res.status(201).send({ message: 'User registered successfully' });
});

// User login endpoint
app.post('/login', (req, res) => {
  const user = users.find(u => u.username === req.body.username);
  if (!user) return res.status(404).send('No user found.');
  
  const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
  
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: 86400 // expires in 24 hours
  });
  
  res.status(200).send({ auth: true, token: token });
});

// Apply verifyToken middleware to protected routes
app.use('/convert', verifyToken);
app.use('/media/operation', verifyToken);
app.use('/upload', verifyToken);

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

// New endpoint for file upload with on-the-fly conversion
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { outputFormat } = req.body;
  if (!outputFormat) {
    return res.status(400).send('Output format not specified.');
  }

  const inputPath = req.file.path;
  const outputFileName = path.basename(inputPath, path.extname(inputPath)) + '.' + outputFormat;
  const outputPath = path.join(CONVERTED_DIR, outputFileName);

  const ffmpeg = spawn('ffmpeg', [
    '-i', inputPath,
    '-c:v', process.env.FFMPEG_VIDEO_CODEC || 'libx264',
    '-c:a', process.env.FFMPEG_AUDIO_CODEC || 'aac',
    outputPath
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg Error: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    if (code === 0) {
      res.json({
        message: 'File uploaded and converted successfully',
        originalName: req.file.originalname,
        convertedName: outputFileName
      });
    } else {
      res.status(500).send('Conversion failed');
    }

    // Clean up the original uploaded file
    fs.unlinkSync(inputPath);
  });
});

// Input validation middleware
const validateMediaItem = [
  body('title').isString().notEmpty().trim(),
  body('type').isIn(['audio', 'video']),
  body('url').isURL(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Example route for creating a media item with validation
app.post('/media', verifyToken, validateMediaItem, (req, res) => {
  // Create media item logic here
  res.status(201).json({ message: 'Media item created successfully' });
});

// Example route for updating a media item with validation
app.put('/media/:id', verifyToken, validateMediaItem, (req, res) => {
  // Update media item logic here
  res.json({ message: 'Media item updated successfully' });
});

// GET /media endpoint with pagination
app.get('/media', verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (endIndex < mediaItems.length) {
    results.next = {
      page: page + 1,
      limit: limit
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit
    };
  }

  results.results = mediaItems.slice(startIndex, endIndex);

  res.json(results);
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
