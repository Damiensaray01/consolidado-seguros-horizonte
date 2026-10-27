'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Asegurado } from '../types';
import { KpiCards } from '../components/KpiCards';
import { PaymentsTable } from '../components/PaymentsTable';
import { RecurrenceMatrix } from '../components/RecurrenceMatrix';
import { TableProperties, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const [asegurados, setAsegurados] = useState<Asegurado[]>([]);
  const [activeTab, setActiveTab] = useState('TODOS');
  const [vistaActual, setVistaActual] = useState<'pagos' | 'matriz'>('pagos');

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
        backgroundColor: '#0f172a', // Fondo gris oscuro corporativo
        overflowX: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* Capa de fondo con logo5.png abarcando toda la pantalla */}
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
        {/* Encabezado con logo1 y estilo limpio */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
            paddingBottom: '1rem',
            backgroundColor: '#1e293b',
            padding: '1.25rem 1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/logo3.png"
              alt="Logo Seguros Horizonte"
              style={{ height: '40px', objectFit: 'contain' }}
              onError={(e) => {
                // Oculta la imagen si no existe localmente para evitar errores visuales
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.025em' }}>
                Consolidado de Cobranzas - Seguros Horizonte
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Gestión operativa, seguimiento de emisiones y matriz de recurrencia por cohorte.
              </p>
            </div>
          </div>
        </header>

        {/* Tarjetas KPI Ejecutivas */}
        <section>
          <KpiCards asegurados={asegurados} activeTab={activeTab} />
        </section>

        {/* Botones de Pestañas Superiores para alternar las vistas */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setVistaActual('pagos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: vistaActual === 'pagos' ? '#38bdf8' : '#1e293b',
              color: vistaActual === 'pagos' ? '#0f172a' : '#cbd5e1',
              transition: 'background-color 0.2s',
            }}
          >
            <TableProperties size={16} /> Detalle y Seguimiento de Pagos
          </button>

          <button
            onClick={() => setVistaActual('matriz')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: vistaActual === 'matriz' ? '#38bdf8' : '#1e293b',
              color: vistaActual === 'matriz' ? '#0f172a' : '#cbd5e1',
              transition: 'background-color 0.2s',
            }}
          >
            <LayoutDashboard size={16} /> Matriz de Recurrencia (Banco Plaza - Banesco)
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