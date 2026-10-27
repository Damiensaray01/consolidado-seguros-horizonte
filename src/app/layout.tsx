import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consolidado de Pagos - Seguros Horizonte',
  description: 'Gestión y control de cobranzas Banco Plaza - Banesco',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}