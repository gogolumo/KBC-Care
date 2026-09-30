import './globals.css';

export const metadata = {
  title: 'KBC Compass — customer context demo',
  description: 'A synthetic, consent-first banking experience demo.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
