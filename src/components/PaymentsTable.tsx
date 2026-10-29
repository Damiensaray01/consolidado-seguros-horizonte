'use client';

import React from 'react';
import { Asegurado } from '@/types';

interface PaymentsTableProps {
  asegurados: Asegurado[];
  onSelectAsegurado: (asegurado: Asegurado) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ asegurados, onSelectAsegurado }) => {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
            <th style={{ padding: '0.6rem 0.8rem' }}>Fecha</th>
            <th style={{ padding: '0.6rem 0.8rem' }}>Titular</th>
            <th style={{ padding: '0.6rem 0.8rem' }}>Cédula</th>
            <th style={{ padding: '0.6rem 0.8rem' }}>Banco</th>
            <th style={{ padding: '0.6rem 0.8rem' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {asegurados.map((item, idx) => (
            <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.55rem 0.8rem' }}>{item.fechaPago || '-'}</td>
              <td style={{ padding: '0.55rem 0.8rem', fontWeight: 600 }}>{item.nombreApellido || '-'}</td>
              <td style={{ padding: '0.55rem 0.8rem' }}>{item.cedula || '-'}</td>
              <td style={{ padding: '0.55rem 0.8rem' }}>{item.banco || '-'}</td>
              <td style={{ padding: '0.55rem 0.8rem' }}>
                <button onClick={() => onSelectAsegurado(item)} style={{ cursor: 'pointer', padding: '0.2rem 0.5rem' }}>Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};