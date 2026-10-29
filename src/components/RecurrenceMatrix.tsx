'use client';

import React, { useState, useMemo } from 'react';
import { Asegurado } from '@/types';

interface RecurrenceMatrixProps {
  asegurados: Asegurado[];
  onSelectAsegurado: (asegurado: Asegurado) => void;
}

export const RecurrenceMatrix: React.FC<RecurrenceMatrixProps> = ({ asegurados, onSelectAsegurado }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedBanco, setSelectedBanco] = useState<string>('TODOS');

  // Consolidar asegurados únicos por cédula y extraer correctamente los meses de pago
  const consolidatedAsegurados = useMemo(() => {
    const map = new Map<string, Asegurado & { jul: number; ago: number; sep: number; oct: number; nov: number; dic: number }>();

    asegurados.forEach(item => {
      const key = String(item.cedula || item.nombreApellido || Math.random()).trim();
      
      if (!map.has(key)) {
        map.set(key, {
          ...item,
          jul: Number(item.jul) || 0,
          ago: Number(item.ago) || 0,
          sep: Number(item.sep) || 0,
          oct: Number(item.oct) || 0,
          nov: Number(item.nov) || 0,
          dic: Number(item.dic) || 0,
        });
      }

      const entry = map.get(key)!;

      // Analizar fecha de pago o campo mes para marcar el seguimiento mensual (1)
      const fecha = String(item.fechaPago || '').trim();
      const mesStr = String(item.mes || '').toUpperCase().trim();

      // Función auxiliar para detectar el mes en formato DD/MM/YYYY o YYYY-MM-DD
      const detectMonthFromDate = (f: string) => {
        if (!f) return null;
        if (f.includes('/7/') || f.startsWith('7/') || f.includes('-07-')) return 'JULIO';
        if (f.includes('/8/') || f.startsWith('8/') || f.includes('-08-')) return 'AGOSTO';
        if (f.includes('/9/') || f.startsWith('9/') || f.includes('-09-')) return 'SEPTIEMBRE';
        if (f.includes('/10/') || f.startsWith('10/') || f.includes('-10-')) return 'OCTUBRE';
        if (f.includes('/11/') || f.startsWith('11/') || f.includes('-11-')) return 'NOVIEMBRE';
        if (f.includes('/12/') || f.startsWith('12/') || f.includes('-12-')) return 'DICIEMBRE';
        return null;
      };

      const mesDetectado = detectMonthFromDate(fecha) || mesStr;

      if (mesDetectado.includes('JULIO')) entry.jul = 1;
      if (mesDetectado.includes('AGOSTO')) entry.ago = 1;
      if (mesDetectado.includes('SEPTIEMBRE')) entry.sep = 1;
      if (mesDetectado.includes('OCTUBRE')) entry.oct = 1;
      if (mesDetectado.includes('NOVIEMBRE')) entry.nov = 1;
      if (mesDetectado.includes('DICIEMBRE')) entry.dic = 1;
    });

    return Array.from(map.values());
  }, [asegurados]);

  // Filtrado de asegurados consolidados
  const filteredAsegurados = useMemo(() => {
    return consolidatedAsegurados.filter(item => {
      const nombre = item.nombreApellido ?? '';
      const cedula = String(item.cedula ?? '');
      const telefono = String(item.telefono ?? '');

      const matchSearch = 
        nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cedula.includes(searchTerm) ||
        telefono.includes(searchTerm);

      const bancoItem = item.banco ?? '';
      const matchBanco = selectedBanco === 'TODOS' || bancoItem.toUpperCase() === selectedBanco.toUpperCase();
      
      const estatusItem = item.estatus ?? '';
      const matchStatus = selectedStatus === 'Todos' || 
        (selectedStatus === 'Solventes' && estatusItem === 'Solvente') ||
        (selectedStatus === 'Debe 1 Cuota' && estatusItem.includes('1 cuota')) ||
        (selectedStatus === 'Debe + de 1 Cuota' && estatusItem.includes('de 1 cuota'));

      // Filtrado por pestaña de mes superior
      let matchMonth = true;
      if (selectedMonth === 'JULIO') matchMonth = item.jul > 0;
      if (selectedMonth === 'AGOSTO') matchMonth = item.ago > 0;
      if (selectedMonth === 'SEPTIEMBRE') matchMonth = item.sep > 0;
      if (selectedMonth === 'OCTUBRE') matchMonth = item.oct > 0;
      if (selectedMonth === 'NOVIEMBRE') matchMonth = item.nov > 0;
      if (selectedMonth === 'DICIEMBRE') matchMonth = item.dic > 0;

      return matchSearch && matchBanco && matchStatus && matchMonth;
    });
  }, [consolidatedAsegurados, searchTerm, selectedBanco, selectedStatus, selectedMonth]);

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      
      {/* Pestañas de Meses y Botón Nuevo Registro */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'TODOS', label: 'TODOS', count: consolidatedAsegurados.length },
            { key: 'JULIO', label: 'JULIO', count: consolidatedAsegurados.filter(i => i.jul > 0).length },
            { key: 'AGOSTO', label: 'AGOSTO', count: consolidatedAsegurados.filter(i => i.ago > 0).length },
            { key: 'SEPTIEMBRE', label: 'SEPTIEMBRE', count: consolidatedAsegurados.filter(i => i.sep > 0).length },
            { key: 'OCTUBRE', label: 'OCTUBRE', count: consolidatedAsegurados.filter(i => i.oct > 0).length },
            { key: 'NOVIEMBRE', label: 'NOVIEMBRE', count: consolidatedAsegurados.filter(i => i.nov > 0).length },
            { key: 'DICIEMBRE', label: 'DICIEMBRE', count: consolidatedAsegurados.filter(i => i.dic > 0).length },
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
              filteredAsegurados.map((item, index) => {
                const rawUds = Number(item.uds) || 599;
                const formattedUds = (rawUds > 50 ? rawUds / 100 : rawUds).toFixed(2).replace('.', ',');

                return (
                  <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '0.55rem 0.8rem', color: '#475569' }}>{item.fechaPago || '-'}</td>
                    <td style={{ padding: '0.55rem 0.8rem', fontWeight: 600, color: '#0f172a' }}>{item.nombreApellido || '-'}</td>
                    <td style={{ padding: '0.55rem 0.8rem', color: '#334155' }}>{item.cedula || '-'}</td>
                    <td style={{ padding: '0.55rem 0.8rem', color: '#334155' }}>{item.telefono || '-'}</td>
                    <td style={{ padding: '0.55rem 0.8rem', color: '#0284c7', fontWeight: 600 }}>${formattedUds}</td>
                    <td style={{ padding: '0.55rem 0.8rem' }}>
                      <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '0.2rem', border: '1px solid #cbd5e1', color: '#475569', backgroundColor: '#fff' }}>
                        {item.banco || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.jul > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.jul}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.ago > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.ago}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.sep > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.sep}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.oct > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.oct}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.nov > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.nov}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.dic > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.dic}</td>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
