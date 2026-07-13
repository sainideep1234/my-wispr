# my-wispr-npm

> Real-time, privacy-first speech-to-text for Node.js — powered by [whisper.cpp](https://github.com/ggerganov/whisper.cpp)

**No cloud. No API key. No data leaving your server.**

Built for the **Web SaaS pattern**: your browser captures the microphone, streams raw audio over a WebSocket, and your Node.js server transcribes it in real-time using this package.

---

## How It Works

```
Browser (any device)
  │  Web Audio API captures mic
  │  Raw PCM chunks sent over WebSocket
  ▼
Your Node.js Server  ← npm install my-wispr-npm
  │  Receives PCM stream
  │  Sliding-window buffering (40ms / 20ms overlap)
  │  WAV header prepended, piped to whisper.cpp stdin
  ▼
whisper.cpp (runs locally on your server)
  │
  ▼
Transcribed text sent back over WebSocket
  ▼
Browser displays text instantly
```

**Why this pattern?**
- Works on **any device** — iPhone, Android, desktop — no native installs for users
- Your whisper model and binaries stay **private on your server**
- No cloud costs, no latency from third-party APIs

---

## Install

```bash
npm install my-wispr-npm
```

The postinstall script automatically:
1. Clones `whisper.cpp` into the package directory
2. Compiles the binary using `make`
3. Downloads the `base.en` model (~150MB)

> **Requirements:** macOS/Linux with `git`, `make`, and a C++ compiler (`xcode-select --install` on macOS).

---

## Quick Start — WebSocket Transcription Server

```js
const http = require('http');
const { WebSocketServer } = require('ws');
const { PassThrough } = require('stream');
const { createWisprStream } = require('my-wispr-npm');

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  // Create a PassThrough stream — WebSocket messages flow into it
  const pcmStream = new PassThrough();

  const wispr = createWisprStream({
    stream: pcmStream,
    model: 'base.en',
  });

  wispr.on('transcription', (text) => {
    ws.send(JSON.stringify({ type: 'transcription', text }));
  });

  wispr.on('error', (err) => {
    ws.send(JSON.stringify({ type: 'error', message: err.message }));
  });

  ws.on('message', (data) => {
    // Browser sends raw 16-bit LE PCM at 16kHz mono
    pcmStream.write(data);
  });

  ws.on('close', () => {
    wispr.stop();
    pcmStream.destroy();
  });

  wispr.start();
});

server.listen(8080, () => {
  console.log('Transcription server running on ws://localhost:8080');
});
```

---

## Browser Client (Web Audio API)

```js
const ws = new WebSocket('ws://localhost:8080');
const audioCtx = new AudioContext({ sampleRate: 16000 });

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = audioCtx.createMediaStreamSource(stream);
const processor = audioCtx.createScriptProcessor(1024, 1, 1);

processor.onaudioprocess = (e) => {
  const float32 = e.inputBuffer.getChannelData(0);

  // Convert Float32 → Int16 (raw PCM)
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(int16.buffer);
  }
};

source.connect(processor);
processor.connect(audioCtx.destination);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'transcription') {
    console.log('[you said]', msg.text);
  }
};
```

> **Audio format:** The browser must send raw **16-bit signed little-endian PCM** at **16,000 Hz mono**. This matches whisper.cpp's native input format.

---

## API Reference

### `createWisprStream(opts)`

Creates a transcription instance that reads from a Node.js `Readable` stream.

| Option | Type | Default | Description |
|---|---|---|---|
| `stream` | `Readable` | **required** | Node.js Readable of raw 16-bit LE PCM at 16kHz mono |
| `model` | `string` | `'base.en'` | Whisper model name (`tiny.en`, `base.en`, `small.en`, …) |
| `windowChunks` | `number` | `2` | Transcription window size in 20ms chunks (2 = 40ms) |
| `stepChunks` | `number` | `1` | Slide step in 20ms chunks (1 = 20ms overlap) |
| `whisperBin` | `string` | auto | Override path to whisper.cpp binary |
| `modelPath` | `string` | auto | Override path to `.bin` model file |
| `onTranscription` | `function` | — | Shorthand for `.on('transcription', fn)` |
| `onError` | `function` | — | Shorthand for `.on('error', fn)` |

### Events

```js
wispr.on('transcription', (text) => { /* string */ });
wispr.on('error', (err) => { /* Error */ });
wispr.on('start', () => { /* stream processing begun */ });
wispr.on('stop', () => { /* stream closed or stop() called */ });
```

### Methods

```js
wispr.start();  // Begin reading from the stream
wispr.stop();   // Destroy stream, flush queue, emit 'stop'
```

---

## Override Paths (optional)

```bash
WISPR_BIN=/path/to/whisper-cli \
WISPR_MODEL=/path/to/ggml-base.en.bin \
node your-server.js
```

---

## License

MIT — see [LICENSE](LICENSE)
