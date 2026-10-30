'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Asegurado } from '@/types';
import { Header } from '@/components/Header';
import { KpiCards } from '@/components/KpiCards';
import { RecurrenceMatrix } from '@/components/RecurrenceMatrix';
import { SeguimientoCobranzas } from '@/components/SeguimientoCobranzas';
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
  
  const [globalStatus, setGlobalStatus] = useState<string>('Todos');
  const [globalMonth, setGlobalMonth] = useState<string>('TODOS');
  const [activeTab, setActiveTab] = useState<'consolidado' | 'seguimiento'>('consolidado');

  const currentYear = new Date().getFullYear();

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

  const consolidatedAsegurados = useMemo(() => {
    const map = new Map<string, any>();
    asegurados.forEach(item => {
      const key = String(item.cedula || item.nombreApellido || Math.random()).trim();
      if (!map.has(key)) {
        map.set(key, { ...item, jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0 });
      }
      const entry = map.get(key)!;
      const itemAny = item as any;

      const julVal = Number(itemAny.cuotaJulio || (item.mes?.toUpperCase().includes('JULIO') ? 1 : 0) || (item.jul || 0));
      const agoVal = Number(itemAny.cuotaAgosto || (item.mes?.toUpperCase().includes('AGOSTO') ? 1 : 0) || (item.ago || 0));
      const sepVal = Number(itemAny.cuotaSeptiembre || (item.mes?.toUpperCase().includes('SEPTIEMBRE') ? 1 : 0) || (item.sep || 0));
      const octVal = Number(itemAny.cuotaOctubre || (item.mes?.toUpperCase().includes('OCTUBRE') ? 1 : 0) || (item.oct || 0));

      if (julVal > 0) entry.jul = 1;
      if (agoVal > 0) entry.ago = 1;
      if (sepVal > 0) entry.sep = 1;
      if (octVal > 0) entry.oct = 1;

      const fecha = String(item.fechaPago || '');
      if (fecha.includes('/7/2026') || fecha.startsWith('7/')) entry.jul = 1;
      if (fecha.includes('/8/2026') || fecha.startsWith('8/')) entry.ago = 1;
      if (fecha.includes('/9/2026') || fecha.startsWith('9/')) entry.sep = 1;
      if (fecha.includes('/10/2026') || fecha.startsWith('10/')) entry.oct = 1;
    });

    return Array.from(map.values()).map(client => {
      let mesInicial = 'JULIO';
      if (client.jul === 1) mesInicial = 'JULIO';
      else if (client.ago === 1) mesInicial = 'AGOSTO';
      else if (client.sep === 1) mesInicial = 'SEPTIEMBRE';
      else if (client.oct === 1) mesInicial = 'OCTUBRE';

      const mesesEvaluar = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE'];
      const startIndex = mesesEvaluar.indexOf(mesInicial);
      let cuotasDebidas = 0;

      if (startIndex !== -1) {
        const valores = [client.jul, client.ago, client.sep, client.oct];
        for (let i = startIndex; i < valores.length; i++) {
          if (valores[i] === 0) cuotasDebidas++;
        }
      }

      let estatusCalculado = 'Solvente';
      if (cuotasDebidas === 1) estatusCalculado = 'Debe 1 Cuota';
      else if (cuotasDebidas > 1) estatusCalculado = `Debe ${cuotasDebidas} Cuotas`;

      return { ...client, mesInicial, estatusCalculado, cuotasDebidas };
    });
  }, [asegurados]);

  if (!isAuthenticated) {
    return (
      <div style={{ 
        width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: 'sans-serif', margin: 0, padding: 0, overflow: 'hidden', boxSizing: 'border-box'
      }}>
        <div style={{ backgroundColor: '#ffffff', padding: '2.5rem 2rem', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', width: '380px', textAlign: 'center', boxSizing: 'border-box', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Seguros_Horizonte_logo.png" alt="Seguros Horizonte" style={{ height: '40px', objectFit: 'contain' }} />
          </div>
          <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', lineHeight: '1.3' }}>
            Consolidado de Pagos Cobranzas - Seguros Horizonte
          </h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gestión Operativa
          </p>
          <form onSubmit={(e) => { e.preventDefault(); if (username === 'ADMBiartet' && password === 'ADM2026') { setIsAuthenticated(true); setLoginError(false); } else { setLoginError(true); } }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ width: '100%' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Usuario</label>
              <input type="text" required placeholder="Ingrese su usuario" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
            </div>
            <div style={{ width: '100%' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Contraseña</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
            </div>
            {loginError && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', padding: '0.45rem', borderRadius: '0.3rem', textAlign: 'center', width: '100%' }}>
                <p style={{ color: '#991b1b', fontSize: '0.75rem', margin: 0, fontWeight: 600 }}>Credenciales incorrectas.</p>
              </div>
            )}
            <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.7rem', borderRadius: '0.4rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.4rem', width: '100%', boxSizing: 'border-box', boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)' }}>
              Iniciar Sesión
            </button>
          </form>
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', width: '100%' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Business Intelligence {currentYear}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header onLogout={() => setIsAuthenticated(false)} />
      
      <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Selector de Pestañas Superiores */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('consolidado')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '0.4rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: activeTab === 'consolidado' ? '1px solid #0284c7' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'consolidado' ? '#0284c7' : '#ffffff',
              color: activeTab === 'consolidado' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'consolidado' ? '0 2px 4px rgba(2,132,199,0.2)' : 'none'
            }}
          >
            📋 Consolidado de Pagos
          </button>
          
          <button
            onClick={() => setActiveTab('seguimiento')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '0.4rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: activeTab === 'seguimiento' ? '1px solid #0284c7' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'seguimiento' ? '#0284c7' : '#ffffff',
              color: activeTab === 'seguimiento' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'seguimiento' ? '0 2px 4px rgba(2,132,199,0.2)' : 'none'
            }}
          >
            📈 Seguimiento de Gestión Mensual
          </button>
        </div>

        {activeTab === 'consolidado' ? (
          <>
            <KpiCards 
              asegurados={consolidatedAsegurados} 
              selectedStatus={globalStatus}
              onSelectStatus={(st) => setGlobalStatus(st)}
              selectedMonth={globalMonth}
            />
            <RecurrenceMatrix 
              asegurados={asegurados} 
              externalStatusFilter={globalStatus}
              onStatusFilterChange={(st) => setGlobalStatus(st)}
              externalMonthFilter={globalMonth}
              onMonthFilterChange={(m) => setGlobalMonth(m)}
              onSelectAsegurado={(item) => setSelectedAsegurado(item)} 
              onOpenNewRegistro={() => setIsNewModalOpen(true)}
            />
          </>
        ) : (
          <SeguimientoCobranzas asegurados={asegurados} />
        )}

      </div>

      <ReceiptModal asegurado={selectedAsegurado} onClose={() => setSelectedAsegurado(null)} />
      <NewPaymentModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
    </main>
  );
}