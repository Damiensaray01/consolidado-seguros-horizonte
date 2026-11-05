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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc');

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
    const mesesNombres = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    // Consolidación estricta y única por Cédula de Identidad
    asegurados.forEach(item => {
      const cedulaRaw = String(item.cedula || item.nombreApellido || '').trim();
      if (!cedulaRaw) return;

      if (!map.has(cedulaRaw)) {
        map.set(cedulaRaw, {
          ...item,
          jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0,
          mesInicial: 'JULIO',
          fechaPago: item.fechaPago || '-'
        });
      }

      const entry = map.get(cedulaRaw)!;
      const fecha = String(item.fechaPago || '');
      const itemAny = item as any;
      const mesTexto = String(item.mes || '').toUpperCase();
      const cuotasPagadas = Number(itemAny.cuotasPagadas || 1);

      let startIndex = -1;
      if (fecha.includes('/7/')) startIndex = 6;
      else if (fecha.includes('/8/')) startIndex = 7;
      else if (fecha.includes('/9/')) startIndex = 8;
      else if (fecha.includes('/10/')) startIndex = 9;
      else if (fecha.includes('/11/')) startIndex = 10;
      else if (fecha.includes('/12/')) startIndex = 11;
      else {
        startIndex = mesesNombres.findIndex(m => mesTexto.includes(m));
      }

      if (startIndex === -1) startIndex = 9; // Octubre por defecto

      const matrixKeys = ['jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

      for (let i = 0; i < cuotasPagadas; i++) {
        const targetIndex = startIndex + i;
        if (targetIndex >= 6 && targetIndex < 12) {
          const matrixKey = matrixKeys[targetIndex - 6];
          entry[matrixKey] = 1; // Marcar el mes pagado en la matriz unificada
        }
      }

      // Mantener la fecha de pago más antigua como la fecha de inicio/emisión oficial
      const parseDate = (d: string) => {
        if (!d || d === '-') return 0;
        const p = d.split('/');
        return p.length === 3 ? new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0])).getTime() : 0;
      };

      const currentFechaTime = parseDate(entry.fechaPago);
      const itemFechaTime = parseDate(item.fechaPago);

      if (itemFechaTime > 0 && (currentFechaTime === 0 || itemFechaTime < currentFechaTime)) {
        entry.fechaPago = item.fechaPago;
      }

      if (item.banco) entry.banco = item.banco;
      if (item.uds) entry.uds = item.uds;
    });

    return Array.from(map.values()).map(client => {
      const mesesColsList = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
      const valArr = [client.jul, client.ago, client.sep, client.oct, client.nov, client.dic];
      
      let mesInicialIndex = valArr.findIndex(v => v === 1);
      if (mesInicialIndex === -1) mesInicialIndex = 3;

      let mesInicial = mesesColsList[mesInicialIndex];

      let ultimoMesPagadoIndex = -1;
      for (let i = valArr.length - 1; i >= 0; i--) {
        if (valArr[i] === 1) {
          ultimoMesPagadoIndex = i;
          break;
        }
      }

      const currentIndex = 4; // Noviembre (índice 4)
      let cuotasDebidas = 0;

      if (ultimoMesPagadoIndex !== -1 && ultimoMesPagadoIndex < currentIndex) {
        const fechaStr = String(client.fechaPago || '');
        if (fechaStr.startsWith('30/') || fechaStr.startsWith('31/')) {
          cuotasDebidas = Math.max(0, currentIndex - (ultimoMesPagadoIndex + 1));
        } else {
          cuotasDebidas = currentIndex - ultimoMesPagadoIndex;
        }
      } else if (ultimoMesPagadoIndex === -1) {
        cuotasDebidas = 1;
      }

      let estatusCalculado = 'Solvente';
      if (cuotasDebidas === 1) estatusCalculado = 'Debe 1 Cuota';
      else if (cuotasDebidas > 1) estatusCalculado = `Debe ${cuotasDebidas} Cuotas`;

      return {
        ...client,
        mesInicial,
        estatusCalculado,
        cuotasDebidas
      };
    });
  }, [asegurados]);

  const filteredAsegurados = useMemo(() => {
    let result = consolidatedAsegurados.filter(item => {
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

    if (sortOrder) {
      result.sort((a, b) => {
        const parseDate = (dateStr: string) => {
          if (!dateStr || dateStr === '-') return 0;
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
          }
          return 0;
        };

        const timeA = parseDate(a.fechaPago);
        const timeB = parseDate(b.fechaPago);

        if (sortOrder === 'asc') {
          return timeA - timeB;
        } else {
          return timeB - timeA;
        }
      });
    }

    return result;
  }, [consolidatedAsegurados, searchTerm, selectedBanco, selectedStatus, selectedMonth, sortOrder]);

  const toggleSortOrder = () => {
    if (sortOrder === 'asc') setSortOrder('desc');
    else if (sortOrder === 'desc') setSortOrder('asc');
    else setSortOrder('asc');
  };

  const exportToExcel = () => {
    const headers = ['Fecha Inicial / Pago', 'Nombre y Apellido', 'Cedula', 'Telefono', 'Cuota ($)', 'Banco', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Estatus'];
    const rows = filteredAsegurados.map(i => [
      i.fechaPago || '-',
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
              <th 
                onClick={toggleSortOrder}
                style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', userSelect: 'none' }}
                title="Hacer clic para ordenar por fecha"
              >
                Fecha Inicial / Pago {sortOrder === 'asc' ? '▲' : sortOrder === 'desc' ? '▼' : '↕'}
              </th>
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

                const isSolvente = item.estatusCalculado === 'Solvente';
                const isDebeUna = item.estatusCalculado === 'Debe 1 Cuota';

                return (
                  <tr key={item.cedula || index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '0.55rem 0.8rem', color: item.fechaPago !== '-' ? '#0f172a' : '#dc2626', fontWeight: item.fechaPago !== '-' ? 600 : 700, whiteSpace: 'nowrap' }}>
                      {item.fechaPago || 'S/F'}
                    </td>
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
                        backgroundColor: isSolvente ? '#dcfce7' : isDebeUna ? '#fef9c3' : '#fee2e2',
                        color: isSolvente ? '#166534' : isDebeUna ? '#854d0e' : '#991b1b',
                        display: 'inline-block'
                      }}>
                        {item.estatusCalculado}
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