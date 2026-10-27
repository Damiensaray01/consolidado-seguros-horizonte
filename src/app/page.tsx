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
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#030712', // Fondo oscuro profundo sin tonos azules recargados
        overflowX: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* Capa de fondo con logo5.png ajustado para mayor visibilidad (opacidad del 12%) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/logo5.png)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '45%',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Contenedor principal con separación limpia entre bloques */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '2rem 1.5rem',
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Encabezado */}
        <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.025em' }}>
            Consolidado de Cobranzas - Seguros Horizonte
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
            Gestión operativa, seguimiento de emisiones y matriz de recurrencia por cohorte.
          </p>
        </header>

        {/* 1. Tarjetas KPI Ejecutivas */}
        <section>
          <KpiCards asegurados={asegurados} activeTab={activeTab} />
        </section>

        {/* 2. Matriz de Recurrencia y Análisis */}
        <section>
          <RecurrenceMatrix asegurados={asegurados} />
        </section>

        {/* 3. Tabla Interactiva de Pagos y Seguimiento */}
        <section style={{ marginTop: '1rem' }}>
          <PaymentsTable
            asegurados={asegurados}
            onSelectAsegurado={(item) => console.log('Seleccionado:', item)}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        </section>
      </div>
    </main>
  );
}