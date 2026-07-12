'use strict';

const EventEmitter = require('events');
const portAudio = require('naudiodon2p');
const { spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const SAMPLE_RATE = 16000;
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = 2;
const CHUNK_MS = 20;

const BYTES_PER_CHUNK = (SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE * CHUNK_MS) / 1000;

function createWispr(opts = {}) {
  const deviceId = opts.deviceId !== undefined ? opts.deviceId : -1;
  const windowChunks = opts.windowChunks !== undefined ? opts.windowChunks : 150;
  const stepChunks = opts.stepChunks !== undefined ? opts.stepChunks : 75;
  const whisperBin = opts.whisperBin;
  const modelPath = opts.modelPath;
  const model = opts.model || 'base.en';
  const onTranscription = opts.onTranscription;
  const onError = opts.onError;

  if (windowChunks < 1) {
    throw new RangeError('windowChunks must be >= 1');
  }
  if (stepChunks < 1) {
    throw new RangeError('stepChunks must be >= 1');
  }
  if (stepChunks > windowChunks) {
    throw new RangeError('stepChunks must be <= windowChunks');
  }

  const emitter = new EventEmitter();

  if (typeof onTranscription === 'function') {
    emitter.on('transcription', onTranscription);
  }
  if (typeof onError === 'function') {
    emitter.on('error', onError);
  }

  const chunkQueue = [];
  let isProcessing = false;
  let audioStream = null;
  let resolvedBin = '';
  let resolvedModel = '';

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

  function runWhisperProcess(chunks) {
    return new Promise((resolve) => {
      const pcmData = Buffer.concat(chunks);
      const wavHeader = buildWavHeader(pcmData.length);
      const fullWavData = Buffer.concat([wavHeader, pcmData]);

      const process = spawn(resolvedBin, ['-m', resolvedModel, '-f', '-', '-nt'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
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

      process.on('error', (err) => {
        process.stderr.write('[wispr-core spawn error] ' + err.message + '\n');
        resolve(null);
      });

      process.stdin.write(fullWavData, (writeErr) => {
        if (writeErr) {
          process.stderr.write('[wispr-core stdin] ' + writeErr.message + '\n');
        }
        process.stdin.end();
      });
    });
  }

  async function processQueue() {
    if (isProcessing) {
      return;
    }
    if (chunkQueue.length < windowChunks) {
      return;
    }

    isProcessing = true;

    try {
      while (chunkQueue.length >= windowChunks) {
        const window = chunkQueue.slice(0, windowChunks);

        const text = await runWhisperProcess(window);
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
    if (audioStream) {
      throw new Error('[wispr-core] Already running. Call stop() first.');
    }

    const possibleBins = [
      join(__dirname, '..', 'whisper.cpp', 'main'),
      join(__dirname, '..', '..', '..', 'whisper.cpp', 'main'),
      join(__dirname, '..', '..', 'whisper.cpp', 'main'),
    ];
    if (whisperBin) {
      resolvedBin = whisperBin;
    } else if (process.env.WISPR_BIN) {
      resolvedBin = process.env.WISPR_BIN;
    } else {
      for (const p of possibleBins) {
        if (existsSync(p)) {
          resolvedBin = p;
          break;
        }
      }
      if (!resolvedBin) {
        resolvedBin = possibleBins[0];
      }
    }

    const possibleModels = [
      join(__dirname, '..', 'whisper.cpp', 'models', 'ggml-' + model + '.bin'),
      join(__dirname, '..', '..', '..', 'whisper.cpp', 'models', 'ggml-' + model + '.bin'),
      join(__dirname, '..', '..', 'whisper.cpp', 'models', 'ggml-' + model + '.bin'),
    ];
    if (modelPath) {
      resolvedModel = modelPath;
    } else if (process.env.WISPR_MODEL) {
      resolvedModel = process.env.WISPR_MODEL;
    } else {
      for (const p of possibleModels) {
        if (existsSync(p)) {
          resolvedModel = p;
          break;
        }
      }
      if (!resolvedModel) {
        resolvedModel = possibleModels[0];
      }
    }

    if (!existsSync(resolvedBin)) {
      throw new Error(
        '[wispr-core] whisper binary not found at: ' +
          resolvedBin +
          '\n' +
          '  Run: npm explore wispr-core -- npm run setup\n' +
          '  Or set WISPR_BIN=/path/to/whisper-cli',
      );
    }

    if (!existsSync(resolvedModel)) {
      throw new Error(
        '[wispr-core] whisper model not found at: ' +
          resolvedModel +
          '\n' +
          '  Run: npm explore wispr-core -- npm run setup\n' +
          '  Or set WISPR_MODEL=/path/to/ggml-base.en.bin',
      );
    }

    audioStream = new portAudio.AudioIO({
      inOptions: {
        channelCount: NUM_CHANNELS,
        sampleFormat: portAudio.SampleFormat16Bit,
        sampleRate: SAMPLE_RATE,
        deviceId: deviceId,
        closeOnError: true,
      },
    });

    audioStream.on('data', (rawBuffer) => {
      let offset = 0;
      while (offset < rawBuffer.length) {
        const end = Math.min(offset + BYTES_PER_CHUNK, rawBuffer.length);
        chunkQueue.push(rawBuffer.slice(offset, end));
        offset = end;
      }
      processQueue();
    });

    audioStream.on('error', (err) => {
      emitter.emit('error', err);
    });

    audioStream.start();
    emitter.emit('start');
  }

  function stop() {
    if (!audioStream) {
      return;
    }

    try {
      audioStream.quit();
    } catch (err) {}

    audioStream = null;
    chunkQueue.length = 0;
    isProcessing = false;
    emitter.emit('stop');
  }

  return {
    start: start,
    stop: stop,
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter),
  };
}

module.exports = { createWispr };
