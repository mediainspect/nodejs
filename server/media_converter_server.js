const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ 
  dest: process.env.UPLOAD_DIR || 'uploads/',
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100000000 } 
});
const port = process.env.FILE_SERVER_PORT || 3001;

app.post('/convert', upload.single('file'), (req, res) => {
  const { file } = req;
  const outputFormat = req.body.outputFormat;
  const outputPath = path.join(process.env.CONVERTED_DIR || 'converted', `${file.filename}.${outputFormat}`);

  const ffmpeg = spawn('ffmpeg', [
    '-i', file.path,
    '-c:v', process.env.FFMPEG_VIDEO_CODEC || 'libx264',
    '-c:a', process.env.FFMPEG_AUDIO_CODEC || 'aac',
    outputPath
  ]);

  ffmpeg.on('close', (code) => {
    if (code === 0) {
      res.download(outputPath, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up temporary files
        fs.unlinkSync(file.path);
        fs.unlinkSync(outputPath);
      });
    } else {
      res.status(500).send('Conversion failed');
    }
  });
});

app.listen(port, () => {
  console.log(`Media converter server listening at http://localhost:${port}`);
});
