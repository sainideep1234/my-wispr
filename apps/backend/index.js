'use strict';

const portAudio = require('naudiodon2p');
const { spawn } = require('child_process');
const { join } = require('path');

const SAMPLE_RATE = 16000;
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;

const CHUNK_MS = 20;
const WINDOW_CHUNKS = 2;
const STEP_CHUNKS = 1;

const BYTES_PER_CHUNK = (SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE * CHUNK_MS) / 1000;

const chunkQueue = [];
let isProcessing = false;

function buildWavHeader(pcmByteLength) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmByteLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(NUM_CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE, 28);
  header.writeUInt16LE(NUM_CHANNELS * BYTES_PER_SAMPLE, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmByteLength, 40);
  return header;
}

function runWhisperOnWindow(chunks) {
  const pcm = Buffer.concat(chunks);
  const wav = Buffer.concat([buildWavHeader(pcm.length), pcm]);

  return new Promise((resolve) => {
    const whisperDir = join(__dirname, 'whisper.cpp');
    const whisperBin = join(whisperDir, 'main');
    const modelPath = join(whisperDir, 'models', 'ggml-base.en.bin');

    const proc = spawn(whisperBin, ['-m', modelPath, '-f', '-', '-nt']);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      const text = stdout.trim();
      if (text && !text.includes('[BLANK_AUDIO]')) {
        console.log(`[Transcription] ${text}`);
      }
      if (code !== 0 && stderr) {
        console.error(`[whisper stderr] ${stderr.slice(0, 200)}`);
      }
      resolve();
    });

    proc.on('error', (err) => {
      console.error('[whisper spawn error]', err.message);
      resolve();
    });

    proc.stdin.write(wav, (writeErr) => {
      if (writeErr) console.error('[stdin write error]', writeErr.message);
      proc.stdin.end();
    });
  });
}

function tryDrain() {
  if (isProcessing) return;
  if (chunkQueue.length < WINDOW_CHUNKS) return;

  isProcessing = true;

  (async () => {
    while (chunkQueue.length >= WINDOW_CHUNKS) {
      const windowChunks = chunkQueue.slice(0, WINDOW_CHUNKS);

      await runWhisperOnWindow(windowChunks);

      chunkQueue.splice(0, STEP_CHUNKS);

      await new Promise((r) => setImmediate(r));
    }
    isProcessing = false;
  })().catch((err) => {
    console.error('[drain error]', err);
    isProcessing = false;
  });
}

const ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: NUM_CHANNELS,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: SAMPLE_RATE,
    deviceId: -1,
    closeOnError: true,
  },
});

ai.on('data', (rawChunk) => {
  let offset = 0;
  while (offset < rawChunk.length) {
    const end = Math.min(offset + BYTES_PER_CHUNK, rawChunk.length);
    chunkQueue.push(rawChunk.slice(offset, end));
    offset = end;
  }

  tryDrain();
});

ai.on('error', (err) => console.error('[AudioIO error]', err));

ai.start();
console.log(
  `[Wispr] Listening — window: ${WINDOW_CHUNKS * CHUNK_MS} ms  |  step: ${STEP_CHUNKS * CHUNK_MS} ms  |  overlap: ${((WINDOW_CHUNKS - STEP_CHUNKS) / WINDOW_CHUNKS) * 100}%`,
);

process.on('SIGINT', () => {
  console.log('\n[Wispr] Stopping…');
  ai.quit();
  process.exit(0);
});
