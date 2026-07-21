import { kw, fn, str, cm } from './CodeBlock';

export default function CodeSnippet() {
  return (
    <div className="rounded-xl border border-border bg-[#0f1419] shadow-2xl overflow-hidden text-left">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#161b22] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="ml-4 text-xs font-mono text-zinc-400">quickstart.js</div>
      </div>
      <div className="p-4 md:p-6 text-sm font-mono leading-relaxed overflow-x-auto text-zinc-100">
        <div>
          <span className={kw}>import</span> {'{ createWisprServer }'} <span className={kw}>from</span>{' '}
          <span className={str}>&apos;my-wispr-npm/server&apos;</span>;
        </div>
        <br />
        <div className={cm}>{'// WebSocket SaaS — browser mic → this server → text'}</div>
        <div>
          <span className={kw}>const</span> server = <span className={fn}>createWisprServer</span>
          ({'{ port: 8080 }'});
        </div>
        <br />
        <div>
          server.<span className={fn}>on</span>(<span className={str}>&apos;transcription&apos;</span>, (
          {'{ text }'}) <span className={kw}>=&gt;</span> {'{'}
        </div>
        <div className="ml-4">
          console.<span className={fn}>log</span>(text);
        </div>
        <div>{'}'});</div>
        <br />
        <div>
          <span className={kw}>await</span> server.<span className={fn}>listen</span>();
        </div>
      </div>
    </div>
  );
}
