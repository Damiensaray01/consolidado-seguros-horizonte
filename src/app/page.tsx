'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Asegurado } from '@/types';
import { Header } from '@/components/Header';
import { RecurrenceMatrix } from '@/components/RecurrenceMatrix';
import { ReceiptModal } from '@/components/ReceiptModal';
import { NewPaymentModal } from '@/components/NewPaymentModal';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [asegurados, setAsegurados] = useState<Asegurado[]>([]);
  const [selectedAsegurado, setSelectedAsegurado] = useState<Asegurado | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onSnapshot(collection(db, 'consolidado_pagos'), (snapshot) => {
      const data: Asegurado[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAsegurados(data);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ADMBiartet' && password === 'ADM2026') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>Seguros Horizonte</h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>Gestión Operativa • Business Intelligence</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Usuario</label>
              <input 
                type="text" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.3rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginTop: '0.2rem' }} 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.3rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginTop: '0.2rem' }} 
              />
            </div>
            {loginError && <p style={{ color: '#dc2626', fontSize: '0.75rem', margin: 0, textAlign: 'center' }}>Credenciales incorrectas.</p>}
            <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '0.3rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header onLogout={() => setIsAuthenticated(false)} />
      <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        <RecurrenceMatrix 
          asegurados={asegurados} 
          onSelectAsegurado={(item) => setSelectedAsegurado(item)} 
          onOpenNewRegistro={() => setIsNewModalOpen(true)}
        />
      </div>

      <ReceiptModal 
        asegurado={selectedAsegurado} 
        onClose={() => setSelectedAsegurado(null)} 
      />

      <NewPaymentModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
      />
    </main>
  );
}