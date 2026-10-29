'use client';

import React from 'react';
import { Asegurado } from '@/types';

interface KpiCardsProps {
  asegurados: Asegurado[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ asegurados }) => {
  const totalPagos = asegurados.length;
  const solventes = asegurados.filter(i => (i.estatus || i.statusPago || '').toLowerCase().includes('solvente')).length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Registros</span>
        <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{totalPagos}</h3>
      </div>
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Asegurados Solventes</span>
        <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>{solventes}</h3>
      </div>
    </div>
  );
};