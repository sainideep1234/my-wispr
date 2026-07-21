# my-wispr-npm

Offline speech-to-text for Node.js. Pipe any PCM audio stream into whisper.cpp — no cloud, no API key.

**Audio format:** 16-bit signed LE PCM, 16 kHz, mono.

## 1. Install

```bash
npm install my-wispr-npm
npx my-wispr-setup
```

Setup clones whisper.cpp, builds it, and downloads the `base.en` model (needs `git`, `make`, and a C++ compiler).

Already have whisper.cpp? Skip setup and set:

```bash
export WISPR_BIN=/path/to/whisper-cli
export WISPR_MODEL=/path/to/ggml-base.en.bin
```

## 2. Transcribe a stream

```js
import { PassThrough } from 'stream';
import { createWisprStream } from 'my-wispr-npm';

const pcm = new PassThrough();
const wispr = createWisprStream({ stream: pcm, model: 'base.en' });

wispr.on('transcription', (text) => console.log(text));
wispr.start();

// Write raw Int16 PCM buffers into `pcm`
pcm.write(int16Buffer);
```

## 3. Or run a WebSocket server

```bash
npm install ws
```

```js
import { createWisprServer } from 'my-wispr-npm/server';

const server = createWisprServer({ port: 8080 });

server.on('transcription', ({ text }) => console.log(text));
await server.listen();
// Clients send raw PCM; server replies: { "type": "transcription", "text": "..." }
```

## Options

### `createWisprStream(opts)`

| Option | Default | Notes |
|---|---|---|
| `stream` | required | Readable of raw PCM |
| `model` | `'base.en'` | Whisper model name |
| `windowChunks` | `2` | Window size (20ms chunks) |
| `stepChunks` | `1` | Slide step (20ms chunks) |
| `whisperBin` | auto | Override binary path |
| `modelPath` | auto | Override model path |

**Events:** `transcription`, `error`, `start`, `stop`  
**Methods:** `start()`, `stop()`

### `createWisprServer(opts)`

Same whisper options as above, plus:

| Option | Default | Notes |
|---|---|---|
| `port` | `8080` | Listen port |
| `host` | `'0.0.0.0'` | Listen host |
| `path` | — | Optional WS path |
| `server` | — | Reuse an HTTP server |
| `autoReply` | `true` | Send JSON to clients |

**Methods:** `listen()`, `close()`

## License

MIT
