# wispr-core

> Offline, privacy-first voice-to-text for Node.js — powered by [whisper.cpp](https://github.com/ggerganov/whisper.cpp)

`wispr-core` gives you a single factory function that turns your microphone into a
real-time transcription stream. **No cloud. No API key. No internet.**

---

## Install

```bash
npm install wispr-core
```

During installation, `wispr-core` automatically handles the setup for you:

1. **Clones** `whisper.cpp` directly into the package directory.
2. **Compiles** the C++ binary using `make` on your system.
3. **Downloads** the default `base.en` model file (~150MB).

> **System Prerequisites:**
>
> - **macOS**: Xcode Command Line Tools (`xcode-select --install`) and `make`.
> - **Linux**: `gcc` / `g++` and `make`.
> - **Windows**: Use WSL2 or MinGW.

If the automated compilation fails, the library will guide you on how to compile it manually.

---

## Configuration & Overrides

By default, the library looks for `whisper.cpp/` inside either:

1. The standalone package folder (`node_modules/wispr-core/whisper.cpp/`).
2. The monorepo root (if developing locally).

If you wish to use a different binary or model path, set the following environment variables:

```bash
WISPR_BIN=/absolute/path/to/whisper-cli \
WISPR_MODEL=/absolute/path/to/ggml-base.en.bin \
node your-app.js
```

---

## Usage

### Minimal — callback style

```js
const { createWispr } = require("wispr-core");

const wispr = createWispr({
  onTranscription: (text) => {
    console.log("[you said]", text);
  },
});

wispr.start();

// Stop after 30 seconds (or call wispr.stop() whenever you want)
setTimeout(() => wispr.stop(), 30_000);
```

### Event emitter style

```js
const { createWispr } = require("wispr-core");

const wispr = createWispr();

wispr.on("transcription", (text) => {
  console.log("[transcription]", text);
});

wispr.on("error", (err) => {
  console.error("[error]", err.message);
});

wispr.on("start", () => console.log("Microphone open"));
wispr.on("stop", () => console.log("Microphone closed"));

wispr.start();
```

### Push-to-talk pattern

```js
const { createWispr } = require("wispr-core");

const wispr = createWispr({ onTranscription: (t) => injectIntoFocusedApp(t) });

// Start when user holds a key, stop when they release
process.stdin.on("keypress", (ch, key) => {
  if (key.name === "space" && key.alt) {
    wispr.start();
  }
  if (key.name === "space" && !key.alt) {
    wispr.stop();
  }
});
```

### Custom window size (longer context = better accuracy)

```js
const wispr = createWispr({
  windowChunks: 300, // 6 seconds per whisper call  (300 × 20 ms)
  stepChunks: 150, // slide by 3 seconds
  model: "small.en", // use small model for better accuracy
  onTranscription: (text) => console.log(text),
});
```

---

## API

### `createWispr(opts?) → WisprInstance`

| Option            | Type       | Default     | Description                                           |
| ----------------- | ---------- | ----------- | ----------------------------------------------------- |
| `deviceId`        | `number`   | `-1`        | PortAudio device id. `-1` = system default microphone |
| `windowChunks`    | `number`   | `150`       | Window size in 20-ms chunks. `150` = 3 seconds        |
| `stepChunks`      | `number`   | `75`        | Slide step in 20-ms chunks. `75` = 1.5 seconds        |
| `whisperBin`      | `string`   | auto        | Explicit path to whisper binary                       |
| `modelPath`       | `string`   | auto        | Explicit path to `.bin` model file                    |
| `model`           | `string`   | `'base.en'` | Model short name used for path resolution             |
| `onTranscription` | `function` | —           | Shorthand listener for `'transcription'` event        |
| `onError`         | `function` | —           | Shorthand listener for `'error'` event                |

### `WisprInstance`

| Method            | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `start()`         | Open microphone and begin transcription. Throws if binary/model missing. |
| `stop()`          | Close microphone and flush queue. Safe to call multiple times.           |
| `on(event, fn)`   | Add event listener                                                       |
| `off(event, fn)`  | Remove event listener                                                    |
| `once(event, fn)` | Add one-time event listener                                              |

### Events

| Event             | Payload  | Description              |
| ----------------- | -------- | ------------------------ |
| `'transcription'` | `string` | Transcribed text segment |
| `'error'`         | `Error`  | Audio or whisper error   |
| `'start'`         | —        | Microphone opened        |
| `'stop'`          | —        | Microphone closed        |

---

## Environment Variables

| Variable      | Description                    |
| ------------- | ------------------------------ |
| `WISPR_BIN`   | Full path to whisper binary    |
| `WISPR_MODEL` | Full path to `.bin` model file |

These override all auto-detection. Useful for CI/CD or non-standard installs.

---

## How it works

```
Microphone (PortAudio)
    │
    ▼  20 ms PCM chunks (~640 bytes each)
 chunkQueue[]
    │
    ▼  when queue ≥ windowChunks (default 3 s)
 Build WAV in memory (header + PCM)
    │
    ▼  pipe via stdin
 whisper.cpp binary
    │
    ▼
 Transcription text  →  emit('transcription', text)
    │
    ▼  slide queue by stepChunks (default 1.5 s)
 Repeat
```

**Key properties:**

- **Zero temp files** — audio is piped directly to whisper's stdin
- **Sliding window** — 50% overlap by default means no words are cut off at boundaries
- **Non-blocking** — drain loop yields to event loop between windows so audio never starves
- **Fully encapsulated** — `createWispr()` has zero global state; create multiple instances safely

---

## Troubleshooting

### `Error: whisper binary not found`

```bash
# Build whisper.cpp and ensure the binary is at whisper.cpp/main
cd whisper.cpp && make
# or explicitly point to it:
WISPR_BIN=/path/to/whisper-cli node app.js
```

### `Error: whisper model not found`

```bash
cd whisper.cpp && bash models/download-ggml-model.sh base.en
# or:
WISPR_MODEL=/path/to/ggml-base.en.bin node app.js
```

### No transcription output (silence)

- Check your microphone is the system default input
- Try a different `deviceId` (use `naudiodon2p.getDevices()` to list them)
- Speak louder / reduce background noise

### Output looks wrong / too slow

- Use a smaller model: `model: 'tiny.en'`
- Reduce `windowChunks` to `50` (1 second)

---

## License

MIT — see [LICENSE](LICENSE)

**Attribution (required by MIT):**

- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) — Copyright (c) 2022 Georgi Gerganov (MIT)
- [OpenAI Whisper](https://github.com/openai/whisper) — Copyright (c) 2022 OpenAI (MIT)
