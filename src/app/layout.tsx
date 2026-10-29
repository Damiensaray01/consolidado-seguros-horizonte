import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Consolidado Seguros Horizonte',
  description: 'Gestión Operativa de Cobranzas 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', color: '#0f172a' }}>
        {children}
      </body>
    </html>
  );
}