# my-wispr-npm

> Offline, privacy-first voice-to-text for Node.js — powered by [whisper.cpp](https://github.com/ggerganov/whisper.cpp)

No cloud. No API key. No internet required. Just install and start transcribing.

---

## Install

```bash
npm install my-wispr-npm
```

That's it. The install script automatically:
1. Clones `whisper.cpp` into the package directory
2. Compiles the binary using `make`
3. Downloads the `base.en` model (~150MB)

> **Requirements:** macOS/Linux with `git`, `make`, and a C++ compiler (`xcode-select --install` on macOS).

---

## Usage

```js
const { createWispr } = require('my-wispr-npm');

const wispr = createWispr({
  onTranscription: (text) => console.log('[you said]', text),
});

wispr.start();

// Stop whenever you're done
setTimeout(() => wispr.stop(), 30_000);
```

---

## Options

| Option            | Type       | Default     | Description                                      |
| ----------------- | ---------- | ----------- | ------------------------------------------------ |
| `model`           | `string`   | `'base.en'` | Whisper model to use (`tiny.en`, `base.en`, etc) |
| `windowChunks`    | `number`   | `150`       | Transcription window size (150 = 3 seconds)      |
| `stepChunks`      | `number`   | `75`        | How far to slide the window (75 = 1.5 seconds)   |
| `deviceId`        | `number`   | `-1`        | Microphone device ID. `-1` = system default      |
| `whisperBin`      | `string`   | auto        | Override path to whisper binary                  |
| `modelPath`       | `string`   | auto        | Override path to model file                      |
| `onTranscription` | `function` | —           | Callback fired with each transcribed text chunk  |
| `onError`         | `function` | —           | Callback fired on errors                         |

---

## Events

```js
wispr.on('transcription', (text) => { /* text segment */ });
wispr.on('error', (err) => { /* error */ });
wispr.on('start', () => { /* mic opened */ });
wispr.on('stop', () => { /* mic closed */ });
```

---

## Override Paths (optional)

```bash
WISPR_BIN=/path/to/whisper-cli \
WISPR_MODEL=/path/to/ggml-base.en.bin \
node your-app.js
```

---

## License

MIT — see [LICENSE](LICENSE)
