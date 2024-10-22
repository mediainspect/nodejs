
const dotenv = require('dotenv');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const winston = require('winston');

if (fs.existsSync('.env')) {
  dotenv.config();
} else {
  console.warn('.env file not found. Using default values.');
}

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Load environment variables
const PORT = process.env.PORT || 3000;
const MAX_PORT_ATTEMPTS = 10;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const CONVERTED_DIR = process.env.CONVERTED_DIR || 'converted';
const HOST = process.env.HOST || 'localhost';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'output';


// Ensure directories exist
[UPLOAD_DIR, CONVERTED_DIR, OUTPUT_DIR].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  logger.info(`Ensured directory exists: ${dir}`);
});

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

logger.info('Loaded protocols and file extensions');

const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Middleware to check user role
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

const app = express();
app.use(express.json());
// Initialize Express app

// Configure CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3006',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// Mock user database (replace with a real database in production)
const users = [];

// Mock media items (replace with a real database in production)
const mediaItems = [];


// Update user registration to include role
app.post('/register', async (req, res) => {
  logger.info('Received registration request', { username: req.body.username });
  const hashedPassword = bcrypt.hashSync(req.body.password, 8);

  const user = {
    id: users.length + 1,
    username: req.body.username,
    password: hashedPassword,
    role: ROLES.USER // Default role
  };
  users.push(user);


  logger.info('New user registered', { username: req.body.username });
  res.status(201).send({ message: 'User registered successfully' });
});


// User login endpoint
app.post('/login', (req, res) => {
  logger.info('Received login request', { username: req.body.username });
  const user = users.find(u => u.username === req.body.username);
  if (!user) {
    logger.warn('Login attempt failed: User not found', { username: req.body.username });
    return res.status(404).send('No user found.');
  }

  const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordIsValid) {
    logger.warn('Login attempt failed: Invalid password', { username: req.body.username });
    return res.status(401).send({ auth: false, token: null });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: 86400 // expires in 24 hours
  });

  logger.info('User logged in successfully', { username: req.body.username });
  res.status(200).send({ auth: true, token: token });
});
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    logger.warn('No token provided for authentication');
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.error('Failed to authenticate token', { error: err });
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
    req.userId = decoded.id;
    logger.info('Token verified successfully', { userId: req.userId });
    next();
  });
};

// Example of using role-based access control
app.delete('/media/:id', verifyToken, checkRole(ROLES.ADMIN), (req, res) => {
  // Delete media item logic
  // ...
});

// Apply verifyToken middleware to protected routes
app.use('/convert', verifyToken);
app.use('/media/operation', verifyToken);
app.use('/upload', verifyToken);

app.get('/convert', (req, res) => {
  const { input, inputProtocol, outputProtocol } = req.query;
  logger.info('Received convert request', { input, inputProtocol, outputProtocol });

  if (!input || !inputProtocol || !outputProtocol) {
    logger.warn('Convert request missing required parameters');
    return res.status(400).send('Missing required parameters');
  }

  const supportedProtocols = protocols.map(p => p.protocol.toLowerCase());

  if (!supportedProtocols.includes(inputProtocol.toLowerCase()) || !supportedProtocols.includes(outputProtocol.toLowerCase())) {
    logger.warn('Convert request with unsupported protocol', { inputProtocol, outputProtocol });
    return res.status(400).send('Unsupported protocol');
  }

  const outputFileName = `${Date.now()}_converted.${outputProtocol}`;
  const outputPath = path.join(OUTPUT_DIR, outputFileName);

  logger.info('Starting stream conversion', { input, inputProtocol, outputProtocol, outputPath });

  const ffmpeg = spawn('ffmpeg', [
    '-i', `${inputProtocol}:${input}`,
    '-c:v', process.env.FFMPEG_VIDEO_CODEC || 'libx264',
    '-c:a', process.env.FFMPEG_AUDIO_CODEC || 'aac',
    '-f', outputProtocol,
    outputPath
  ]);

  ffmpeg.stderr.on('data', (data) => {
    logger.error(`FFmpeg Error: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    if (code !== 0) {
      logger.error(`FFmpeg process exited with code ${code}`);
      res.status(500).send('Conversion failed');
    } else {
      logger.info('Stream conversion completed successfully');
      res.json({ message: 'Conversion successful', fileName: outputFileName });
    }
  });
});

// New endpoint for generic media operations
app.post('/media/operation', (req, res) => {
  const { operation, input, params } = req.body;
  logger.info('Received media operation request', { operation, input, params });

  if (!operation || !input) {
    logger.warn('Media operation request missing required parameters');
    return res.status(400).send('Missing required parameters');
  }

  if (!mediaOperations[operation]) {
    logger.warn('Unsupported media operation requested', { operation });
    return res.status(400).send('Unsupported operation');
  }

  try {
    logger.info(`Performing media operation: ${operation}`, { input, params });
    const result = mediaOperations[operation](input, ...params);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Error performing media operation', { operation, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

const { execSync } = require('child_process');

function getDuration(inputPath) {
  try {
    const output = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`);
    return parseFloat(output.toString());
  } catch (error) {
    console.error('Error getting video duration:', error);
    return null;
  }
}



// New endpoint for file upload with on-the-fly conversion
app.post('/upload', upload.single('file'), (req, res) => {
  logger.info('Received file upload request');
  if (!req.file) {
    logger.warn('Upload request without file');
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const { outputFormat } = req.body;
  if (!outputFormat) {
    logger.warn('Upload request without output format');
    return res.status(400).json({ error: 'Output format not specified.' });
  }

  const inputPath = req.file.path;
  const outputFileName = path.basename(inputPath, path.extname(inputPath)) + '.' + outputFormat;
  const outputPath = path.join(CONVERTED_DIR, outputFileName);

  logger.info('Starting file conversion', { inputPath, outputPath, outputFormat });

  const ffmpeg = spawn('ffmpeg', [
    '-i', inputPath,
    '-c:v', 'mpeg4',
    '-c:a', 'aac',
    '-q:v', '1',
    outputPath
  ]);

  let progress = 0;
  // Use this function before starting the conversion
  const duration = getDuration(inputPath);
  if (duration === null) {
    console.error('Unable to determine video duration. Aborting conversion.');
    // Handle the error appropriately (e.g., send an error response, return from the function)
    return;
  }

  ffmpeg.stderr.on('data', (data) => {
    // Parse ffmpeg output to estimate progress
    const match = data.toString().match(/time=(\d{2}):(\d{2}):(\d{2}.\d{2})/);
    if (match) {
      const time = parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
      progress = Math.round((time / duration) * 100);
      io.emit('conversionProgress', { filename: outputFileName, progress });
    }
  });


  ffmpeg.on('close', (code) => {
    if (code === 0) {
      logger.info('File conversion completed successfully', { outputFileName });
      res.json({
        message: 'File uploaded and converted successfully',
        originalName: req.file.originalname,
        convertedName: outputFileName
      });
    } else {
      logger.error('File conversion failed', { code, ffmpegLogs });
      res.status(500).json({ error: 'Conversion failed', details: ffmpegLogs });
    }

    // Clean up the original uploaded file
    fs.unlink(inputPath, (err) => {
      if (err) {
        logger.error('Error cleaning up original file', { error: err, inputPath });
      } else {
        logger.info('Cleaned up original uploaded file', { inputPath });
      }
    });
  });
});

app.post('/batch-operation', verifyToken, async (req, res) => {
  const { operation, files } = req.body;

  if (!operation || !files || !Array.isArray(files)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    const results = await Promise.all(files.map(file => performOperation(operation, file)));
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Batch operation failed', error: error.message });
  }
});

function performOperation(operation, file) {
  // Implement the logic for different operations (e.g., convert, delete, etc.)
  // Return a promise that resolves with the result of the operation
}



// Input validation middleware
const validateMediaItem = [
  body('title').isString().notEmpty().trim(),
  body('type').isIn(['audio', 'video']),
  body('url').isURL(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Invalid media item data', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Example route for creating a media item with validation
app.post('/media', verifyToken, validateMediaItem, (req, res) => {
  logger.info('Creating new media item', { title: req.body.title, type: req.body.type });
  // Create media item logic here
  res.status(201).json({ message: 'Media item created successfully' });
});

// Example route for updating a media item with validation
app.put('/media/:id', verifyToken, validateMediaItem, (req, res) => {
  logger.info('Updating media item', { id: req.params.id, title: req.body.title, type: req.body.type });
  // Update media item logic here
  res.json({ message: 'Media item updated successfully' });
});

// GET /media endpoint with pagination
app.get('/media', verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  logger.info('Fetching media items', { page, limit });

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

  logger.info('Media items retrieved', { page, limit, itemCount: results.results.length });
  res.json(results);
});

// New endpoint to list converted files
app.get('/files', (req, res) => {
  logger.info('Fetching list of converted files');
  fs.readdir(OUTPUT_DIR, (err, files) => {
    if (err) {
      logger.error('Error reading output directory', { error: err });
      return res.status(500).send('Error reading files');
    }
    const fileList = files.map(file => ({
      name: file,
      url: `/download/${file}`
    }));
    logger.info('File list retrieved', { fileCount: fileList.length });
    res.json(fileList);
  });
});

// New endpoint to download converted files
app.get('/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(OUTPUT_DIR, fileName);

  logger.info('Received file download request', { fileName });

  if (fs.existsSync(filePath)) {
    logger.info('File found, initiating download', { fileName });
    res.download(filePath);
  } else {
    logger.warn('File not found for download', { fileName });
    res.status(404).send('File not found');
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'app/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/build', 'index.html'));
});

const server = http.createServer(app);
const io = socketIo(server);

server.listen(PORT, () => {
  logger.info(`Media server running at http://${HOST}:${PORT}`);
  logger.info(`CORS enabled for origin: ${corsOptions.origin}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use.`);
    if (attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      logger.info(`Trying port ${nextPort}`);
      startServer(nextPort, attempt + 1);
    } else {
      logger.error(`Failed to find an available port after ${MAX_PORT_ATTEMPTS} attempts.`);
      process.exit(1);
    }
  } else {
    logger.error('An error occurred while starting the server:', err);
    process.exit(1);
  }
});
