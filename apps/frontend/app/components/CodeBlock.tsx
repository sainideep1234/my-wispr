import type { ReactNode } from 'react';

type CodeBlockProps = {
  filename?: string;
  children: ReactNode;
  className?: string;
};

/** Dark code panel with light default text — avoids prose inheriting dark-on-dark. */
export default function CodeBlock({ filename, children, className = '' }: CodeBlockProps) {
  return (
    <div
      className={`rounded-lg overflow-hidden border border-border bg-[#0f1419] my-6 not-prose ${className}`}
    >
      {filename ? (
        <div className="border-b border-white/10 bg-[#161b22] px-4 py-2 flex items-center">
          <span className="text-xs font-mono text-zinc-400">{filename}</span>
        </div>
      ) : null}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-100">
        {children}
      </div>
    </div>
  );
}

/** Syntax tokens — high contrast on dark panels */
export const kw = 'text-[#ff7b72]'; // keywords
export const fn = 'text-[#d2a8ff]'; // functions / calls
export const str = 'text-[#a5d6ff]'; // strings
export const num = 'text-[#79c0ff]'; // numbers
export const cm = 'text-zinc-500'; // comments
export const prop = 'text-[#ffa657]'; // properties / keys
