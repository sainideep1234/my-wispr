export default function DocsPage() {
  return (
    <div className="prose prose-zinc prose-a:text-primary hover:prose-a:text-primary-hover max-w-none">
      <div className="mb-2 text-sm font-semibold text-primary">Documentation</div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
        Real-time browser speech-to-text
      </h1>
      <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
        my-wispr is a Node.js library that powers the <strong>Web SaaS pattern</strong>: your browser
        captures the microphone using the standard Web Audio API, streams raw audio over a WebSocket to
        your server, and whisper.cpp transcribes it in real-time — no cloud APIs, no data leaving your
        server, works on any device.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Architecture</h2>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        The full pipeline from browser mic to transcribed text:
      </p>

      <div className="rounded-xl overflow-hidden border border-border bg-[#1e1e1e] my-6">
        <div className="border-b border-white/10 bg-[#2d2d2d] px-4 py-2 flex items-center">
          <span className="text-xs font-mono text-white/50">Architecture</span>
        </div>
        <div className="p-6 font-mono text-sm leading-loose">
          <div className="flex flex-col gap-1">
            <div className="text-blue-400 font-semibold">Browser (any device — iPhone, Android, desktop)</div>
            <div className="text-white/60 ml-4">│  navigator.mediaDevices.getUserMedia()</div>
            <div className="text-white/60 ml-4">│  Web Audio API → Float32 → Int16 PCM</div>
            <div className="text-white/60 ml-4">│  WebSocket.send(pcmBuffer)</div>
            <div className="text-green-400 ml-4">▼</div>
            <div className="text-green-400 font-semibold">Your Node.js Server  ← my-wispr-npm</div>
            <div className="text-white/60 ml-4">│  ws.on(&apos;message&apos;) → PassThrough stream</div>
            <div className="text-white/60 ml-4">│  Sliding-window queue (40ms / 20ms overlap)</div>
            <div className="text-white/60 ml-4">│  WAV header + PCM piped via stdin</div>
            <div className="text-yellow-400 ml-4">▼</div>
            <div className="text-yellow-400 font-semibold">whisper.cpp  (on your server)</div>
            <div className="text-white/60 ml-4">│  Offline, no network, no API key</div>
            <div className="text-pink-400 ml-4">▼</div>
            <div className="text-pink-400 font-semibold">emit(&apos;transcription&apos;, text)</div>
            <div className="text-white/60 ml-4">│  ws.send(JSON.stringify(&#123; type: &apos;transcription&apos;, text &#125;))</div>
            <div className="text-blue-400 ml-4">▼</div>
            <div className="text-blue-400 font-semibold">Browser receives text</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quick Start</h2>

      <div className="rounded-xl overflow-hidden border border-border bg-[#1e1e1e] my-6">
        <div className="border-b border-white/10 bg-[#2d2d2d] px-4 py-2 flex items-center">
          <span className="text-xs font-mono text-white/50">Terminal</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-white m-0 p-0 bg-transparent">
            <code><span className="text-pink-400">npm</span> install my-wispr-npm ws</code>
          </pre>
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mt-8 mb-4">1. WebSocket Server (Node.js)</h3>

      <div className="rounded-xl overflow-hidden border border-border bg-[#1e1e1e] my-6">
        <div className="border-b border-white/10 bg-[#2d2d2d] px-4 py-2 flex items-center">
          <span className="text-xs font-mono text-white/50">server.js</span>
        </div>
        <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
          <div><span className="text-pink-400">const</span> <span className="text-white">http</span> = <span className="text-blue-400">require</span>(<span className="text-green-400">&apos;http&apos;</span>);</div>
          <div><span className="text-pink-400">const</span> {'{ WebSocketServer }'} = <span className="text-blue-400">require</span>(<span className="text-green-400">&apos;ws&apos;</span>);</div>
          <div><span className="text-pink-400">const</span> {'{ PassThrough }'} = <span className="text-blue-400">require</span>(<span className="text-green-400">&apos;stream&apos;</span>);</div>
          <div><span className="text-pink-400">const</span> {'{ createWisprStream }'} = <span className="text-blue-400">require</span>(<span className="text-green-400">&apos;my-wispr-npm&apos;</span>);</div>
          <br />
          <div><span className="text-pink-400">const</span> <span className="text-white">wss</span> = <span className="text-pink-400">new</span> <span className="text-yellow-300">WebSocketServer</span>({'{ port: 8080 }'});</div>
          <br />
          <div>wss.<span className="text-yellow-300">on</span>(<span className="text-green-400">&apos;connection&apos;</span>, (ws) <span className="text-pink-400">=&gt;</span> {'{'}</div>
          <div className="ml-4"><span className="text-pink-400">const</span> pcmStream = <span className="text-pink-400">new</span> <span className="text-yellow-300">PassThrough</span>();</div>
          <div className="ml-4"><span className="text-pink-400">const</span> wispr = <span className="text-yellow-300">createWisprStream</span>({'{ stream: pcmStream }'})</div>
          <br />
          <div className="ml-4">wispr.<span className="text-yellow-300">on</span>(<span className="text-green-400">&apos;transcription&apos;</span>, (text) <span className="text-pink-400">=&gt;</span></div>
          <div className="ml-8">ws.<span className="text-yellow-300">send</span>(<span className="text-blue-400">JSON</span>.<span className="text-yellow-300">stringify</span>({'{ type: \'transcription\', text }'})));</div>
          <br />
          <div className="ml-4">ws.<span className="text-yellow-300">on</span>(<span className="text-green-400">&apos;message&apos;</span>, (data) <span className="text-pink-400">=&gt;</span> pcmStream.<span className="text-yellow-300">write</span>(data));</div>
          <div className="ml-4">ws.<span className="text-yellow-300">on</span>(<span className="text-green-400">&apos;close&apos;</span>, () <span className="text-pink-400">=&gt;</span> wispr.<span className="text-yellow-300">stop</span>());</div>
          <div className="ml-4">wispr.<span className="text-yellow-300">start</span>();</div>
          <div>{'}'});</div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mt-8 mb-4">2. Browser Client (Web Audio API)</h3>

      <div className="rounded-xl overflow-hidden border border-border bg-[#1e1e1e] my-6">
        <div className="border-b border-white/10 bg-[#2d2d2d] px-4 py-2 flex items-center">
          <span className="text-xs font-mono text-white/50">client.js</span>
        </div>
        <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
          <div><span className="text-pink-400">const</span> ws = <span className="text-pink-400">new</span> <span className="text-yellow-300">WebSocket</span>(<span className="text-green-400">&apos;ws://localhost:8080&apos;</span>);</div>
          <div><span className="text-pink-400">const</span> audioCtx = <span className="text-pink-400">new</span> <span className="text-yellow-300">AudioContext</span>({'{ sampleRate: 16000 }'});</div>
          <br />
          <div><span className="text-pink-400">const</span> stream = <span className="text-pink-400">await</span> navigator.mediaDevices.<span className="text-yellow-300">getUserMedia</span>({'{ audio: true }'});</div>
          <div><span className="text-pink-400">const</span> source = audioCtx.<span className="text-yellow-300">createMediaStreamSource</span>(stream);</div>
          <div><span className="text-pink-400">const</span> processor = audioCtx.<span className="text-yellow-300">createScriptProcessor</span>(<span className="text-orange-300">1024</span>, <span className="text-orange-300">1</span>, <span className="text-orange-300">1</span>);</div>
          <br />
          <div>processor.onaudioprocess = (e) <span className="text-pink-400">=&gt;</span> {'{'}</div>
          <div className="ml-4"><span className="text-pink-400">const</span> f32 = e.inputBuffer.<span className="text-yellow-300">getChannelData</span>(<span className="text-orange-300">0</span>);</div>
          <div className="ml-4"><span className="text-pink-400">const</span> i16 = <span className="text-pink-400">new</span> <span className="text-yellow-300">Int16Array</span>(f32.length);</div>
          <div className="ml-4"><span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-orange-300">0</span>; i {'<'} f32.length; i++)</div>
          <div className="ml-8">i16[i] = <span className="text-blue-400">Math</span>.<span className="text-yellow-300">max</span>(<span className="text-orange-300">-32768</span>, <span className="text-blue-400">Math</span>.<span className="text-yellow-300">min</span>(<span className="text-orange-300">32767</span>, f32[i] * <span className="text-orange-300">32768</span>));</div>
          <div className="ml-4"><span className="text-pink-400">if</span> (ws.readyState === WebSocket.OPEN) ws.<span className="text-yellow-300">send</span>(i16.buffer);</div>
          <div>{'}'};</div>
          <br />
          <div>source.<span className="text-yellow-300">connect</span>(processor);</div>
          <div>processor.<span className="text-yellow-300">connect</span>(audioCtx.destination);</div>
          <br />
          <div>ws.onmessage = (e) <span className="text-pink-400">=&gt;</span> {'{'}</div>
          <div className="ml-4"><span className="text-pink-400">const</span> msg = <span className="text-blue-400">JSON</span>.<span className="text-yellow-300">parse</span>(e.data);</div>
          <div className="ml-4"><span className="text-pink-400">if</span> (msg.type === <span className="text-green-400">&apos;transcription&apos;</span>) <span className="text-blue-400">console</span>.<span className="text-yellow-300">log</span>(msg.text);</div>
          <div>{'}'}</div>
        </div>
      </div>

      <h2 id="factory" className="text-2xl font-bold text-foreground mt-12 mb-6">API Reference — createWisprStream(opts)</h2>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Option</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Default</th>
              <th className="px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            <tr>
              <td className="px-4 py-3 font-mono text-primary">stream</td>
              <td className="px-4 py-3 text-muted-foreground">Readable</td>
              <td className="px-4 py-3 font-mono text-red-400">required</td>
              <td className="px-4 py-3 text-foreground">Node.js Readable of raw 16-bit LE PCM at 16kHz mono.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">model</td>
              <td className="px-4 py-3 text-muted-foreground">string</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">&quot;base.en&quot;</td>
              <td className="px-4 py-3 text-foreground">Whisper model name (e.g. tiny.en, base.en, small.en).</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">windowChunks</td>
              <td className="px-4 py-3 text-muted-foreground">number</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">2</td>
              <td className="px-4 py-3 text-foreground">Transcription window size in 20ms chunks (2 = 40ms).</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">stepChunks</td>
              <td className="px-4 py-3 text-muted-foreground">number</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">1</td>
              <td className="px-4 py-3 text-foreground">Slide step in 20ms chunks (1 = 20ms overlap).</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">whisperBin</td>
              <td className="px-4 py-3 text-muted-foreground">string</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">auto</td>
              <td className="px-4 py-3 text-foreground">Override path to whisper.cpp binary. Also reads WISPR_BIN env var.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">modelPath</td>
              <td className="px-4 py-3 text-muted-foreground">string</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">auto</td>
              <td className="px-4 py-3 text-foreground">Override path to .bin model file. Also reads WISPR_MODEL env var.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="events" className="text-2xl font-bold text-foreground mt-12 mb-6">Events</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Payload</th>
              <th className="px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            <tr>
              <td className="px-4 py-3 font-mono text-primary">transcription</td>
              <td className="px-4 py-3 text-muted-foreground">string</td>
              <td className="px-4 py-3 text-foreground">Fired whenever a new transcription segment is ready.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">error</td>
              <td className="px-4 py-3 text-muted-foreground">Error</td>
              <td className="px-4 py-3 text-foreground">Fired on audio or transcription errors.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">start</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-foreground">Fired when stream processing begins.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">stop</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-foreground">Fired when the stream ends or stop() is called.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground mt-6 mb-10">
        Set <code>WISPR_BIN</code> and <code>WISPR_MODEL</code> environment variables to override the whisper binary and model paths without changing code.
      </p>
    </div>
  );
}
