const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
//const dotenv = require('dotenv');

//dotenv.config();

const server = express();

// CORS configuration
server.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing for JSON
server.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// File upload endpoint (if you need it)
server.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
    size: req.file.size
  });
});

// Serve static files from uploads directory
server.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache for 1 day
  etag: true
}));

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Upload Server' });
});

// Handle 404 for non-existent files
server.use((req, res) => {
  res.status(404).json({ error: 'File not found' });
});

// Error handling
server.use((error, req, res, next) => {
  console.error('Upload server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.UPLOADS_PORT || 3002;

server.listen(PORT, () => {
  console.log(`Upload server ready on ${process.env.BACKEND_URL || 'http://localhost'}:${PORT}`);
});