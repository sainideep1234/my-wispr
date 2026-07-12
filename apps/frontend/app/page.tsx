import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <FeatureGrid />
        
        {/* Simple Footer built-in */}
        <footer className="py-8 border-t border-border bg-card">
          <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white text-xs font-bold">
                W
              </div>
              <span className="text-sm font-medium text-foreground">my-wispr</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Offline speech-to-text, made visual and simple.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Privacy</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
