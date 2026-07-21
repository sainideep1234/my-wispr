import EventEmitter from 'events';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SAMPLE_RATE = 16000;
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = 2;
const CHUNK_MS = 20;

const BYTES_PER_CHUNK = (SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE * CHUNK_MS) / 1000;

function buildWavHeader(pcmLength) {
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + pcmLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(NUM_CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE, 28);
  buffer.writeUInt16LE(NUM_CHANNELS * BYTES_PER_SAMPLE, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(pcmLength, 40);
  return buffer;
}

function resolveWhisperPaths(opts) {
  const model = opts.model || 'base.en';
  const pkgDir = join(__dirname, '..');

  // Prefer monorepo shared whisper.cpp when developing inside this repo
  const monorepoRootWhisper = join(pkgDir, '..', '..', '..', 'packages', 'whisper.cpp');
  let whisperDir = join(pkgDir, 'whisper.cpp');
  if (existsSync(monorepoRootWhisper)) {
    whisperDir = monorepoRootWhisper;
  }

  const resolvedBin =
    opts.whisperBin || process.env.WISPR_BIN || join(whisperDir, 'main');

  const resolvedModel =
    opts.modelPath ||
    process.env.WISPR_MODEL ||
    join(whisperDir, 'models', 'ggml-' + model + '.bin');

  return { resolvedBin, resolvedModel, whisperDir };
}

function runWhisperProcess(chunks, resolvedBin, resolvedModel) {
  return new Promise((resolve) => {
    const pcmData = Buffer.concat(chunks);
    const wavHeader = buildWavHeader(pcmData.length);
    const fullWavData = Buffer.concat([wavHeader, pcmData]);

    const proc = spawn(resolvedBin, ['-m', resolvedModel, '-f', '-', '-nt'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      const text = stdout.trim();
      if (code !== 0 && stderr) {
        process.stderr.write('[wispr-core whisper stderr] ' + stderr.slice(0, 300) + '\n');
      }
      if (text && !text.includes('[BLANK_AUDIO]')) {
        resolve(text);
      } else {
        resolve(null);
      }
    });

    proc.on('error', (err) => {
      process.stderr.write('[wispr-core spawn error] ' + err.message + '\n');
      resolve(null);
    });

    proc.stdin.write(fullWavData, (writeErr) => {
      if (writeErr) {
        process.stderr.write('[wispr-core stdin] ' + writeErr.message + '\n');
      }
      proc.stdin.end();
    });
  });
}

/**
 * createWisprStream — core transcription engine.
 *
 * Accepts any Node.js Readable of raw 16-bit LE mono PCM at 16 kHz.
 * Wire it from a WebSocket PassThrough, a local mic stream, a VS Code
 * extension host buffer, etc. — the core does not know or care.
 *
 * @param {object} opts
 * @param {import('stream').Readable} opts.stream  — PCM audio source (required)
 * @param {string}  [opts.model]        — whisper model name, e.g. 'base.en'
 * @param {number}  [opts.windowChunks] — window size in 20ms chunks (default 2)
 * @param {number}  [opts.stepChunks]   — slide step in 20ms chunks (default 1)
 * @param {string}  [opts.whisperBin]   — override path to whisper.cpp binary
 * @param {string}  [opts.modelPath]    — override path to .bin model file
 * @param {function} [opts.onTranscription] — shorthand event handler
 * @param {function} [opts.onError]         — shorthand event handler
 */
function createWisprStream(opts = {}) {
  if (!opts.stream) {
    throw new TypeError('[wispr-core] opts.stream is required — pass a Node.js Readable of raw PCM');
  }

  const inputStream = opts.stream;
  const windowChunks = opts.windowChunks !== undefined ? opts.windowChunks : 2;
  const stepChunks = opts.stepChunks !== undefined ? opts.stepChunks : 1;

  if (windowChunks < 1) throw new Error('windowChunks must be >= 1');
  if (stepChunks < 1) throw new Error('stepChunks must be >= 1');
  if (stepChunks > windowChunks) throw new Error('stepChunks must be <= windowChunks');

  const emitter = new EventEmitter();

  if (typeof opts.onTranscription === 'function') emitter.on('transcription', opts.onTranscription);
  if (typeof opts.onError === 'function') emitter.on('error', opts.onError);

  const chunkQueue = [];
  let isProcessing = false;
  let started = false;
  const { resolvedBin, resolvedModel } = resolveWhisperPaths(opts);

  async function processQueue() {
    if (isProcessing) return;
    if (chunkQueue.length < windowChunks) return;

    isProcessing = true;

    try {
      while (chunkQueue.length >= windowChunks) {
        const window = chunkQueue.slice(0, windowChunks);
        const text = await runWhisperProcess(window, resolvedBin, resolvedModel);
        if (text) {
          emitter.emit('transcription', text);
        }
        chunkQueue.splice(0, stepChunks);
        await new Promise((r) => setImmediate(r));
      }
    } catch (err) {
      emitter.emit('error', err);
    } finally {
      isProcessing = false;
    }
  }

  function start() {
    if (started) throw new Error('[wispr-core] Already started. Call stop() first.');

    if (!existsSync(resolvedBin)) {
      throw new Error(
        '[wispr-core] whisper binary not found at: ' +
          resolvedBin +
          '\n  Run: npx my-wispr-setup' +
          '\n  Or set WISPR_BIN=/path/to/whisper-cli',
      );
    }

    if (!existsSync(resolvedModel)) {
      throw new Error(
        '[wispr-core] whisper model not found at: ' +
          resolvedModel +
          '\n  Run: npx my-wispr-setup' +
          '\n  Or set WISPR_MODEL=/path/to/ggml-base.en.bin',
      );
    }

    started = true;
    let leftover = Buffer.alloc(0);

    inputStream.on('data', (rawBuffer) => {
      const combined = Buffer.concat([leftover, rawBuffer]);
      let offset = 0;

      while (offset + BYTES_PER_CHUNK <= combined.length) {
        chunkQueue.push(combined.slice(offset, offset + BYTES_PER_CHUNK));
        offset += BYTES_PER_CHUNK;
      }

      leftover = combined.slice(offset);
      processQueue();
    });

    inputStream.on('error', (err) => {
      emitter.emit('error', err);
    });

    inputStream.on('end', () => {
      started = false;
      emitter.emit('stop');
    });

    emitter.emit('start');
  }

  function stop() {
    if (!started) return;
    started = false;
    chunkQueue.length = 0;
    isProcessing = false;

    try {
      if (typeof inputStream.destroy === 'function') inputStream.destroy();
    } catch (_) {}

    emitter.emit('stop');
  }

  return {
    start,
    stop,
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter),
  };
}

export { createWisprStream, resolveWhisperPaths };
