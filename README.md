# my-wispr

> Real-time speech-to-text for any browser — powered by [whisper.cpp](https://github.com/ggerganov/whisper.cpp) on your server.

**No cloud. No API key. Works on iPhone, Android, and desktop.**

---

## What is this?

`my-wispr` is a monorepo for the **Web SaaS speech-to-text pattern**:

```
Browser (any device)
  │  Web Audio API → raw PCM
  │  WebSocket
  ▼
Your Node.js Server  ← my-wispr-npm
  │  Sliding-window buffering
  │  Pipes PCM to whisper.cpp
  ▼
whisper.cpp  (offline, on your server)
  │
  ▼
Transcribed text → WebSocket → Browser
```

| Package / App | Description |
|---|---|
| `apps/packages/core` | `my-wispr-npm` — the Node.js library (publishable to npm) |
| `apps/backend` | Ready-to-run WebSocket transcription server |
| `apps/frontend` | Documentation website (Next.js) |

---

## Using the NPM Package

```bash
npm install my-wispr-npm ws
```

```js
const http = require('http');
const { WebSocketServer } = require('ws');
const { PassThrough } = require('stream');
const { createWisprStream } = require('my-wispr-npm');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  const pcmStream = new PassThrough();
  const wispr = createWisprStream({ stream: pcmStream });

  wispr.on('transcription', (text) =>
    ws.send(JSON.stringify({ type: 'transcription', text }))
  );

  ws.on('message', (data) => pcmStream.write(data));
  ws.on('close', () => wispr.stop());
  wispr.start();
});
```

See the [full package README](./apps/packages/core/README.md) for all options, events, and the browser client code.

---

## Running Locally (Monorepo)

### Prerequisites

- Node.js >= 18
- `git`, `make`, and a C++ compiler (macOS: `xcode-select --install`)

### Setup

```bash
# Clone the repo
git clone https://github.com/sainideep1234/my-wispr.git
cd my-wispr

# Install all dependencies
npm install
```

### Start the WebSocket server

```bash
cd apps/backend
npm install
npm start
# → WebSocket transcription server running on ws://localhost:8080
```

### Run the frontend docs site

```bash
cd apps/frontend
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
my-wispr/
├── apps/
│   ├── backend/               # WebSocket transcription server
│   │   ├── index.js           # ws server + createWisprStream
│   │   └── package.json
│   ├── frontend/              # Next.js documentation site
│   └── packages/
│       └── core/              # my-wispr-npm package (publishable)
│           ├── src/
│           │   └── index.js   # createWisprStream core API
│           ├── scripts/
│           │   └── postinstall.js  # auto-setup whisper.cpp
│           └── package.json
└── README.md
```

---

## How It Works (Internals)

1. **Browser** calls `getUserMedia()`, captures mic at 16kHz mono
2. `ScriptProcessor` converts `Float32` samples → `Int16` PCM, sends over WebSocket
3. **Server** writes incoming binary frames into a `PassThrough` stream
4. `createWisprStream` slices the stream into 20ms chunks, maintains a sliding window (40ms default)
5. Each window is wrapped in a WAV header and piped to `whisper.cpp` via stdin
6. Transcription text is emitted and forwarded back to the browser as JSON

**Key properties:**
- **Zero temp files** — audio piped directly to whisper's stdin
- **Sliding window** — 50% overlap prevents words being cut at boundaries
- **Fully offline** — whisper.cpp runs on your server, no cloud calls
- **Any device** — browser-native API, no user installs required
- **Multi-client** — each WebSocket connection gets its own isolated instance

---

## Publishing to NPM

```bash
cd apps/packages/core

# Bump version in package.json, then:
npm publish
```

---

## License

MIT
