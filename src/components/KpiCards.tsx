'use client';

import React from 'react';
import { Asegurado } from '@/types';

interface KpiCardsProps {
  asegurados: Asegurado[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ asegurados, selectedStatus, onSelectStatus }) => {
  const total = asegurados.length;
  const solventes = asegurados.filter(i => i.estatusCalculado === 'Solvente').length;
  const deudores = total - solventes;

  const porcentajeSolventes = total > 0 ? ((solventes / total) * 100).toFixed(1) : '0.0';
  const porcentajeDeuda = total > 0 ? ((deudores / total) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem', fontFamily: 'sans-serif' }}>
      
      {/* Tarjeta 1: Total Cartera (Muestra Todos) */}
      <div 
        onClick={() => onSelectStatus('Todos')}
        style={{ backgroundColor: '#ffffff', padding: '1.2rem', borderRadius: '0.5rem', border: selectedStatus === 'Todos' ? '2px solid #0284c7' : '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cartera</span>
          <span style={{ fontSize: '1.1rem' }}>👥</span>
        </div>
        <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{total}</h3>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>Clientes únicos consolidados</p>
      </div>

      {/* Tarjeta 2: Solventes (Filtra Solventes) */}
      <div 
        onClick={() => onSelectStatus('Solventes')}
        style={{ backgroundColor: '#ffffff', padding: '1.2rem', borderRadius: '0.5rem', border: selectedStatus === 'Solventes' ? '2px solid #16a34a' : '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solventes</span>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 600 }}>
            {porcentajeSolventes}% Impacto
          </span>
        </div>
        <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#16a34a' }}>{solventes}</h3>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>Al día con sus pagos</p>
      </div>

      {/* Tarjeta 3: Deuda Pendiente (Filtra Deudores) */}
      <div 
        onClick={() => onSelectStatus('Debe + de 1 Cuota')}
        style={{ backgroundColor: '#ffffff', padding: '1.2rem', borderRadius: '0.5rem', border: selectedStatus.includes('Debe') ? '2px solid #d97706' : '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Con Deuda Pendiente</span>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 600 }}>
            {porcentajeDeuda}% Impacto
          </span>
        </div>
        <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#d97706' }}>{deudores}</h3>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>Requieren gestión de cobranza</p>
      </div>

    </div>
  );
};