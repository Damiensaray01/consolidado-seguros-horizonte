'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Asegurado } from '../types';
import { KpiCards } from '../components/KpiCards';
import { PaymentsTable } from '../components/PaymentsTable';
import { RecurrenceMatrix } from '../components/RecurrenceMatrix';

export default function Home() {
  const [asegurados, setAsegurados] = useState<Asegurado[]>([]);
  const [activeTab, setActiveTab] = useState('TODOS');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'consolidado_pagos'), (snapshot) => {
      const datos: Asegurado[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Asegurado, 'id'>),
      }));
      setAsegurados(datos);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        overflowX: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* Capa de fondo con logo5 y opacidad */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/logo5.png)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          opacity: 0.05,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Contenido principal unificado */}
      <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
        <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Consolidado de Cobranzas - Seguros Horizonte
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
            Gestión operativa, seguimiento de emisiones y matriz de recurrencia por cohorte.
          </p>
        </header>

        {/* Tarjetas KPI Ejecutivas */}
        <KpiCards asegurados={asegurados} activeTab={activeTab} />

        {/* Matriz de Recurrencia y Análisis */}
        <RecurrenceMatrix asegurados={asegurados} />

        {/* Tabla Interactiva de Pagos con pestañas de seguimiento */}
        <div style={{ marginTop: '2rem' }}>
          <PaymentsTable
            asegurados={asegurados}
            onSelectAsegurado={(item) => console.log('Seleccionado:', item)}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        </div>
      </div>
    </div>
  );
}