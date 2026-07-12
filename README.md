# my-wispr

> High-performance offline speech-to-text for Node.js — powered by [whisper.cpp](https://github.com/ggerganov/whisper.cpp) and PortAudio.

**No cloud. No API key. No data leaving your machine.**

---

## What is this?

`my-wispr` is a monorepo containing:

| Package / App | Description |
| --- | --- |
| `apps/packages/core` | The `my-wispr-npm` Node.js library — publishable to npm |
| `apps/frontend` | Documentation website (Next.js) |

---

## Using the NPM Package

The easiest way to get started — just install it:

```bash
npm install my-wispr-npm
```

Then in your project:

```js
const { createWispr } = require('my-wispr-npm');

const wispr = createWispr({
  onTranscription: (text) => console.log('[you said]', text),
});

wispr.start();
```

> The install script auto-compiles `whisper.cpp` and downloads the model. No manual setup needed.

See the [full package README](./apps/packages/core/README.md) for all options and events.

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

### Run the frontend docs site

```bash
cd apps/frontend
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Test the core library locally

```bash
cd apps/packages/core

# Quick smoke test
npm test

# Try it live
node -e "
const { createWispr } = require('.');
const w = createWispr({ onTranscription: (t) => console.log(t) });
w.start();
setTimeout(() => w.stop(), 10000);
"
```

---

## Project Structure

```
my-wispr/
├── apps/
│   ├── frontend/          # Next.js docs site
│   └── packages/
│       └── core/          # my-wispr-npm package
│           ├── src/
│           │   └── index.js       # Core library
│           ├── scripts/
│           │   └── postinstall.js # Auto-setup whisper.cpp
│           └── package.json
└── README.md
```

---

## How it Works

```
Microphone (PortAudio)
    │  20ms PCM chunks
    ▼
  In-memory queue
    │  when queue ≥ windowChunks (3s default)
    ▼
  WAV header + PCM piped via stdin
    │
    ▼
  whisper.cpp binary
    │
    ▼
  emit('transcription', text)
    │  slide queue by stepChunks (1.5s default)
    ▼
  Repeat
```

**Key properties:**
- **Zero temp files** — audio is piped directly to whisper's stdin
- **Sliding window** — 50% overlap so no words are cut at boundaries
- **Fully offline** — no network calls, ever
- **Zero global state** — create multiple instances safely

---

## Publishing to NPM

```bash
cd apps/packages/core

# Bump version in package.json first, then:
npm publish
```

---

## License

MIT
