import type { ReactNode } from 'react';
import CodeBlock, { kw, fn, str, num, cm, prop } from '../components/CodeBlock';

function ApiTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border my-6 not-prose">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/60 text-muted-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="bg-background">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const opt = (name: string) => (
  <code className="font-mono text-sm text-foreground">{name}</code>
);
const type = (t: string) => <span className="text-muted-foreground font-mono text-xs">{t}</span>;
const def = (d: string, required = false) => (
  <span className={`font-mono text-xs ${required ? 'text-red-500' : 'text-muted-foreground'}`}>
    {d}
  </span>
);
const desc = (d: string) => <span className="text-foreground/90">{d}</span>;

export default function DocsPage() {
  return (
    <article className="max-w-none">
      {/* Intro */}
      <p className="text-sm font-medium text-muted-foreground mb-3">Documentation</p>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
        my-wispr-npm
      </h1>
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        Offline speech-to-text for Node.js. Pipe any 16-bit PCM stream into{' '}
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">createWisprStream</code> —
        powered by whisper.cpp. No cloud, no API key, no audio leaving the machine.
      </p>

      <div className="flex flex-wrap gap-2 mb-12 text-xs font-mono">
        <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
          Node ≥ 18
        </span>
        <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
          ESM
        </span>
        <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
          MIT
        </span>
        <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
          whisper.cpp
        </span>
      </div>

      {/* Installation */}
      <h2 id="installation" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        Installation
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Install the package, then run setup once to clone, build whisper.cpp, and download a model.
      </p>

      <CodeBlock filename="Terminal">
        <div>
          <span className={kw}>npm</span> install my-wispr-npm
        </div>
        <div>
          <span className={kw}>npx</span> my-wispr-setup
        </div>
      </CodeBlock>

      <p className="text-muted-foreground mb-2 leading-relaxed">
        For the WebSocket helper, also install the peer dependency:
      </p>
      <CodeBlock filename="Terminal">
        <div>
          <span className={kw}>npm</span> install ws
        </div>
      </CodeBlock>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        Setup requires macOS or Linux with <code className="text-xs bg-muted px-1 py-0.5 rounded">git</code>,{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">make</code>, and a C++ compiler. On macOS:{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">xcode-select --install</code>. Or skip setup
        and set <code className="text-xs bg-muted px-1 py-0.5 rounded">WISPR_BIN</code> /{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">WISPR_MODEL</code> to existing paths.
      </p>

      {/* Architecture */}
      <h2 id="architecture" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        Architecture
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        One core engine. Three hosts. The LLM / code step stays in your app.
      </p>

      <CodeBlock filename="Architecture">
        <div className="text-zinc-300 leading-loose whitespace-pre">{`any PCM source ──►  createWisprStream  ──►  transcription events
                    (core — always)

         ┌──────────────┼──────────────┐
         │              │              │
    Web / SaaS      Desktop        VS Code
  createWisprServer  mic Readable  extension host
  or PassThrough+WS                PassThrough`}</div>
      </CodeBlock>

      {/* Quick Start */}
      <h2 id="quickstart" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        Quick Start
      </h2>

      <h3 id="websocket" className="text-base font-semibold text-foreground mt-8 mb-2 scroll-mt-28">
        WebSocket server
      </h3>
      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
        Recommended for SaaS. Each client gets an isolated session. Import from{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">my-wispr-npm/server</code>.
      </p>

      <CodeBlock filename="server.js">
        <div>
          <span className={kw}>import</span> {'{ createWisprServer }'} <span className={kw}>from</span>{' '}
          <span className={str}>&apos;my-wispr-npm/server&apos;</span>;
        </div>
        <br />
        <div>
          <span className={kw}>const</span> server = <span className={fn}>createWisprServer</span>({'{'}
        </div>
        <div className="ml-4">
          <span className={prop}>port</span>: <span className={num}>8080</span>,
        </div>
        <div className="ml-4">
          <span className={prop}>model</span>: <span className={str}>&apos;base.en&apos;</span>,
        </div>
        <div>{'}'});</div>
        <br />
        <div>
          server.<span className={fn}>on</span>(<span className={str}>&apos;transcription&apos;</span>, ({'{ text }'}){' '}
          <span className={kw}>=&gt;</span> {'{'}
        </div>
        <div className="ml-4">
          console.<span className={fn}>log</span>(text);
        </div>
        <div>{'}'});</div>
        <br />
        <div>
          <span className={kw}>await</span> server.<span className={fn}>listen</span>();
        </div>
      </CodeBlock>

      <p className="text-sm text-muted-foreground mb-4">
        Clients receive JSON:{' '}
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
          {'{ "type": "transcription", "text": "hello world" }'}
        </code>
      </p>

      <h3 id="browser" className="text-base font-semibold text-foreground mt-8 mb-2 scroll-mt-28">
        Browser client
      </h3>
      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
        Capture mic audio with the Web Audio API and send raw PCM over WebSocket.
      </p>

      <CodeBlock filename="client.js">
        <div>
          <span className={kw}>const</span> ws = <span className={kw}>new</span> <span className={fn}>WebSocket</span>(
          <span className={str}>&apos;ws://localhost:8080&apos;</span>);
        </div>
        <div>
          <span className={kw}>const</span> audioCtx = <span className={kw}>new</span> <span className={fn}>AudioContext</span>(
          {'{ sampleRate: 16000 }'});
        </div>
        <br />
        <div>
          <span className={kw}>const</span> stream = <span className={kw}>await</span>{' '}
          navigator.mediaDevices.<span className={fn}>getUserMedia</span>({'{ audio: true }'});
        </div>
        <div>
          <span className={kw}>const</span> source = audioCtx.<span className={fn}>createMediaStreamSource</span>
          (stream);
        </div>
        <div>
          <span className={kw}>const</span> processor = audioCtx.<span className={fn}>createScriptProcessor</span>(
          <span className={num}>1024</span>, <span className={num}>1</span>, <span className={num}>1</span>);
        </div>
        <br />
        <div>
          processor.onaudioprocess = (e) <span className={kw}>=&gt;</span> {'{'}
        </div>
        <div className="ml-4">
          <span className={kw}>const</span> f32 = e.inputBuffer.<span className={fn}>getChannelData</span>(
          <span className={num}>0</span>);
        </div>
        <div className="ml-4">
          <span className={kw}>const</span> i16 = <span className={kw}>new</span> <span className={fn}>Int16Array</span>
          (f32.length);
        </div>
        <div className="ml-4">
          <span className={kw}>for</span> (<span className={kw}>let</span> i = <span className={num}>0</span>; i {'<'}{' '}
          f32.length; i++) {'{'}
        </div>
        <div className="ml-8">
          i16[i] = Math.<span className={fn}>max</span>(<span className={num}>-32768</span>, Math.
          <span className={fn}>min</span>(<span className={num}>32767</span>, f32[i] *{' '}
          <span className={num}>32768</span>));
        </div>
        <div className="ml-4">{'}'}</div>
        <div className="ml-4">
          <span className={kw}>if</span> (ws.readyState === WebSocket.OPEN) ws.<span className={fn}>send</span>
          (i16.buffer);
        </div>
        <div>{'}'};</div>
        <br />
        <div>
          source.<span className={fn}>connect</span>(processor);
        </div>
        <div>
          processor.<span className={fn}>connect</span>(audioCtx.destination);
        </div>
        <br />
        <div>
          ws.onmessage = (e) <span className={kw}>=&gt;</span> {'{'}
        </div>
        <div className="ml-4">
          <span className={kw}>const</span> msg = JSON.<span className={fn}>parse</span>(e.data);
        </div>
        <div className="ml-4">
          <span className={kw}>if</span> (msg.type === <span className={str}>&apos;transcription&apos;</span>){' '}
          console.<span className={fn}>log</span>(msg.text);
        </div>
        <div>{'}'};</div>
      </CodeBlock>

      <h3 id="desktop" className="text-base font-semibold text-foreground mt-8 mb-2 scroll-mt-28">
        Desktop (local mic)
      </h3>
      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
        Pass any Node <code className="text-xs bg-muted px-1 py-0.5 rounded">Readable</code> of PCM — e.g.
        from <code className="text-xs bg-muted px-1 py-0.5 rounded">naudiodon</code>.
      </p>

      <CodeBlock filename="desktop.js">
        <div>
          <span className={kw}>import</span> portAudio <span className={kw}>from</span>{' '}
          <span className={str}>&apos;naudiodon2p&apos;</span>;
        </div>
        <div>
          <span className={kw}>import</span> {'{ createWisprStream }'} <span className={kw}>from</span>{' '}
          <span className={str}>&apos;my-wispr-npm&apos;</span>;
        </div>
        <br />
        <div>
          <span className={kw}>const</span> pcmStream = <span className={kw}>new</span> portAudio.
          <span className={fn}>AudioIO</span>({'{'}
        </div>
        <div className="ml-4">
          <span className={prop}>inOptions</span>: {'{'}
        </div>
        <div className="ml-8">
          <span className={prop}>channelCount</span>: <span className={num}>1</span>,
        </div>
        <div className="ml-8">
          <span className={prop}>sampleFormat</span>: portAudio.SampleFormat16Bit,
        </div>
        <div className="ml-8">
          <span className={prop}>sampleRate</span>: <span className={num}>16000</span>,
        </div>
        <div className="ml-8">
          <span className={prop}>deviceId</span>: <span className={num}>-1</span>,
        </div>
        <div className="ml-4">{'}'},</div>
        <div>{'}'});</div>
        <br />
        <div>
          <span className={kw}>const</span> wispr = <span className={fn}>createWisprStream</span>({'{'}
        </div>
        <div className="ml-4">
          <span className={prop}>stream</span>: pcmStream,
        </div>
        <div className="ml-4">
          <span className={prop}>model</span>: <span className={str}>&apos;base.en&apos;</span>,
        </div>
        <div className="ml-4">
          <span className={prop}>windowChunks</span>: <span className={num}>150</span>,
        </div>
        <div className="ml-4">
          <span className={prop}>stepChunks</span>: <span className={num}>50</span>,
        </div>
        <div>{'}'});</div>
        <br />
        <div>
          wispr.<span className={fn}>on</span>(<span className={str}>&apos;transcription&apos;</span>, (text){' '}
          <span className={kw}>=&gt;</span> console.<span className={fn}>log</span>(text));
        </div>
        <div>
          pcmStream.<span className={fn}>start</span>();
        </div>
        <div>
          wispr.<span className={fn}>start</span>();
        </div>
      </CodeBlock>

      <h3 id="vscode" className="text-base font-semibold text-foreground mt-8 mb-2 scroll-mt-28">
        VS Code extension
      </h3>
      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
        Run the package in the extension host. The webview only captures audio and posts binary PCM.
      </p>

      <CodeBlock filename="extension.js">
        <div>
          <span className={kw}>import</span> {'{ PassThrough }'} <span className={kw}>from</span>{' '}
          <span className={str}>&apos;stream&apos;</span>;
        </div>
        <div>
          <span className={kw}>import</span> {'{ createWisprStream }'} <span className={kw}>from</span>{' '}
          <span className={str}>&apos;my-wispr-npm&apos;</span>;
        </div>
        <br />
        <div>
          <span className={kw}>const</span> pcmStream = <span className={kw}>new</span>{' '}
          <span className={fn}>PassThrough</span>();
        </div>
        <div>
          <span className={kw}>const</span> wispr = <span className={fn}>createWisprStream</span>({'{ stream: pcmStream }'});
        </div>
        <br />
        <div>
          wispr.<span className={fn}>on</span>(<span className={str}>&apos;transcription&apos;</span>,{' '}
          <span className={kw}>async</span> (text) <span className={kw}>=&gt;</span> {'{'}
        </div>
        <div className={`ml-4 ${cm}`}>{'// send text to your LLM, then apply the edit'}</div>
        <div>{'}'});</div>
        <br />
        <div>
          wispr.<span className={fn}>start</span>();
        </div>
        <div className={cm}>{'// From webview: pcmStream.write(int16Buffer);'}</div>
      </CodeBlock>

      {/* Audio format */}
      <h2 id="audio-format" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        Audio Format
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        All inputs must be raw PCM with these exact parameters:
      </p>
      <ApiTable
        headers={['Property', 'Value']}
        rows={[
          [opt('Encoding'), desc('16-bit signed little-endian (Int16 LE)')],
          [opt('Sample rate'), desc('16,000 Hz')],
          [opt('Channels'), desc('Mono (1 channel)')],
          [opt('Chunking'), desc('Internally buffered into 20 ms frames (640 bytes each)')],
        ]}
      />

      {/* API: createWisprStream */}
      <h2
        id="createWisprStream"
        className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28"
      >
        createWisprStream(opts)
      </h2>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        Core engine. Import from <code className="text-xs bg-muted px-1 py-0.5 rounded">my-wispr-npm</code>.
      </p>

      <ApiTable
        headers={['Option', 'Type', 'Default', 'Description']}
        rows={[
          [
            opt('stream'),
            type('Readable'),
            def('required', true),
            desc('Node.js Readable of raw 16-bit LE PCM at 16 kHz mono.'),
          ],
          [
            opt('model'),
            type('string'),
            def('"base.en"'),
            desc('Whisper model name (e.g. tiny.en, base.en, small.en).'),
          ],
          [
            opt('windowChunks'),
            type('number'),
            def('2'),
            desc('Transcription window size in 20 ms chunks (2 = 40 ms). Must be ≥ 1.'),
          ],
          [
            opt('stepChunks'),
            type('number'),
            def('1'),
            desc('Slide step in 20 ms chunks. Must be ≥ 1 and ≤ windowChunks.'),
          ],
          [
            opt('whisperBin'),
            type('string'),
            def('auto'),
            desc('Override path to the whisper.cpp binary. Also reads WISPR_BIN.'),
          ],
          [
            opt('modelPath'),
            type('string'),
            def('auto'),
            desc('Override path to the .bin model file. Also reads WISPR_MODEL.'),
          ],
          [
            opt('onTranscription'),
            type('function'),
            def('—'),
            desc('Shorthand for .on("transcription", …).'),
          ],
          [
            opt('onError'),
            type('function'),
            def('—'),
            desc('Shorthand for .on("error", …).'),
          ],
        ]}
      />

      {/* API: createWisprServer */}
      <h2
        id="createWisprServer"
        className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28"
      >
        createWisprServer(opts)
      </h2>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        Optional WebSocket helper. Import from{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">my-wispr-npm/server</code>. Requires peer
        dependency <code className="text-xs bg-muted px-1 py-0.5 rounded">ws</code>. Accepts the same whisper
        options as <code className="text-xs bg-muted px-1 py-0.5 rounded">createWisprStream</code>.
      </p>

      <ApiTable
        headers={['Option', 'Type', 'Default', 'Description']}
        rows={[
          [opt('port'), type('number'), def('8080'), desc('Listen port.')],
          [opt('host'), type('string'), def('"0.0.0.0"'), desc('Listen host.')],
          [
            opt('path'),
            type('string'),
            def('—'),
            desc('Optional WebSocket path filter (e.g. "/transcribe").'),
          ],
          [
            opt('server'),
            type('http.Server'),
            def('—'),
            desc('Reuse an existing HTTP server instead of creating one.'),
          ],
          [
            opt('autoReply'),
            type('boolean'),
            def('true'),
            desc('Send JSON transcription / error messages to each client.'),
          ],
          [
            opt('model'),
            type('string'),
            def('"base.en"'),
            desc('Passed through to createWisprStream.'),
          ],
          [
            opt('windowChunks'),
            type('number'),
            def('2'),
            desc('Passed through to createWisprStream.'),
          ],
          [
            opt('stepChunks'),
            type('number'),
            def('1'),
            desc('Passed through to createWisprStream.'),
          ],
        ]}
      />

      <h3 className="text-base font-semibold text-foreground mt-8 mb-2">Server events</h3>
      <ApiTable
        headers={['Event', 'Payload', 'Description']}
        rows={[
          [opt('listening'), type('{ port, host }'), desc('HTTP server is listening.')],
          [
            opt('connection'),
            type('{ ws, wispr, req }'),
            desc('A new WebSocket client connected.'),
          ],
          [
            opt('transcription'),
            type('{ ws, text }'),
            desc('A transcription segment from any session.'),
          ],
          [opt('error'), type('Error'), desc('Server or session-level error.')],
          [
            opt('sessionError'),
            type('{ ws, error }'),
            desc('Error scoped to a single client session.'),
          ],
        ]}
      />

      {/* Events */}
      <h2 id="events" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        Events — createWisprStream
      </h2>
      <ApiTable
        headers={['Event', 'Payload', 'Description']}
        rows={[
          [
            opt('transcription'),
            type('string'),
            desc('Fired whenever a new transcription segment is ready.'),
          ],
          [opt('error'), type('Error'), desc('Fired on audio or transcription errors.')],
          [opt('start'), type('—'), desc('Fired when stream processing begins.')],
          [
            opt('stop'),
            type('—'),
            desc('Fired when the stream ends or stop() is called.'),
          ],
        ]}
      />

      {/* Methods */}
      <h2 id="methods" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        Methods
      </h2>

      <h3 className="text-base font-semibold text-foreground mt-6 mb-2">createWisprStream</h3>
      <ApiTable
        headers={['Method', 'Description']}
        rows={[
          [opt('start()'), desc('Begin reading PCM and emitting transcriptions. Throws if binary/model missing or already started.')],
          [opt('stop()'), desc('Stop processing, clear the queue, and destroy the input stream.')],
          [opt('on / once / off'), desc('Standard EventEmitter-style subscription.')],
        ]}
      />

      <h3 className="text-base font-semibold text-foreground mt-6 mb-2">createWisprServer</h3>
      <ApiTable
        headers={['Method / Property', 'Description']}
        rows={[
          [opt('listen([port], [host])'), desc('Start listening. Returns a Promise resolving to { port, host }.')],
          [opt('close()'), desc('Stop all sessions and close the WebSocket / HTTP server.')],
          [opt('httpServer'), desc('Underlying Node http.Server instance.')],
          [opt('wss'), desc('Underlying WebSocketServer instance.')],
          [opt('on / once / off'), desc('Standard EventEmitter-style subscription.')],
        ]}
      />

      {/* Configuration */}
      <h2 id="configuration" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        Configuration
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
        Override binary and model paths with environment variables instead of running setup:
      </p>

      <CodeBlock filename="Environment">
        <div>
          <span className={prop}>WISPR_BIN</span>=/path/to/whisper-cli
        </div>
        <div>
          <span className={prop}>WISPR_MODEL</span>=/path/to/ggml-base.en.bin
        </div>
        <div>
          <span className={prop}>WISPR_MODEL_NAME</span>=small.en{' '}
          <span className={cm}># used by npx my-wispr-setup</span>
        </div>
      </CodeBlock>

      {/* Troubleshooting */}
      <h2 id="troubleshooting" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        Troubleshooting
      </h2>
      <ApiTable
        headers={['Problem', 'Fix']}
        rows={[
          [
            desc('whisper binary not found'),
            desc('Run npx my-wispr-setup, or set WISPR_BIN to an existing whisper.cpp binary.'),
          ],
          [
            desc('model not found'),
            desc('Run setup, or set WISPR_MODEL / pass modelPath to a ggml-*.bin file.'),
          ],
          [
            desc('Cannot find module "ws"'),
            desc('Install the peer dependency: npm install ws.'),
          ],
          [
            desc('No transcription / blank audio'),
            desc('Confirm PCM is 16-bit LE, 16 kHz, mono. Increase windowChunks for longer context (e.g. 150).'),
          ],
          [
            desc('Already started'),
            desc('Call stop() before start() again on the same instance.'),
          ],
        ]}
      />

      {/* License */}
      <h2 id="license" className="text-xl font-semibold text-foreground mt-14 mb-3 scroll-mt-28">
        License
      </h2>
      <p className="text-muted-foreground mb-16 leading-relaxed text-sm">
        MIT — see the repository LICENSE file.
      </p>
    </article>
  );
}
