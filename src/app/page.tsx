'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Asegurado } from '../types';
import { KpiCards } from '../components/KpiCards';
import { PaymentsTable } from '../components/PaymentsTable';
import { RecurrenceMatrix } from '../components/RecurrenceMatrix';
import { TableProperties, LayoutDashboard, Lock, User, KeyRound, ArrowRight } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState(false);

  const [asegurados, setAsegurados] = useState<Asegurado[]>([]);
  const [activeTab, setActiveTab] = useState('TODOS');
  const [vistaActual, setVistaActual] = useState<'pagos' | 'matriz'>('pagos');

  const anioActual = new Date().getFullYear();

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onSnapshot(collection(db, 'consolidado_pagos'), (snapshot) => {
      const datos: Asegurado[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Asegurado, 'id'>),
      }));
      setAsegurados(datos);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === 'ADMBiartet' && password === 'ADM2026') {
      setIsAuthenticated(true);
      setErrorLogin(false);
    } else {
      setErrorLogin(true);
    }
  };

  // Pantalla de Login Corporativa
  if (!isAuthenticated) {
    return (
      <main
        style={{
          position: 'relative',
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflowX: 'hidden',
          color: '#f8fafc',
          padding: '1rem',
        }}
      >
        {/* Fondo con logo5.png semi-transparente */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: 'url(/logo5.png)',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            opacity: 0.15,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'rgba(30, 41, 59, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '1rem',
            padding: '2.5rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
          }}
        >
          {/* Logo Corporativo 2 */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo2.png"
              alt="Logo Corporativo"
              style={{ maxHeight: '60px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.3rem', lineHeight: '1.4' }}>
            Consolidado de Pagos Cobranzas - Seguros Horizonte
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '1.5rem', fontWeight: 600 }}>
            Business Intelligence {anioActual}
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    padding: '0.6rem 0.75rem 0.6rem 2.3rem',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    padding: '0.6rem 0.75rem 0.6rem 2.3rem',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            {errorLogin && (
              <div style={{ fontSize: '0.75rem', color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '0.5rem', borderRadius: '0.375rem', textAlign: 'center' }}>
                Usuario o contraseña incorrectos.
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: '0.5rem',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.65rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s',
              }}
            >
              Ingresar al Sistema <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Panel Principal tras autenticarse con diseño claro, semi-transparente y estructurado
  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        overflowX: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* Fondo con logo5.png abarcando toda la pantalla */}
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
        {/* Encabezado con semitransparencia y logo1 */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(30, 41, 59, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            padding: '1.25rem 1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/logo1.png"
              alt="Logo Seguros Horizonte"
              style={{ height: '40px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.025em' }}>
                Consolidado de Pagos Cobranzas - Seguros Horizonte
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#38bdf8', margin: '0.2rem 0 0 0', fontWeight: 600 }}>
                Business Intelligence {anioActual} • Gestión Operativa
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Tarjetas KPI Ejecutivas */}
        <section>
          <KpiCards asegurados={asegurados} activeTab={activeTab} />
        </section>

        {/* Pestañas de Navegación de Vistas */}
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
              backgroundColor: vistaActual === 'pagos' ? '#38bdf8' : 'rgba(30, 41, 59, 0.75)',
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
              backgroundColor: vistaActual === 'matriz' ? '#38bdf8' : 'rgba(30, 41, 59, 0.75)',
              color: vistaActual === 'matriz' ? '#0f172a' : '#cbd5e1',
              transition: 'background-color 0.2s',
            }}
          >
            <LayoutDashboard size={16} /> Matriz de Recurrencia (Banco Plaza - Banesco)
          </button>
        </div>

        {/* Contenido condicional según la vista seleccionada */}
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