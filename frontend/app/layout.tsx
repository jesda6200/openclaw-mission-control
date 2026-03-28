import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NebulaLend',
  description: 'Plateforme lending crypto premium inspirée d’Aave avec auth email + wallet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
