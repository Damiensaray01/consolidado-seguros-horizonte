'use client';

import React from 'react';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', width: '100%', maxWidth: '400px' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem', fontWeight: 700 }}>Nuevo Registro de Pago</h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Formulario para agregar un pago individual a Firestore.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={onClose} style={{ padding: '0.4rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', backgroundColor: '#fff', cursor: 'pointer' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};