import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="my-wispr logo" width={32} height={32} className="rounded" />
            <span className="text-xl font-semibold tracking-tight text-foreground">my-wispr</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <div className="group relative">
              <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                Products
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 top-full hidden w-64 pt-2 group-hover:block">
                <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
                  <Link href="/docs" className="flex items-start gap-3 rounded-md p-3 hover:bg-muted transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-primary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">NPM Package</div>
                      <div className="text-xs text-muted-foreground">Docs & API reference</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/sainideep1234/my-wispr" target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden md:block">
            GitHub
          </a>
          <Link href="/docs" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary hover:text-white transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
