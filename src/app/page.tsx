'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Asegurado } from '../types';
import { KpiCards } from '../components/KpiCards';
import { PaymentsTable } from '../components/PaymentsTable';
import { RecurrenceMatrix } from '../components/RecurrenceMatrix';
import { LayoutDashboard, TableProperties } from 'lucide-react';

export default function Home() {
  const [asegurados, setAsegurados] = useState<Asegurado[]>([]);
  const [activeTab, setActiveTab] = useState('TODOS');
  // Estado para alternar entre la vista de Matriz de Recurrencia y la Tabla de Seguimiento de Pagos
  const [vistaActual, setVistaActual] = useState<'matriz' | 'pagos'>('pagos');

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
        backgroundColor: '#030712',
        overflowX: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* Capa de fondo con logo5.png abarcando toda la pantalla sin cortes */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/logo5.png)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Contenedor principal */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '2rem 1.5rem',
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
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

        {/* Tarjetas KPI Ejecutivas (Siempre visibles arriba) */}
        <section>
          <KpiCards asegurados={asegurados} activeTab={activeTab} />
        </section>

        {/* Botones de Pestañas Superiores para alternar las vistas */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setVistaActual('pagos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: vistaActual === 'pagos' ? '#2563eb' : '#1e293b',
              color: vistaActual === 'pagos' ? '#ffffff' : '#94a3b8',
              transition: 'background-color 0.2s',
            }}
          >
            <TableProperties size={15} /> Detalle y Seguimiento de Pagos
          </button>

          <button
            onClick={() => setVistaActual('matriz')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: vistaActual === 'matriz' ? '#2563eb' : '#1e293b',
              color: vistaActual === 'matriz' ? '#ffffff' : '#94a3b8',
              transition: 'background-color 0.2s',
            }}
          >
            <LayoutDashboard size={15} /> Matriz de Recurrencia (Banco Plaza - Banesco)
          </button>
        </div>

        {/* Contenido condicional según la pestaña seleccionada */}
        <section>
          {vistaActual === 'matriz' ? (
            <RecurrenceMatrix asegurados={asegurados} />
          ) : (
            <PaymentsTable
              asegurados={asegurados}
              onSelectAsegurado={(item) => console.log('Seleccionado:', item)}
              onTabChange={(tab) => setActiveTab(tab)}
            />
          )}
        </section>
      </div>
    </main>
  );
}