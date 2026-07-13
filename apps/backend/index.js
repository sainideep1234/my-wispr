'use strict';

const http = require('http');
const { WebSocketServer } = require('ws');
const { PassThrough } = require('stream');
const { createWisprStream } = require('my-wispr-npm');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'my-wispr-server' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const clientId = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
  console.log(`[my-wispr-server] Client connected: ${clientId}`);

  const pcmStream = new PassThrough();

  const wispr = createWisprStream({
    stream: pcmStream,
    model: process.env.WISPR_MODEL_NAME || 'base.en',
    windowChunks: 2,
    stepChunks: 1,
  });

  wispr.on('transcription', (text) => {
    console.log(`[${clientId}] → ${text}`);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'transcription', text }));
    }
  });

  wispr.on('error', (err) => {
    console.error(`[${clientId}] Wispr error:`, err.message);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
    }
  });

  wispr.on('start', () => {
    console.log(`[${clientId}] Transcription started`);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'ready' }));
    }
  });

  ws.on('message', (data) => {
    if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
      pcmStream.write(Buffer.from(data));
    }
  });

  ws.on('close', () => {
    console.log(`[my-wispr-server] Client disconnected: ${clientId}`);
    wispr.stop();
    pcmStream.destroy();
  });

  ws.on('error', (err) => {
    console.error(`[my-wispr-server] WebSocket error from ${clientId}:`, err.message);
    wispr.stop();
    pcmStream.destroy();
  });

  try {
    wispr.start();
  } catch (err) {
    console.error('[my-wispr-server] Failed to start wispr:', err.message);
    ws.send(JSON.stringify({ type: 'error', message: err.message }));
    ws.close();
  }
});

server.listen(PORT, () => {
  console.log(`[my-wispr-server] WebSocket transcription server running on ws://localhost:${PORT}`);
  console.log(`[my-wispr-server] Health check: http://localhost:${PORT}/health`);
  console.log('[my-wispr-server] Waiting for browser connections...');
});

process.on('SIGINT', () => {
  console.log('\n[my-wispr-server] Shutting down...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
