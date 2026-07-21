import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import portAudio from 'naudiodon2p';
import { createWisprStream } from 'my-wispr-npm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SAMPLE_RATE = 16000;
const NUM_CHANNELS = 1;

const monorepoRootWhisper = path.join(__dirname, '..', '..', 'packages', 'whisper.cpp');
let whisperDir = path.join(__dirname, 'whisper.cpp');
if (existsSync(monorepoRootWhisper)) {
  whisperDir = monorepoRootWhisper;
}

const whisperBin = process.env.WISPR_BIN
  ? path.resolve(process.env.WISPR_BIN)
  : path.join(whisperDir, 'main');

const whisperModel = process.env.WISPR_MODEL
  ? path.resolve(process.env.WISPR_MODEL)
  : path.join(
      whisperDir,
      'models',
      `ggml-${process.env.WISPR_MODEL_NAME || 'base.en'}.bin`,
    );

const pcmStream = new portAudio.AudioIO({
  inOptions: {
    channelCount: NUM_CHANNELS,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: SAMPLE_RATE,
    deviceId: -1,
    closeOnError: true,
  },
});

const windowChunks = process.env.WISPR_WINDOW_CHUNKS
  ? parseInt(process.env.WISPR_WINDOW_CHUNKS, 10)
  : 150;

const stepChunks = process.env.WISPR_STEP_CHUNKS
  ? parseInt(process.env.WISPR_STEP_CHUNKS, 10)
  : 50;

const wispr = createWisprStream({
  stream: pcmStream,
  model: process.env.WISPR_MODEL_NAME || 'base.en',
  windowChunks,
  stepChunks,
  whisperBin,
  modelPath: whisperModel,
});

wispr.on('transcription', (text) => {
  if (process.env.LOG_TRANSCRIPTS !== 'false') {
    console.log(`[Transcription] ${text}`);
  }
});

wispr.on('error', (err) => {
  console.error('[Wispr Error]', err.message);
});

wispr.on('start', () => {
  console.log('[my-wispr-desktop] Transcription started.');
});

console.log('[my-wispr-desktop] Listening to microphone... Speak now!');
pcmStream.start();

try {
  wispr.start();
} catch (err) {
  console.error('[my-wispr-desktop] Failed to start wispr:', err.message);
  process.exit(1);
}

process.on('SIGINT', () => {
  console.log('\n[my-wispr-desktop] Shutting down...');
  try {
    wispr.stop();
    pcmStream.quit();
  } catch (_) {}
  process.exit(0);
});
