'use client';

import React from 'react';
import { Asegurado } from '@/types';

interface ReceiptModalProps {
  asegurado: Asegurado | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ asegurado, onClose }) => {
  if (!asegurado) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', width: '100%', maxWidth: '450px' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem', fontWeight: 700 }}>Detalle de Asegurado</h3>
        <p><strong>Titular:</strong> {asegurado.nombreApellido || '-'}</p>
        <p><strong>Cédula:</strong> {asegurado.cedula || '-'}</p>
        <p><strong>Estatus:</strong> {asegurado.estatus || asegurado.statusPago || 'Solvente'}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button onClick={onClose} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};