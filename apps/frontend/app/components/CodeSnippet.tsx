export default function CodeSnippet() {
  return (
    <div className="rounded-xl border border-border bg-[#1e1e1e] shadow-2xl overflow-hidden text-left">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#2d2d2d] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-xs font-mono text-white/50">quickstart.js</div>
      </div>
      <div className="p-4 md:p-6 text-sm font-mono leading-relaxed overflow-x-auto">
        <div className="text-pink-400">const <span className="text-white">createWispr</span> = <span className="text-blue-400">require</span>(<span className="text-green-400">'my-wispr-npm'</span>);</div>
        <br/>
        <div className="text-white/50 italic">// 1. Initialize the offline transcriber</div>
        <div className="text-pink-400">const <span className="text-white">wispr</span> = <span className="text-yellow-300">createWispr</span>();</div>
        <br/>
        <div className="text-white/50 italic">// 2. Listen for real-time transcriptions</div>
        <div className="text-white">wispr.<span className="text-yellow-300">on</span>(<span className="text-green-400">'transcription'</span>, (<span className="text-orange-300">text</span>) <span className="text-pink-400">{`=>`}</span> {`{`}</div>
        <div className="text-white ml-4"><span className="text-blue-400">console</span>.<span className="text-yellow-300">log</span>(<span className="text-green-400">{"`User said: ${"}</span><span className="text-white">text</span><span className="text-green-400">{"}`"}</span>);</div>
        <div className="text-white">{`}`});</div>
        <br/>
        <div className="text-white/50 italic">// 3. Start capturing audio (zero latency, no cloud)</div>
        <div className="text-white">wispr.<span className="text-yellow-300">start</span>();</div>
      </div>
    </div>
  );
}
