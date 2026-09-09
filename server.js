const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Middleware: log every incoming request.
function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}

const routes = {
  '/': 'index.html',
  '/about': 'about.html',
  '/about.html': 'about.html'
};

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

function serve404(res) {
  const filePath = path.join(PUBLIC_DIR, '404.html');
  fs.readFile(filePath, (err, content) => {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(err ? '<h1>404 - Page Not Found</h1>' : content);
  });
}

function handleRequest(req, res) {
  logger(req, res, () => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const requestedPath = url.pathname;
    const fileName = routes[requestedPath] || requestedPath.replace(/^\//, '');

    // Only known pages and the shared stylesheet are allowed.
    if (!routes[requestedPath] && fileName !== 'style.css') {
      return serve404(res);
    }

    const filePath = path.join(PUBLIC_DIR, fileName);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[extension] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') return serve404(res);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('500 - Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

const server = http.createServer(handleRequest);

server.on('error', (err) => {
  console.error('Server error:', err.message);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
