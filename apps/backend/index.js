import { createWisprServer } from 'my-wispr-npm/server';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const host = process.env.HOST || '0.0.0.0';

const windowChunks = process.env.WISPR_WINDOW_CHUNKS
  ? parseInt(process.env.WISPR_WINDOW_CHUNKS, 10)
  : undefined;

const stepChunks = process.env.WISPR_STEP_CHUNKS
  ? parseInt(process.env.WISPR_STEP_CHUNKS, 10)
  : undefined;

const server = createWisprServer({
  port,
  host,
  model: process.env.WISPR_MODEL_NAME || 'base.en',
  windowChunks,
  stepChunks,
  whisperBin: process.env.WISPR_BIN,
  modelPath: process.env.WISPR_MODEL,
});

server.on('listening', ({ port: p, host: h }) => {
  console.log(`[my-wispr-server] WebSocket transcription on ws://${h === '0.0.0.0' ? 'localhost' : h}:${p}`);
});

server.on('connection', () => {
  console.log('[my-wispr-server] Client connected');
});

server.on('transcription', ({ text }) => {
  if (process.env.LOG_TRANSCRIPTS !== 'false') {
    console.log(`[Transcription] ${text}`);
  }
});

server.on('error', (err) => {
  console.error('[my-wispr-server]', err.message);
});

try {
  await server.listen();
} catch (err) {
  console.error('[my-wispr-server] Failed to start:', err.message);
  process.exit(1);
}

process.on('SIGINT', async () => {
  console.log('\n[my-wispr-server] Shutting down...');
  await server.close();
  process.exit(0);
});
