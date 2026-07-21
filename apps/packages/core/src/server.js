import EventEmitter from 'events';
import http from 'http';
import { createRequire } from 'module';
import { PassThrough } from 'stream';
import { createWisprStream } from './index.js';

const require = createRequire(import.meta.url);

function loadWs() {
  try {
    return require('ws');
  } catch {
    throw new Error(
      '[my-wispr] Peer dependency "ws" is required for createWisprServer.\n' +
        '  Install it: npm install ws',
    );
  }
}

/**
 * createWisprServer — optional WebSocket SaaS helper.
 *
 * Each client connection gets an isolated createWisprStream instance.
 * Browser / webview sends raw 16-bit LE PCM @ 16 kHz mono; server replies
 * with JSON `{ type: 'transcription', text }` (unless autoReply is false).
 *
 * @param {object} opts
 * @param {number}  [opts.port=8080]
 * @param {string}  [opts.host='0.0.0.0']
 * @param {string}  [opts.path]           — WebSocket path filter
 * @param {import('http').Server} [opts.server] — reuse an existing HTTP server
 * @param {boolean} [opts.autoReply=true] — send transcription/error JSON to client
 * @param {string}  [opts.model]
 * @param {number}  [opts.windowChunks]
 * @param {number}  [opts.stepChunks]
 * @param {string}  [opts.whisperBin]
 * @param {string}  [opts.modelPath]
 */
function createWisprServer(opts = {}) {
  const { WebSocketServer } = loadWs();
  const emitter = new EventEmitter();

  const port = opts.port !== undefined ? opts.port : 8080;
  const host = opts.host !== undefined ? opts.host : '0.0.0.0';
  const autoReply = opts.autoReply !== false;

  const httpServer = opts.server || http.createServer();
  const wssOptions = { server: httpServer };
  if (opts.path) wssOptions.path = opts.path;

  const wss = new WebSocketServer(wssOptions);
  const sessions = new Set();

  const streamOpts = {
    model: opts.model,
    windowChunks: opts.windowChunks,
    stepChunks: opts.stepChunks,
    whisperBin: opts.whisperBin,
    modelPath: opts.modelPath,
  };

  wss.on('connection', (ws, req) => {
    const pcmStream = new PassThrough();
    const wispr = createWisprStream({
      ...streamOpts,
      stream: pcmStream,
    });

    const session = { ws, wispr, pcmStream };
    sessions.add(session);

    wispr.on('transcription', (text) => {
      if (autoReply && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'transcription', text }));
      }
      emitter.emit('transcription', { ws, text });
    });

    wispr.on('error', (err) => {
      if (autoReply && ws.readyState === 1) {
        try {
          ws.send(JSON.stringify({ type: 'error', message: err.message }));
        } catch (_) {}
      }
      emitter.emit('sessionError', { ws, error: err });
      emitter.emit('error', err);
    });

    ws.on('message', (data) => {
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
      if (!pcmStream.destroyed) pcmStream.write(buf);
    });

    const cleanup = () => {
      sessions.delete(session);
      try {
        wispr.stop();
      } catch (_) {}
      try {
        if (!pcmStream.destroyed) pcmStream.destroy();
      } catch (_) {}
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);

    try {
      wispr.start();
    } catch (err) {
      emitter.emit('error', err);
      cleanup();
      try {
        ws.close();
      } catch (_) {}
      return;
    }

    emitter.emit('connection', { ws, wispr, req });
  });

  function listen(listenPort = port, listenHost = host) {
    return new Promise((resolve, reject) => {
      const onError = (err) => {
        httpServer.off('listening', onListening);
        reject(err);
      };
      const onListening = () => {
        httpServer.off('error', onError);
        const address = httpServer.address();
        const info = {
          port: typeof address === 'object' && address ? address.port : listenPort,
          host: listenHost,
        };
        emitter.emit('listening', info);
        resolve(info);
      };

      httpServer.once('error', onError);
      httpServer.once('listening', onListening);
      httpServer.listen(listenPort, listenHost);
    });
  }

  function close() {
    for (const session of sessions) {
      try {
        session.wispr.stop();
      } catch (_) {}
      try {
        if (!session.pcmStream.destroyed) session.pcmStream.destroy();
      } catch (_) {}
      try {
        session.ws.close();
      } catch (_) {}
    }
    sessions.clear();

    return new Promise((resolve) => {
      wss.close(() => {
        if (opts.server) {
          resolve();
          return;
        }
        httpServer.close(() => resolve());
      });
    });
  }

  return {
    httpServer,
    wss,
    listen,
    close,
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter),
  };
}

export { createWisprServer };
