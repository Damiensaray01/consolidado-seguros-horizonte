'use client';

import React from 'react';
import { Asegurado } from '@/types';

interface KpiCardsProps {
  asegurados: Asegurado[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  selectedMonth: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ 
  asegurados, 
  selectedStatus, 
  onSelectStatus,
  selectedMonth 
}) => {
  const totalCartera = asegurados.length;
  
  const solventesCount = asegurados.filter(i => i.estatusCalculado === 'Solvente').length;
  const conDeudaCount = totalCartera - solventesCount;

  const solventesPorcentaje = totalCartera > 0 ? ((solventesCount / totalCartera) * 100).toFixed(1) : '0.0';
  const deudaPorcentaje = totalCartera > 0 ? ((conDeudaCount / totalCartera) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem', fontFamily: 'sans-serif' }}>
      
      {/* Tarjeta Cartera Total */}
      <div 
        onClick={() => onSelectStatus('Todos')}
        style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '0.5rem',
          border: selectedStatus === 'Todos' ? '2px solid #0284c7' : '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Cartera Total {selectedMonth !== 'TODOS' ? `(${selectedMonth})` : ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {totalCartera}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            Clientes en el período
          </span>
        </div>
      </div>

      {/* Tarjeta Solventes */}
      <div 
        onClick={() => onSelectStatus('Solventes')}
        style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '0.5rem',
          border: selectedStatus === 'Solventes' ? '2px solid #16a34a' : '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Solventes
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
            {solventesPorcentaje}% Impacto
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#166534' }}>
            {solventesCount}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            Al día en todos
          </span>
        </div>
      </div>

      {/* Tarjeta Con Deuda */}
      <div 
        onClick={() => onSelectStatus('Debe 1 Cuota')}
        style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '0.5rem',
          border: selectedStatus.includes('Debe') ? '2px solid #dc2626' : '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Con Deuda
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
            {deudaPorcentaje}% Impacto
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#991b1b' }}>
            {conDeudaCount}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            Con cuotas pendientes
          </span>
        </div>
      </div>

    </div>
  );
};