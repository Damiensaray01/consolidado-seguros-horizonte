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
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          ✏️ Detalle y Edición de Asegurado
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem', fontSize: '0.85rem', color: '#334155' }}>
          <p style={{ margin: 0 }}><strong>Titular:</strong> {asegurado.nombreApellido || '-'}</p>
          <p style={{ margin: 0 }}><strong>Cédula:</strong> {asegurado.cedula || '-'}</p>
          <p style={{ margin: 0 }}><strong>Teléfono:</strong> {asegurado.telefono || '-'}</p>
          <p style={{ margin: 0 }}><strong>Banco:</strong> {asegurado.banco || '-'}</p>
          <p style={{ margin: 0 }}><strong>Fecha Último Pago:</strong> {asegurado.fechaPago || '-'}</p>
          <p style={{ margin: 0 }}><strong>Estatus Actual:</strong> 
            <span style={{ marginLeft: '0.5rem', padding: '0.1rem 0.5rem', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.75rem' }}>
              {asegurado.estatusCalculado || 'Solvente'}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ padding: '0.45rem 1.2rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '0.3rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};