import Link from 'next/link';
import Navbar from '../components/Navbar';

const nav = [
  {
    title: 'Getting Started',
    links: [
      { href: '/docs', label: 'Introduction' },
      { href: '#installation', label: 'Installation' },
      { href: '#architecture', label: 'Architecture' },
      { href: '#quickstart', label: 'Quick Start' },
      { href: '#audio-format', label: 'Audio Format' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { href: '#websocket', label: 'WebSocket Server' },
      { href: '#browser', label: 'Browser Client' },
      { href: '#desktop', label: 'Desktop' },
      { href: '#vscode', label: 'VS Code' },
    ],
  },
  {
    title: 'API Reference',
    links: [
      { href: '#createWisprStream', label: 'createWisprStream' },
      { href: '#createWisprServer', label: 'createWisprServer' },
      { href: '#events', label: 'Events' },
      { href: '#methods', label: 'Methods' },
    ],
  },
  {
    title: 'More',
    links: [
      { href: '#configuration', label: 'Configuration' },
      { href: '#troubleshooting', label: 'Troubleshooting' },
      { href: '#license', label: 'License' },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex container mx-auto px-4 md:px-8">
        <aside className="w-56 shrink-0 hidden lg:block py-10 pr-6 border-r border-border">
          <nav className="space-y-8 sticky top-24">
            {nav.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <main className="flex-1 py-10 lg:pl-12 max-w-3xl min-w-0">{children}</main>
      </div>
    </div>
  );
}
