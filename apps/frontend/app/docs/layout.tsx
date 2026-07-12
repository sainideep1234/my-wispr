import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex container mx-auto px-4 md:px-8">
        <aside className="w-64 flex-shrink-0 hidden md:block py-10 pr-8 border-r border-border">
          <nav className="space-y-8 sticky top-24">
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm tracking-tight">Getting Started</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-primary font-medium">Quickstart</Link></li>
                <li><Link href="#architecture" className="text-muted-foreground hover:text-foreground">Architecture</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm tracking-tight">API Reference</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#factory" className="text-muted-foreground hover:text-foreground">Configuration</Link></li>
                <li><Link href="#events" className="text-muted-foreground hover:text-foreground">Events</Link></li>
              </ul>
            </div>
          </nav>
        </aside>
        <main className="flex-1 py-10 md:pl-12 max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  );
}
