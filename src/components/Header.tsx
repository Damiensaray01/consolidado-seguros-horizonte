'use client';

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header style={{ backgroundColor: '#ffffff', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
          Consolidado de Pagos Cobranzas - Seguros Horizonte
        </h1>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
          Business Intelligence 2026 • Gestión Operativa
        </p>
      </div>
      <button 
        style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
      >
        Cerrar Sesión
      </button>
    </header>
  );
};