'use client';

import React, { useState } from 'react';
import { collection, addClient } from 'firebase/firestore'; // O tu funcion de firebase
import { db } from '@/lib/firebase';
import { addDoc } from 'firebase/firestore';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({ isOpen, onClose }) => {
  const [nombreApellido, setNombreApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [uds, setUds] = useState('5.99');
  const [banco, setBanco] = useState('BANCO PLAZA');
  const [mes, setMes] = useState('OCTUBRE');
  const [fechaPago, setFechaPago] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'consolidado_pagos'), {
        nombreApellido: nombreApellido.toUpperCase(),
        cedula,
        telefono: telefono || '-',
        uds: parseFloat(uds) * 100, // Guardado estandarizado en centavos/formato anterior si aplica
        banco,
        mes: mes.toUpperCase(),
        fechaPago: fechaPago || new Date().toLocaleDateString()
      });
      setLoading(false);
      onClose();
      // Limpiar campos
      setNombreApellido('');
      setCedula('');
      setTelefono('');
      setFechaPago('');
    } catch (error) {
      console.error("Error al registrar pago:", error);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, fontFamily: 'sans-serif', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.75rem',
        width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            Nuevo Registro de Pago
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Nombre y Apellido</label>
            <input 
              type="text" 
              required 
              placeholder="Ej. MARIA PEREZ"
              value={nombreApellido} 
              onChange={e => setNombreApellido(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Cédula</label>
              <input 
                type="text" 
                required 
                placeholder="Ej. 12345678"
                value={cedula} 
                onChange={e => setCedula(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Teléfono</label>
              <input 
                type="text" 
                placeholder="Ej. 0414-1234567"
                value={telefono} 
                onChange={e => setTelefono(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Cuota ($)</label>
              <input 
                type="number" 
                step="0.01"
                required 
                value={uds} 
                onChange={e => setUds(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Banco</label>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Mes Inicial / Registro</label>
              <select 
                value={mes} 
                onChange={e => setMes(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' }}
              >
                <option value="JULIO">Julio</option>
                <option value="AGOSTO">Agosto</option>
                <option value="SEPTIEMBRE">Septiembre</option>
                <option value="OCTUBRE">Octubre</option>
                <option value="NOVIEMBRE">Noviembre</option>
                <option value="DICIEMBRE">Diciembre</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Fecha de Pago</label>
              <input 
                type="text" 
                placeholder="Ej. 31/10/2026"
                value={fechaPago} 
                onChange={e => setFechaPago(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
              {loading ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};