import './globals.css'

export const metadata = {
  title: 'ZEXTER AGENT — MNQ/NQ Pre-Market Intelligence',
  description: 'Pre-market futures trading intelligence for MNQ/NQ',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-terminal-bg text-terminal-text font-mono">
        {children}
      </body>
    </html>
  )
}
