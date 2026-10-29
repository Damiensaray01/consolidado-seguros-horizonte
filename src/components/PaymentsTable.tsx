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

  // Filtrado de asegurados
  const filteredAsegurados = useMemo(() => {
    return asegurados.filter(item => {
      const matchSearch = 
        (item.nombreApellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.cedula || '').includes(searchTerm) ||
        String(item.NUMERO || '').includes(searchTerm);

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
      {/* Barra de Búsqueda y Filtros */}
      <div style={{ backgroundColor: '#ffffff', padding: '1.2rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Buscar por titular, C.I. o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={selectedBanco}
            onChange={(e) => setSelectedBanco(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="TODOS">Todos los Bancos</option>
            <option value="BANCO PLAZA">Banco Plaza</option>
            <option value="BANESCO">Banesco</option>
          </select>
        </div>
      </div>

      {/* Tabla Principal */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Fecha Últ. Pago</th>
              <th style={{ padding: '0.85rem 1rem', width: '25%' }}>Nombre y Apellido</th>
              <th style={{ padding: '0.85rem 1rem' }}>Cédula</th>
              <th style={{ padding: '0.85rem 1rem' }}>Número</th>
              <th style={{ padding: '0.85rem 1rem' }}>Cuota ($)</th>
              <th style={{ padding: '0.85rem 1rem' }}>Banco</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Jul</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Ago</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Sep</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Oct</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Nov</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Dic</th>
              <th style={{ padding: '0.85rem 1rem' }}>Estatus</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Acciones</th>
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
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{item.fechaPago || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{item.nombreApellido}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{item.cedula}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{item.NUMERO || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#0284c7', fontWeight: 600 }}>${item.uds?.toFixed(2) || '5.99'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', color: '#475569', backgroundColor: '#fff' }}>
                      {item.banco || 'BANCO PLAZA'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>1</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>1</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>1</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>1</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94a3b8' }}>0</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94a3b8' }}>0</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '1rem', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                      Solvente
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectAsegurado(item)}
                      style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
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
