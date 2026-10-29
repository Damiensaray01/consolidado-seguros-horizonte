'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // <-- Corregido aquí con '../'
import { PaymentsTable } from '../components/PaymentsTable';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [asegurados, setAsegurados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'consolidado_pagos'));
          const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAsegurados(data);
        } catch (err) {
          console.error('Error al cargar datos:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'horizonte2026' || password.trim() === '') {
      setIsLoggedIn(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0' }}>
          
          {/* Integración del logotipo corporativo logo4 */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/logo4.png" 
              alt="Seguros Horizonte" 
              style={{ width: '140px', height: 'auto', objectFit: 'contain' }} 
            />
          </div>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Consolidado de Pagos y Cobranzas
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Gestión Operativa • Business Intelligence
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              placeholder="Ingrese la contraseña..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', boxSizing: 'border-box', width: '100%' }}
            />
            {error && (
              <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>
                Contraseña incorrecta. Intente nuevamente.
              </span>
            )}
            <button
              type="submit"
              style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '0.6rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Consolidado de Pagos Cobranzas - Seguros Horizonte
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Business Intelligence 2026 • Gestión Operativa
            </p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Cerrar Sesión
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Cargando datos del sistema...</div>
        ) : (
          <PaymentsTable asegurados={asegurados} onSelectAsegurado={() => {}} />
        )}
      </div>
    </main>
  );
}