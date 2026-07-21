# my-wispr

**Offline, privacy-first speech-to-text for Node.js** — powered by [whisper.cpp](https://github.com/ggerganov/whisper.cpp).

No cloud. No API keys. Pipe any 16 kHz mono PCM stream into a single core engine and get real-time transcription events. Use the same library for WebSocket SaaS, desktop mic capture, and editor integrations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./apps/packages/core/LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-my--wispr--npm-cb3837.svg)](https://www.npmjs.com/package/my-wispr-npm)

---

## Why my-wispr?

| | Cloud STT APIs | **my-wispr** |
|---|---|---|
| Privacy | Audio leaves your machine | Stays local |
| Cost | Per-minute billing | Free after setup |
| Network | Required | Not required |
| Integration | HTTP/SDK only | Any Node PCM stream |

One API (`createWisprStream`) powers every host. Hosts only supply audio.

---

## Features

- **Fully offline** — whisper.cpp runs on-device; no external STT service
- **Stream-first API** — any Node.js `Readable` of raw PCM → transcription events
- **WebSocket server** — multi-client SaaS helper via `createWisprServer`
- **Desktop mic demo** — PortAudio capture → live transcription
- **Configurable windows** — sliding `windowChunks` / `stepChunks` for latency vs accuracy
- **Zero runtime deps** on the core package (optional `ws` peer for the server helper)
- **ESM-only**, Node.js ≥ 18

---

## Quick start (npm)

```bash
npm install my-wispr-npm
npx my-wispr-setup          # clone + build whisper.cpp + download model (once)
```

Requires `git`, `make`, and a C++ compiler (macOS: `xcode-select --install`).

### Transcribe a PCM stream

```js
import { PassThrough } from 'node:stream';
import { createWisprStream } from 'my-wispr-npm';

const pcm = new PassThrough();
const wispr = createWisprStream({ stream: pcm, model: 'base.en' });

wispr.on('transcription', (text) => console.log(text));
wispr.start();

// Write 16-bit signed LE PCM @ 16 kHz mono into `pcm`
pcm.write(int16Buffer);
```

### Or run a WebSocket server

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

Already have whisper.cpp? Skip setup and point env vars at your binary and model:

```bash
export WISPR_BIN=/path/to/whisper-cli
export WISPR_MODEL=/path/to/ggml-base.en.bin
```

Full package API: [`apps/packages/core/README.md`](./apps/packages/core/README.md)

---

## Audio format

| Property | Value |
|---|---|
| Encoding | 16-bit signed little-endian (Int16) |
| Sample rate | 16,000 Hz |
| Channels | Mono |
| Frame size | 20 ms = **640 bytes** per chunk |

---

## Architecture

```
                    ┌─────────────────────────┐
  any PCM source ──►│  createWisprStream      │──► transcription events
                    │  (my-wispr-npm)          │
                    └─────────────────────────┘
                              ▲
           ┌──────────────────┼──────────────────┐
           │                  │                  │
    Web / SaaS            Desktop            VS Code
  createWisprServer    local mic stream    extension host
```

| Path | Package | Role |
|---|---|---|
| `apps/packages/core` | `my-wispr-npm` | Publishable library — `createWisprStream` + optional `/server` |
| `apps/backend` | `my-wispr-server` | Demo hosts — WebSocket server & desktop mic |
| `apps/frontend` | — | Docs & marketing site (Next.js) |
| `packages/whisper.cpp` | — | Shared native binary + models (monorepo) |

---

## Monorepo setup

### Prerequisites

- Node.js ≥ 18
- `git`, `make`, and a C++ compiler

### Install

```bash
git clone https://github.com/sainideep1234/my-wispr.git
cd my-wispr
npm install
cd apps/packages/core && npx my-wispr-setup
```

### Run demos

```bash
# WebSocket transcription server → ws://localhost:8080
cd apps/backend && npm start

# Desktop mic capture → live console transcripts
cd apps/backend && npm run start:desktop

# Docs site → http://localhost:3000  (docs at /docs)
cd apps/frontend && npm run dev
```

### Root scripts

| Script | Description |
|---|---|
| `npm run build` | Build all workspaces (Turbo) |
| `npm run dev` | Start all `dev` tasks |
| `npm run lint` | Lint all workspaces |
| `npm run format` | Format with Prettier |
| `npm run check-types` | Type-check all workspaces |

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `WISPR_BIN` | auto-detected | Path to whisper.cpp binary |
| `WISPR_MODEL` | auto-detected | Path to `.bin` model file |
| `WISPR_MODEL_NAME` | `base.en` | Model name used by setup (`ggml-base.en.bin`) |
| `WISPR_WINDOW_CHUNKS` | core: `2` · desktop: `150` | Sliding window size (20 ms chunks) |
| `WISPR_STEP_CHUNKS` | core: `1` · desktop: `50` | Slide step size |
| `PORT` | `8080` | WebSocket demo server port |
| `HOST` | `0.0.0.0` | WebSocket demo server host |
| `LOG_TRANSCRIPTS` | on | Set to `false` to silence demo logs |

---

## WebSocket protocol

**Client → server:** raw binary PCM frames (Int16 LE, 16 kHz, mono)

**Server → client** (when `autoReply` is enabled):

```json
{ "type": "transcription", "text": "hello world" }
{ "type": "error", "message": "..." }
```

---

## Project structure

```
my-wispr/
├── apps/
│   ├── backend/                 # Demo hosts
│   │   ├── index.js             # createWisprServer (WebSocket)
│   │   └── desktop.js           # createWisprStream + local mic
│   ├── frontend/                # Next.js docs site
│   └── packages/
│       └── core/                # my-wispr-npm (publishable)
│           ├── src/
│           │   ├── index.js     # createWisprStream
│           │   └── server.js    # createWisprServer
│           └── scripts/
│               ├── setup.js     # npx my-wispr-setup
│               └── postinstall.js
└── packages/
    └── whisper.cpp/             # Shared binary + models
```

---

## Publishing

```bash
cd apps/packages/core
# Bump version in package.json, then:
npm publish
```

---

## Acknowledgments

- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) by Georgi Gerganov
- [OpenAI Whisper](https://github.com/openai/whisper) model weights
- [naudiodon2p](https://www.npmjs.com/package/naudiodon2p) / PortAudio (desktop demo)

---

## License

[MIT](./apps/packages/core/LICENSE)
