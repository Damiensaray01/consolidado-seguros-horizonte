'use client';

import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Asegurado } from '@/types';

interface ReceiptModalProps {
  asegurado: Asegurado | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ asegurado, onClose }) => {
  const [nombreApellido, setNombreApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [uds, setUds] = useState('5.99');
  const [banco, setBanco] = useState('BANCO PLAZA');
  const [fechaPago, setFechaPago] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asegurado) {
      setNombreApellido(asegurado.nombreApellido || '');
      setCedula(String(asegurado.cedula || ''));
      setTelefono(asegurado.telefono || '');
      const rawUds = Number(asegurado.uds || 599);
      setUds(String(rawUds > 50 ? rawUds / 100 : rawUds));
      setBanco(asegurado.banco || 'BANCO PLAZA');
      setFechaPago(asegurado.fechaPago || '');
    }
  }, [asegurado]);

  if (!asegurado) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asegurado.id) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'consolidado_pagos', asegurado.id);
      await updateDoc(docRef, {
        nombreApellido: nombreApellido.toUpperCase(),
        cedula,
        telefono,
        uds: parseFloat(uds) * 100,
        banco,
        fechaPago
      });
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error al actualizar registro:", error);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, fontFamily: 'sans-serif', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.75rem',
        width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        boxSizing: 'border-box', border: '1px solid #cbd5e1'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            ✏️ Editar Datos del Asegurado
          </h3>
          <button 
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>Nombre y Apellido</label>
            <input 
              type="text" 
              required 
              value={nombreApellido} 
              onChange={e => setNombreApellido(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>Cédula</label>
              <input 
                type="text" 
                required 
                value={cedula} 
                onChange={e => setCedula(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>Teléfono</label>
              <input 
                type="text" 
                value={telefono} 
                onChange={e => setTelefono(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>Cuota ($)</label>
              <input 
                type="number" 
                step="0.01"
                required 
                value={uds} 
                onChange={e => setUds(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>Banco</label>
              <select 
                value={banco} 
                onChange={e => setBanco(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' }}
              >
                <option value="BANCO PLAZA">Banco Plaza</option>
                <option value="BANESCO">Banesco</option>
                <option value="BANFANB">BANFANB</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>Fecha de Último Pago</label>
            <input 
              type="text" 
              value={fechaPago} 
              onChange={e => setFechaPago(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.55rem 1rem', borderRadius: '0.35rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '0.35rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};