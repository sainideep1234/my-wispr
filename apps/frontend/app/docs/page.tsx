export default function DocsPage() {
  return (
    <div className="prose prose-zinc prose-a:text-primary hover:prose-a:text-primary-hover max-w-none">
      <div className="mb-2 text-sm font-semibold text-primary">Documentation</div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
        High-performance offline transcription
      </h1>
      <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
        my-wispr is a Node.js library that provides real-time, privacy-first speech-to-text capabilities 
        using whisper.cpp under the hood. No cloud APIs, no network latency, no data leaving your machine.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quick Start</h2>
      
      <div className="rounded-xl overflow-hidden border border-border bg-[#1e1e1e] my-6">
        <div className="border-b border-white/10 bg-[#2d2d2d] px-4 py-2 flex items-center">
          <span className="text-xs font-mono text-white/50">Terminal</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-white m-0 p-0 bg-transparent">
            <code><span className="text-pink-400">npm</span> install my-wispr-npm</code>
          </pre>
        </div>
      </div>

      <p className="text-muted-foreground mb-4">
        You'll also need the whisper.cpp binary. During installation, the package will attempt to guide you 
        on setting it up if it's not found in the default location.
      </p>

      <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Basic Implementation</h3>
      
      <div className="rounded-xl overflow-hidden border border-border bg-[#1e1e1e] my-6">
        <div className="border-b border-white/10 bg-[#2d2d2d] px-4 py-2 flex items-center">
          <span className="text-xs font-mono text-white/50">index.js</span>
        </div>
        <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
          <div className="text-pink-400">const <span className="text-white">createWispr</span> = <span className="text-blue-400">require</span>(<span className="text-green-400">'my-wispr-npm'</span>);</div>
          <br/>
          <div className="text-white/50 italic">// Create instance</div>
          <div className="text-pink-400">const <span className="text-white">wispr</span> = <span className="text-yellow-300">createWispr</span>({`{`}</div>
          <div className="text-white ml-4">model: <span className="text-green-400">'base.en'</span>,</div>
          <div className="text-white ml-4">windowChunks: <span className="text-orange-300">150</span>, <span className="text-white/50 italic">// 3 seconds</span></div>
          <div className="text-white ml-4">stepChunks: <span className="text-orange-300">75</span>     <span className="text-white/50 italic">// 1.5 seconds slide</span></div>
          <div className="text-white">{`}`});</div>
          <br/>
          <div className="text-white/50 italic">// Listen for events</div>
          <div className="text-white">wispr.<span className="text-yellow-300">on</span>(<span className="text-green-400">'transcription'</span>, (<span className="text-orange-300">text</span>) <span className="text-pink-400">{`=>`}</span> {`{`}</div>
          <div className="text-white ml-4"><span className="text-blue-400">console</span>.<span className="text-yellow-300">log</span>(<span className="text-green-400">{"`[${"}</span><span className="text-white">new</span> <span className="text-yellow-300">Date</span>().<span className="text-yellow-300">toLocaleTimeString</span>()<span className="text-green-400">{"}]`"}</span>, text);</div>
          <div className="text-white">{`}`});</div>
          <br/>
          <div className="text-white">wispr.<span className="text-yellow-300">start</span>();</div>
        </div>
      </div>

      <h2 id="factory" className="text-2xl font-bold text-foreground mt-12 mb-6">Configuration Reference</h2>
      
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Default</th>
              <th className="px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            <tr>
              <td className="px-4 py-3 font-mono text-primary">model</td>
              <td className="px-4 py-3 text-muted-foreground">string</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">"base.en"</td>
              <td className="px-4 py-3 text-foreground">The whisper model to use (e.g. tiny.en, base.en).</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">windowChunks</td>
              <td className="px-4 py-3 text-muted-foreground">number</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">150</td>
              <td className="px-4 py-3 text-foreground">Number of 20ms chunks in a transcription window (150 = 3s).</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">stepChunks</td>
              <td className="px-4 py-3 text-muted-foreground">number</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">75</td>
              <td className="px-4 py-3 text-foreground">Number of chunks to slide the window forward (75 = 1.5s overlap).</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">whisperBin</td>
              <td className="px-4 py-3 text-muted-foreground">string</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">undefined</td>
              <td className="px-4 py-3 text-foreground">Absolute path to whisper.cpp binary. Overrides convention and WISPR_BIN.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-primary">modelPath</td>
              <td className="px-4 py-3 text-muted-foreground">string</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">undefined</td>
              <td className="px-4 py-3 text-foreground">Absolute path to model file. Overrides `model` name convention.</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p className="text-sm text-muted-foreground mt-4 mb-10">
        You can also set the <code>WISPR_BIN</code> environment variable instead of passing <code>whisperBin</code> programmatically.
      </p>
    </div>
  );
}
