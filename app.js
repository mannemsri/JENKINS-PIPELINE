const http = require('http');

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || 'dev';

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Jenkins CI/CD Demo</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f4f6fb; display: grid; place-items: center; height: 100vh; margin: 0; }
    .card { background: #fff; padding: 2rem 3rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.08); text-align: center; }
    .tag { display: inline-block; background: #d33833; color: #fff; padding: .25rem .75rem; border-radius: 999px; font-size: .85rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Deployed by Jenkins 🚀</h1>
    <p>Build / version: <span class="tag">${VERSION}</span></p>
  </div>
</body>
</html>`;

function handler(req, res) {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', version: VERSION }));
  }
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(page);
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = http.createServer(handler);

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`App (version ${VERSION}) listening on port ${PORT}`);
  });
}

module.exports = server;
