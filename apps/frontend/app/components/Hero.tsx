import Link from 'next/link';
import CodeSnippet from './CodeSnippet';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-6">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              v1.0.0 is live
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              High-Performance Offline <br className="hidden lg:block"/>
              <span className="text-primary">Speech-to-Text</span> for Node
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Give your desktop apps lightning-fast, privacy-first voice dictation. Powered by whisper.cpp with zero cloud dependencies and complete local processing.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-8">
              <Link href="/docs" className="rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/25 w-full sm:w-auto text-center flex items-center justify-center gap-2">
                Start building
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a href="https://github.com/sainideep1234/my-wispr" target="_blank" rel="noreferrer" className="rounded-full border border-border bg-card px-8 py-3.5 text-sm font-medium text-foreground hover:bg-muted transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2">
                View on GitHub
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                Offline First
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                npm install
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground"></div>
                Privacy focused
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl -z-10 rounded-full"></div>
            <CodeSnippet />
          </div>
          
        </div>
      </div>
    </section>
  );
}
