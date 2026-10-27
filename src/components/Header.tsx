'use client';

import React from 'react';
import { Shield, RefreshCw, Plus, Building2 } from 'lucide-react';

interface HeaderProps {
  onOpenNewPayment: () => void;
  onSyncSheets: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewPayment, onSyncSheets, isSyncing }) => {
  return (
    <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div style={{ backgroundColor: '#2563eb', padding: '0.6rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Consolidado de Pagos
            </h1>
            <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
              BANCO PLAZA - BANESCO
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Building2 size={14} color="#60a5fa" />
            <span>Seguros Horizonte, S.A. • Gestión Operativa y Cobranzas</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onSyncSheets}
          disabled={isSyncing}
          style={{ backgroundColor: '#1e293b', color: '#e2e8f0', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Datos'}</span>
        </button>

        <button
          onClick={onOpenNewPayment}
          style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}
        >
          <Plus size={16} />
          <span>Registrar Pago</span>
        </button>
      </div>
    </header>
  );
};