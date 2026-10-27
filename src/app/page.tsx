'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Asegurado } from '../types';
import { KpiCards } from '../components/KpiCards';
import { PaymentsTable } from '../components/PaymentsTable';
import { RecurrenceMatrix } from '../components/RecurrenceMatrix';
import { TableProperties, LayoutDashboard, User, KeyRound, ArrowRight } from 'lucide-react';

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

  if (!isAuthenticated) {
    return (
      <main
        style={{
          position: 'relative',
          minHeight: '100vh',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflowX: 'hidden',
          color: '#0f172a',
          padding: '1rem',
        }}
      >
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: 'url(/logo5.png)',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            opacity: 0.08,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #cbd5e1',
            borderRadius: '1rem',
            padding: '2.5rem',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo2.png"
              alt="Logo Corporativo"
              style={{ maxHeight: '85px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem', lineHeight: '1.4' }}>
            Consolidado de Pagos Cobranzas - Seguros Horizonte
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#0284c7', marginBottom: '1.5rem', fontWeight: 700 }}>
            Business Intelligence {anioActual}
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    padding: '0.6rem 0.75rem 0.6rem 2.3rem',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    padding: '0.6rem 0.75rem 0.6rem 2.3rem',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            {errorLogin && (
              <div style={{ fontSize: '0.75rem', color: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '0.5rem', borderRadius: '0.375rem', textAlign: 'center' }}>
                Usuario o contraseña incorrectos.
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: '0.5rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
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
              }}
            >
              Ingresar al Sistema <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        overflowX: 'hidden',
        color: '#0f172a',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/logo5.png)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          opacity: 0.05,
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
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '1.25rem 1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
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
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.025em' }}>
                Consolidado de Pagos Cobranzas - Seguros Horizonte
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#0284c7', margin: '0.2rem 0 0 0', fontWeight: 700 }}>
                Business Intelligence {anioActual} • Gestión Operativa
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#dc2626',
              border: '1px solid rgba(220, 38, 38, 0.2)',
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

        <section>
          <KpiCards asegurados={asegurados} activeTab={activeTab} />
        </section>

        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setVistaActual('pagos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: vistaActual === 'pagos' ? '#0284c7' : '#ffffff',
              color: vistaActual === 'pagos' ? '#ffffff' : '#64748b',
              boxShadow: vistaActual === 'pagos' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
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
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: vistaActual === 'matriz' ? '#0284c7' : '#ffffff',
              color: vistaActual === 'matriz' ? '#ffffff' : '#64748b',
              boxShadow: vistaActual === 'matriz' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <LayoutDashboard size={16} /> Matriz de Recurrencia (Banco Plaza - Banesco)
          </button>
        </div>

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