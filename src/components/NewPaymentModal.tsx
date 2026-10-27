'use client';

import React, { useState } from 'react';
import { Asegurado } from '../types';
import { calcularStatusPago } from '../lib/utils';
import { X, PlusCircle } from 'lucide-react';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (nuevoPago: Asegurado) => Promise<void>;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({ isOpen, onClose, onAddPayment }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreApellido: '',
    cedula: '',
    telefono: '',
    uds: 5.99,
    banco: 'BANCO PLAZA',
    mes: 'AGOSTO',
    fechaPago: new Date().toLocaleDateString('es-VE'),
    emisiones: 1,
    cuotaSeptiembre: 1,
    cuotaOctubre: 0,
    cuotaNoviembre: 0,
    cuotaDiciembre: 0,
    referencia: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const totalPagadas = formData.cuotaSeptiembre + formData.cuotaOctubre + formData.cuotaNoviembre + formData.cuotaDiciembre;
    const statusPago = calcularStatusPago(totalPagadas, formData.emisiones);

    const nuevoAsegurado: Asegurado = {
      ...formData,
      statusPago,
    };

    await onAddPayment(nuevoAsegurado);
    setLoading(false);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#020617',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    color: '#ffffff',
    fontSize: '0.75rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginBottom: '0.25rem',
    fontWeight: 600,
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '1rem',
        maxWidth: '550px',
        width: '100%',
        padding: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        color: '#f8fafc',
      }}>
        
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="#3b82f6" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Registrar Pago Manual</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Nombre y Apellido</label>
              <input
                type="text"
                required
                value={formData.nombreApellido}
                onChange={(e) => setFormData({ ...formData, nombreApellido: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Cédula de Identidad</label>
              <input
                type="text"
                required
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input
                type="text"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Monto UDS ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.uds}
                onChange={(e) => setFormData({ ...formData, uds: parseFloat(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Banco</label>
              <select
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                style={inputStyle}
              >
                <option value="BANCO PLAZA">BANCO PLAZA</option>
                <option value="BANESCO">BANESCO</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Nro. Referencia</label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Fecha de Pago</label>
              <input
                type="text"
                value={formData.fechaPago}
                onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Asignación de Cuotas Pagadas (1 o 0):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              <div>
                <label style={labelStyle}>Sep</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  value={formData.cuotaSeptiembre}
                  onChange={(e) => setFormData({ ...formData, cuotaSeptiembre: parseInt(e.target.value) || 0 })}
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Oct</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  value={formData.cuotaOctubre}
                  onChange={(e) => setFormData({ ...formData, cuotaOctubre: parseInt(e.target.value) || 0 })}
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Nov</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  value={formData.cuotaNoviembre}
                  onChange={(e) => setFormData({ ...formData, cuotaNoviembre: parseInt(e.target.value) || 0 })}
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Dic</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  value={formData.cuotaDiciembre}
                  onChange={(e) => setFormData({ ...formData, cuotaDiciembre: parseInt(e.target.value) || 0 })}
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              padding: '0.65rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Pago en Firebase'}
          </button>
        </form>
      </div>
    </div>
  );
};