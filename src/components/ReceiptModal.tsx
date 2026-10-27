'use client';

import React from 'react';
import { Asegurado } from '../types';
import { X, ExternalLink, Calendar, CreditCard, User, Phone, CheckCircle, FileText } from 'lucide-react';

interface ReceiptModalProps {
  asegurado: Asegurado | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ asegurado, onClose }) => {
  if (!asegurado) return null;

  // Convertir y normalizar de forma segura el monto USD
  const parseMontoUSD = (val: any): number => {
    if (val === undefined || val === null) return 5.99;
    let num = typeof val === 'number' ? val : parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 5.99;
    return num > 100 ? num / 100 : num;
  };

  const montoUSD = parseMontoUSD(asegurado.uds);

  const formatFecha = (fechaRaw: any) => {
    if (!fechaRaw) return '-';
    if (typeof fechaRaw === 'string' && !fechaRaw.includes('GMT') && !fechaRaw.includes('T')) return fechaRaw;
    try {
      const d = new Date(fechaRaw);
      if (isNaN(d.getTime())) return String(fechaRaw);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return String(fechaRaw);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '1rem', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Cabecera del Modal */}
        <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Comprobante de Pago
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0.2rem', borderRadius: '0.375rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo con los detalles del pago */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
          
          <div style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Monto Registrado</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '0.1rem' }}>
                ${montoUSD.toFixed(2)}
              </div>
            </div>
            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={12} /> {asegurado.statusPago || 'Solvente'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={12} /> Titular
              </span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#f8fafc', fontSize: '0.8rem' }}>
                {asegurado.nombreApellido}
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cédula de Identidad</span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#f8fafc', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {asegurado.cedula}
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={12} /> Teléfono
              </span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#f8fafc', fontSize: '0.8rem' }}>
                {asegurado.telefono || '-'}
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={12} /> Fecha de Pago
              </span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#f8fafc', fontSize: '0.8rem' }}>
                {formatFecha(asegurado.fechaPago)}
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CreditCard size={12} /> Banco Origen
              </span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#f8fafc', fontSize: '0.8rem' }}>
                {asegurado.banco || 'BANCO PLAZA'}
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mes Asignado</span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#38bdf8', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {asegurado.mes || 'SEPTIEMBRE'}
              </p>
            </div>
          </div>

          {/* Adjunto del Soporte de Pago */}
          {asegurado.imagenReferencia && (
            <div style={{ marginTop: '0.5rem' }}>
              <a
                href={asegurado.imagenReferencia}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.8rem' }}
              >
                <ExternalLink size={14} /> Ver Soporte / Billetaje Adjunto
              </a>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#020617', borderTop: '1px solid #1e293b', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{ backgroundColor: '#334155', color: '#f8fafc', border: 'none', padding: '0.4rem 1rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};