'use client';

import React, { useState, useMemo } from 'react';
import { Asegurado } from '@/types';

interface PaymentsTableProps {
  asegurados: Asegurado[];
  onSelectAsegurado: (asegurado: Asegurado) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ asegurados, onSelectAsegurado }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedBanco, setSelectedBanco] = useState<string>('TODOS');

  const filteredAsegurados = useMemo(() => {
    return asegurados.filter(item => {
      const matchSearch = 
        (item.nombreApellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.cedula || '').includes(searchTerm) ||
        String(item.telefono || '').includes(searchTerm);

      const matchBanco = selectedBanco === 'TODOS' || (item.banco || '').toUpperCase() === selectedBanco.toUpperCase();
      
      const matchStatus = selectedStatus === 'Todos' || 
        (selectedStatus === 'Solventes' && item.estatus === 'Solvente') ||
        (selectedStatus === 'Debe 1 Cuota' && item.estatus?.includes('1 cuota')) ||
        (selectedStatus === 'Debe + de 1 Cuota' && item.estatus?.includes('de 1 cuota'));

      return matchSearch && matchBanco && matchStatus;
    });
  }, [asegurados, searchTerm, selectedBanco, selectedStatus]);

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      
      {/* Pestañas de Meses y Botón Nuevo Registro */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'TODOS', label: 'TODOS', count: asegurados.length },
            { key: 'JULIO', label: 'JULIO', count: asegurados.filter(i => i.mes === 'JULIO').length },
            { key: 'AGOSTO', label: 'AGOSTO', count: asegurados.filter(i => i.mes === 'AGOSTO').length },
            { key: 'SEPTIEMBRE', label: 'SEPTIEMBRE', count: asegurados.filter(i => i.mes === 'SEPTIEMBRE').length },
            { key: 'OCTUBRE', label: 'OCTUBRE', count: asegurados.filter(i => i.mes === 'OCTUBRE').length },
            { key: 'NOVIEMBRE', label: 'NOVIEMBRE', count: 0 },
            { key: 'DICIEMBRE', label: 'DICIEMBRE', count: 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedMonth(tab.key)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.4rem',
                border: selectedMonth === tab.key ? '1px solid #0284c7' : '1px solid #cbd5e1',
                backgroundColor: selectedMonth === tab.key ? '#eff6ff' : '#ffffff',
                color: selectedMonth === tab.key ? '#0369a1' : '#475569',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>{tab.label}</span>
              <span style={{ backgroundColor: selectedMonth === tab.key ? '#dbeafe' : '#f1f5f9', padding: '0.05rem 0.3rem', borderRadius: '999px', fontSize: '0.65rem' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {}}
          style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
        >
          + Nuevo Registro
        </button>
      </div>

      {/* Botones de Filtro de Estatus */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', backgroundColor: '#ffffff', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Filtrar Estatus:</span>
        {['Todos', 'Solventes', 'Debe 1 Cuota', 'Debe + de 1 Cuota'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: selectedStatus === status ? '#0284c7' : '#f1f5f9',
              color: selectedStatus === status ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Barra de Búsqueda y Bancos */}
      <div style={{ backgroundColor: '#ffffff', padding: '0.8rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', marginBottom: '1.2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <input
          type="text"
          placeholder="Buscar por titular, C.I. o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '260px', padding: '0.45rem 0.7rem', borderRadius: '0.3rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
        />
        <select
          value={selectedBanco}
          onChange={(e) => setSelectedBanco(e.target.value)}
          style={{ padding: '0.45rem 0.7rem', borderRadius: '0.3rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#fff', cursor: 'pointer' }}
        >
          <option value="TODOS">Todos los Bancos</option>
          <option value="BANCO PLAZA">Banco Plaza</option>
          <option value="BANESCO">Banesco</option>
        </select>
      </div>

      {/* Tabla Principal */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.4rem', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.6rem 0.8rem' }}>Fecha Últ. Pago</th>
              <th style={{ padding: '0.6rem 0.8rem', width: '26%' }}>Nombre y Apellido</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Cédula</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Teléfono</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Cuota ($)</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Banco</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Jul</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Ago</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Sep</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Oct</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Nov</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Dic</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Estatus</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAsegurados.length === 0 ? (
              <tr>
                <td colSpan={14} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No se encontraron registros coincidentes.
                </td>
              </tr>
            ) : (
              filteredAsegurados.map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '0.55rem 0.8rem', color: '#475569' }}>{item.fechaPago || '-'}</td>
                  <td style={{ padding: '0.55rem 0.8rem', fontWeight: 600, color: '#0f172a' }}>{item.nombreApellido}</td>
                  <td style={{ padding: '0.55rem 0.8rem', color: '#334155' }}>{item.cedula}</td>
                  <td style={{ padding: '0.55rem 0.8rem', color: '#334155' }}>{item.telefono || '-'}</td>
                  <td style={{ padding: '0.55rem 0.8rem', color: '#0284c7', fontWeight: 600 }}>${item.uds?.toFixed(2) || '5.99'}</td>
                  <td style={{ padding: '0.55rem 0.8rem' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '0.2rem', border: '1px solid #cbd5e1', color: '#475569', backgroundColor: '#fff' }}>
                      {item.banco || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>{item.mes === 'JULIO' ? '1' : '0'}</td>
                  <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>{item.mes === 'AGOSTO' ? '1' : '0'}</td>
                  <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>{item.mes === 'SEPTIEMBRE' ? '1' : '0'}</td>
                  <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>{item.mes === 'OCTUBRE' ? '1' : '0'}</td>
                  <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: '#94a3b8' }}>0</td>
                  <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: '#94a3b8' }}>0</td>
                  <td style={{ padding: '0.55rem 0.8rem' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                      {item.estatus || 'Solvente'}
                    </span>
                  </td>
                  <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectAsegurado(item)}
                      style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.7rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
