export const metadata = {
  title: 'Pashto Bible MVP',
  description: 'Minimal Supabase + Next.js search',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu',
        background: '#0b0f14',
        color: '#e6edf3'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>{children}</div>
      </body>
    </html>
  );
}

