'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Asegurado } from '@/types';
import { Header } from '@/components/Header';
import { KpiCards } from '@/components/KpiCards';
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
  const [globalStatus, setGlobalStatus] = useState<string>('Todos');

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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '2.5rem 2rem', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          
          {/* Logotipo oficial corporativo de Seguros Horizonte */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/45/Seguros_Horizonte_logo.png" 
              alt="Seguros Horizonte Logo" 
              style={{ height: '48px', objectFit: 'contain' }} 
            />
          </div>

          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Seguros Horizonte</h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.75rem', color: '#64748b' }}>Gestión Operativa • Business Intelligence</p>
          
          <form onSubmit={(e) => { e.preventDefault(); if (username === 'ADMBiartet' && password === 'ADM2026') { setIsAuthenticated(true); setLoginError(false); } else { setLoginError(true); } }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Usuario</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginTop: '0.2rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginTop: '0.2rem', outline: 'none' }} />
            </div>
            {loginError && <p style={{ color: '#dc2626', fontSize: '0.75rem', margin: 0, textAlign: 'center' }}>Credenciales incorrectas.</p>}
            <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: '0.35rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem', transition: 'background 0.2s' }}>
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
        <KpiCards 
          asegurados={consolidatedAsegurados} 
          selectedStatus={globalStatus}
          onSelectStatus={(st) => setGlobalStatus(st)}
        />
        <RecurrenceMatrix 
          asegurados={asegurados} 
          externalStatusFilter={globalStatus}
          onStatusFilterChange={(st) => setGlobalStatus(st)}
          onSelectAsegurado={(item) => setSelectedAsegurado(item)} 
          onOpenNewRegistro={() => setIsNewModalOpen(true)}
        />
      </div>

      <ReceiptModal asegurado={selectedAsegurado} onClose={() => setSelectedAsegurado(null)} />
      <NewPaymentModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
    </main>
  );
}