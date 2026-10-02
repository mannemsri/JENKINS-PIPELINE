const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const server = require('../app');

let port;

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port, path }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      })
      .on('error', reject);
  });
}

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});

after(() => server.close());

test('GET /health returns status ok', async () => {
  const { status, body } = await get('/health');
  assert.strictEqual(status, 200);
  assert.strictEqual(JSON.parse(body).status, 'ok');
});

test('GET / returns the home page', async () => {
  const { status, body } = await get('/');
  assert.strictEqual(status, 200);
  assert.match(body, /Deployed by Jenkins/);
});

test('unknown route returns 404', async () => {
  const { status } = await get('/nope');
  assert.strictEqual(status, 404);
});
