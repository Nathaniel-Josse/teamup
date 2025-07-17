const express = require('express');
const next = require('next');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = next({ dev: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // ✅ Serve the uploads folder statically
  server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Handle everything else with Next.js
  server.all('', (req, res) => {
    return handle(req, res);
  });

  server.listen(process.env.UPLOADS_PORT, () => {
    console.log(`> Ready on ${process.env.BACKEND_URL || 'http://localhost'}:${process.env.UPLOADS_PORT}`);
  });
});