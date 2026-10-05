/**
 * OneRoute — Backend Integration Server
 * Serves frontend client files from ../client and exposes the NLP Triage API
 * 
 * Zero external dependencies: uses built-in Node.js modules.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { analyzeStudentNeeds } = require('./triageService.js');

const PORT = process.env.PORT || 3000;
const CLIENT_DIR = path.resolve(__dirname, '../client');

// In-memory cases and analyses stores for API synchronization
let casesStore = [];
let analysesStore = {};

// MIME type map for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // CORS headers for local demo flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // API 1: NLP Triage analysis endpoint
  if (pathname === '/api/triage' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const text = payload.text || payload.studentInput || '';
        const analysis = await analyzeStudentNeeds(text);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(analysis));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API 2: Cases list and creation
  if (pathname === '/api/cases') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ cases: casesStore, analyses: analysesStore }));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newCase = JSON.parse(body || '{}');
          if (newCase && newCase.id) {
            casesStore.unshift(newCase);
            if (newCase.analysis) {
              analysesStore[newCase.id] = newCase.analysis;
            }
          }
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, case: newCase }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  // API 3: Update case status
  if (pathname.startsWith('/api/cases/') && req.method === 'PATCH') {
    const caseId = pathname.replace('/api/cases/', '');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const found = casesStore.find(c => c.id === caseId);
        if (found && payload.status) {
          found.status = payload.status;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, case: found }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static file serving from client/ folder
  let relPath = pathname;
  if (relPath.startsWith('/client/')) {
    relPath = relPath.slice(7);
  }
  if (relPath === '' || relPath === '/') {
    relPath = '/index.html';
  }
  if (!relPath.startsWith('/')) {
    relPath = '/' + relPath;
  }
  let filePath = path.join(CLIENT_DIR, relPath);

  // Security check: ensure path is within CLIENT_DIR
  if (!filePath.startsWith(CLIENT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` OneRoute — Student Wellbeing & Triage Server`);
  console.log(` "One place to start. The right support."`);
  console.log(` Running at: http://localhost:${PORT}`);
  console.log(` - Client Directory: ${CLIENT_DIR}`);
  console.log(` - Student Portal:   http://localhost:${PORT}/student.html`);
  console.log(` - Staff Console:    http://localhost:${PORT}/admin.html`);
  console.log(` - Login / Gateway:  http://localhost:${PORT}/login.html`);
  console.log(`=======================================================`);
});