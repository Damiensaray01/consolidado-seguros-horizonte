'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Asegurado } from '@/types';

interface RecurrenceMatrixProps {
  asegurados: Asegurado[];
  externalStatusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  externalMonthFilter?: string;
  onMonthFilterChange?: (month: string) => void;
  onSelectAsegurado: (asegurado: Asegurado) => void;
  onOpenNewRegistro: () => void;
}

export const RecurrenceMatrix: React.FC<RecurrenceMatrixProps> = ({ 
  asegurados, 
  externalStatusFilter = 'Todos', 
  onStatusFilterChange, 
  externalMonthFilter = 'TODOS',
  onMonthFilterChange,
  onSelectAsegurado, 
  onOpenNewRegistro 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(externalMonthFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>(externalStatusFilter);
  const [selectedBanco, setSelectedBanco] = useState<string>('TODOS');

  useEffect(() => {
    setSelectedStatus(externalStatusFilter);
  }, [externalStatusFilter]);

  useEffect(() => {
    setSelectedMonth(externalMonthFilter);
  }, [externalMonthFilter]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if (onStatusFilterChange) onStatusFilterChange(status);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (onMonthFilterChange) onMonthFilterChange(month);
  };

  const consolidatedAsegurados = useMemo(() => {
    const map = new Map<string, any>();

    asegurados.forEach(item => {
      const key = String(item.cedula || item.nombreApellido || Math.random()).trim();
      
      if (!map.has(key)) {
        map.set(key, {
          ...item,
          jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0,
          mesInicial: 'OCTUBRE',
          ultimaFecha: item.fechaPago || ''
        });
      }

      const entry = map.get(key)!;
      const itemAny = item as any;
      const mesTexto = String(item.mes || '').toUpperCase();
      const fecha = String(item.fechaPago || '');
      const cuotasPagadas = Number(itemAny.cuotasPagadas || 1);

      let startIndex = 3; // Octubre por defecto
      if (mesTexto.includes('JULIO') || fecha.includes('/7/')) startIndex = 0;
      else if (mesTexto.includes('AGOSTO') || fecha.includes('/8/')) startIndex = 1;
      else if (mesTexto.includes('SEPTIEMBRE') || fecha.includes('/9/')) startIndex = 2;
      else if (mesTexto.includes('OCTUBRE') || fecha.includes('/10/')) startIndex = 3;
      else if (mesTexto.includes('NOVIEMBRE') || fecha.includes('/11/')) startIndex = 4;
      else if (mesTexto.includes('DICIEMBRE') || fecha.includes('/12/')) startIndex = 5;

      const keysMeses = ['jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      for (let i = 0; i < cuotasPagadas; i++) {
        const target = startIndex + i;
        if (target < keysMeses.length) {
          entry[keysMeses[target]] = 1;
        }
      }

      if (item.fechaPago) entry.ultimaFecha = item.fechaPago;
      if (item.banco) entry.banco = item.banco;
      if (item.uds) entry.uds = item.uds;
    });

    return Array.from(map.values()).map(client => {
      let mesInicial = 'JULIO';
      if (client.jul === 1) mesInicial = 'JULIO';
      else if (client.ago === 1) mesInicial = 'AGOSTO';
      else if (client.sep === 1) mesInicial = 'SEPTIEMBRE';
      else if (client.oct === 1) mesInicial = 'OCTUBRE';
      else if (client.nov === 1) mesInicial = 'NOVIEMBRE';
      else if (client.dic === 1) mesInicial = 'DICIEMBRE';

      return {
        ...client,
        mesInicial,
        estatusCalculado: 'Solvente',
        cuotasDebidas: 0
      };
    });
  }, [asegurados]);

  const filteredAsegurados = useMemo(() => {
    return consolidatedAsegurados.filter(item => {
      const nombre = item.nombreApellido ?? '';
      const cedula = String(item.cedula ?? '');
      const telefono = String(item.telefono ?? '');

      const matchSearch = 
        nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cedula.includes(searchTerm) ||
        telefono.includes(searchTerm);

      const bancoItem = (item.banco ?? '').toUpperCase().trim();
      let matchBanco = true;
      if (selectedBanco !== 'TODOS') {
        matchBanco = bancoItem === selectedBanco.toUpperCase();
      }
      
      let matchStatus = true;
      if (selectedStatus === 'Solventes') {
        matchStatus = item.estatusCalculado === 'Solvente';
      } else if (selectedStatus === 'Debe 1 Cuota') {
        matchStatus = item.estatusCalculado === 'Debe 1 Cuota';
      } else if (selectedStatus.includes('Debe')) {
        matchStatus = item.cuotasDebidas >= 1;
      }

      let matchMonth = true;
      if (selectedMonth !== 'TODOS') {
        matchMonth = item.mesInicial === selectedMonth;
      }

      return matchSearch && matchBanco && matchStatus && matchMonth;
    });
  }, [consolidatedAsegurados, searchTerm, selectedBanco, selectedStatus, selectedMonth]);

  const exportToExcel = () => {
    const headers = ['Fecha Ult. Pago', 'Nombre y Apellido', 'Cedula', 'Telefono', 'Cuota ($)', 'Banco', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Estatus'];
    const rows = filteredAsegurados.map(i => [
      i.fechaPago || '',
      `"${i.nombreApellido || ''}"`,
      i.cedula || '',
      i.telefono || '',
      Number(i.uds || 599) > 50 ? Number(i.uds)/100 : Number(i.uds || 5.99),
      `"${i.banco || ''}"`,
      i.jul, i.ago, i.sep, i.oct, i.nov, i.dic,
      `"${i.estatusCalculado}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Consolidado_Seguros_Horizonte.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'TODOS', label: 'TODOS', count: consolidatedAsegurados.length },
            { key: 'JULIO', label: 'JULIO', count: consolidatedAsegurados.filter(i => i.mesInicial === 'JULIO').length },
            { key: 'AGOSTO', label: 'AGOSTO', count: consolidatedAsegurados.filter(i => i.mesInicial === 'AGOSTO').length },
            { key: 'SEPTIEMBRE', label: 'SEPTIEMBRE', count: consolidatedAsegurados.filter(i => i.mesInicial === 'SEPTIEMBRE').length },
            { key: 'OCTUBRE', label: 'OCTUBRE', count: consolidatedAsegurados.filter(i => i.mesInicial === 'OCTUBRE').length },
            { key: 'NOVIEMBRE', label: 'NOVIEMBRE', count: consolidatedAsegurados.filter(i => i.mesInicial === 'NOVIEMBRE').length },
            { key: 'DICIEMBRE', label: 'DICIEMBRE', count: consolidatedAsegurados.filter(i => i.mesInicial === 'DICIEMBRE').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleMonthChange(tab.key)}
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

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={exportToExcel}
            style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            📊 Descargar Excel
          </button>
          <button
            onClick={onOpenNewRegistro}
            style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            + Nuevo Registro
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', backgroundColor: '#ffffff', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Filtrar Estatus:</span>
        {['Todos', 'Solventes', 'Debe 1 Cuota', 'Debe + de 1 Cuota'].map(status => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
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
          style={{ padding: '0.45rem 0.7rem', borderRadius: '0.3rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#fff', cursor: 'pointer', minWidth: '160px' }}
        >
          <option value="TODOS">Todos los Bancos</option>
          <option value="BANCO PLAZA">Banco Plaza</option>
          <option value="BANESCO">Banesco</option>
          <option value="BANFANB">BANFANB</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.4rem', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.6rem 0.8rem' }}>Fecha Últ. Pago</th>
              <th style={{ padding: '0.6rem 0.8rem', width: '24%' }}>Nombre y Apellido</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Cédula</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Teléfono</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Cuota ($)</th>
              <th style={{ padding: '0.6rem 0.8rem', minWidth: '120px' }}>Banco</th>
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
                    <td style={{ padding: '0.55rem 0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>{item.fechaPago || '-'}</td>
                    <td style={{ padding: '0.55rem 0.8rem', fontWeight: 600, color: '#0f172a' }}>{item.nombreApellido || '-'}</td>
                    <td style={{ padding: '0.55rem 0.8rem', color: '#334155', whiteSpace: 'nowrap' }}>{item.cedula || '-'}</td>
                    <td style={{ padding: '0.55rem 0.8rem', color: '#334155' }}>{item.telefono || '-'}</td>
                    <td style={{ padding: '0.55rem 0.8rem', color: '#0284c7', fontWeight: 600, whiteSpace: 'nowrap' }}>${formattedUds}</td>
                    <td style={{ padding: '0.55rem 0.8rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '0.2rem', border: '1px solid #cbd5e1', color: '#475569', backgroundColor: '#fff', display: 'inline-block' }}>
                        {item.banco || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: Number(item.jul) > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.jul}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: Number(item.ago) > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.ago}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: Number(item.sep) > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.sep}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: Number(item.oct) > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.oct}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: Number(item.nov) > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.nov}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: Number(item.dic) > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.dic}</td>
                    <td style={{ padding: '0.55rem 0.8rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 600,
                        backgroundColor: '#dcfce7', color: '#166534', display: 'inline-block'
                      }}>
                        Solvente
                      </span>
                    </td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
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