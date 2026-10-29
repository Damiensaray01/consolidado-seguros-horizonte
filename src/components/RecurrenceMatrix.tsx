'use client';

import React, { useState, useMemo } from 'react';
import { Asegurado } from '@/types';

interface RecurrenceMatrixProps {
  asegurados: Asegurado[];
  onSelectAsegurado: (asegurado: Asegurado) => void;
  onOpenNewRegistro: () => void;
}

export const RecurrenceMatrix: React.FC<RecurrenceMatrixProps> = ({ asegurados, onSelectAsegurado, onOpenNewRegistro }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedBanco, setSelectedBanco] = useState<string>('TODOS');

  const consolidatedAsegurados = useMemo(() => {
    const map = new Map<string, any>();

    const sortedItems = [...asegurados].sort((a, b) => {
      const fA = new Date(a.fechaPago?.split('/').reverse().join('-') || '').getTime() || 0;
      const fB = new Date(b.fechaPago?.split('/').reverse().join('-') || '').getTime() || 0;
      return fA - fB;
    });

    sortedItems.forEach(item => {
      const key = String(item.cedula || item.nombreApellido || Math.random()).trim();
      
      if (!map.has(key)) {
        map.set(key, {
          ...item,
          jul: 0,
          ago: 0,
          sep: 0,
          oct: 0,
          nov: 0,
          dic: 0,
          mesInicial: null,
          ultimaFecha: item.fechaPago || ''
        });
      }

      const entry = map.get(key)!;
      const itemAny = item as any;

      const julVal = Number(itemAny.cuotaJulio || (item.mes?.toUpperCase().includes('JULIO') ? 1 : 0) || (item.jul || 0));
      const agoVal = Number(itemAny.cuotaAgosto || (item.mes?.toUpperCase().includes('AGOSTO') ? 1 : 0) || (item.ago || 0));
      const sepVal = Number(itemAny.cuotaSeptiembre || (item.mes?.toUpperCase().includes('SEPTIEMBRE') ? 1 : 0) || (item.sep || 0));
      const octVal = Number(itemAny.cuotaOctubre || (item.mes?.toUpperCase().includes('OCTUBRE') ? 1 : 0) || (item.oct || 0));
      const novVal = Number(itemAny.cuotaNoviembre || (item.mes?.toUpperCase().includes('NOVIEMBRE') ? 1 : 0) || (item.nov || 0));
      const dicVal = Number(itemAny.cuotaDiciembre || (item.mes?.toUpperCase().includes('DICIEMBRE') ? 1 : 0) || (item.dic || 0));

      if (julVal > 0) entry.jul = 1;
      if (agoVal > 0) entry.ago = 1;
      if (sepVal > 0) entry.sep = 1;
      if (octVal > 0) entry.oct = 1;
      if (novVal > 0) entry.nov = 1;
      if (dicVal > 0) entry.dic = 1;

      const fecha = String(item.fechaPago || '');
      if (fecha.includes('/7/2026') || fecha.startsWith('7/')) entry.jul = 1;
      if (fecha.includes('/8/2026') || fecha.startsWith('8/')) entry.ago = 1;
      if (fecha.includes('/9/2026') || fecha.startsWith('9/')) entry.sep = 1;
      if (fecha.includes('/10/2026') || fecha.startsWith('10/')) entry.oct = 1;
      if (fecha.includes('/11/2026') || fecha.startsWith('11/')) entry.nov = 1;
      if (fecha.includes('/12/2026') || fecha.startsWith('12/')) entry.dic = 1;

      if (item.fechaPago) {
        entry.fechaPago = item.fechaPago;
        entry.ultimaFecha = item.fechaPago;
      }
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

      const mesesEvaluar = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE'];
      const startIndex = mesesEvaluar.indexOf(mesInicial);
      let cuotasDebidas = 0;

      if (startIndex !== -1) {
        const valores = [client.jul, client.ago, client.sep, client.oct];
        for (let i = startIndex; i < valores.length; i++) {
          if (valores[i] === 0) cuotasDebidas++;
        }
      }

      let estatusCalculado = 'Solvente';
      if (cuotasDebidas === 1) estatusCalculado = 'Debe 1 Cuota';
      else if (cuotasDebidas > 1) estatusCalculado = 'Debe + de 1 Cuota';

      return {
        ...client,
        mesInicial,
        estatusCalculado
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
      if (selectedStatus === 'Solventes') matchStatus = item.estatusCalculado === 'Solvente';
      else if (selectedStatus === 'Debe 1 Cuota') matchStatus = item.estatusCalculado === 'Debe 1 Cuota';
      else if (selectedStatus === 'Debe + de 1 Cuota') matchStatus = item.estatusCalculado === 'Debe + de 1 Cuota';

      let matchMonth = true;
      if (selectedMonth === 'JULIO') matchMonth = item.mesInicial === 'JULIO';
      if (selectedMonth === 'AGOSTO') matchMonth = item.mesInicial === 'AGOSTO';
      if (selectedMonth === 'SEPTIEMBRE') matchMonth = item.mesInicial === 'SEPTIEMBRE';
      if (selectedMonth === 'OCTUBRE') matchMonth = item.mesInicial === 'OCTUBRE';
      if (selectedMonth === 'NOVIEMBRE') matchMonth = item.mesInicial === 'NOVIEMBRE';
      if (selectedMonth === 'DICIEMBRE') matchMonth = item.mesInicial === 'DICIEMBRE';

      return matchSearch && matchBanco && matchStatus && matchMonth;
    });
  }, [consolidatedAsegurados, searchTerm, selectedBanco, selectedStatus, selectedMonth]);

  // Función para exportar a Excel / CSV
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
      
      {/* Pestañas de Meses y Botones de Acción */}
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

      {/* Buscador y Selector de Banco con BANFANB */}
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

      {/* Tabla Principal */}
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
                const isSolvente = item.estatusCalculado === 'Solvente';

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
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.jul > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.jul}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.ago > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.ago}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.sep > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.sep}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.oct > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.oct}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.nov > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.nov}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: item.dic > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{item.dic}</td>
                    <td style={{ padding: '0.55rem 0.8rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        backgroundColor: isSolvente ? '#dcfce7' : '#fef3c7',
                        color: isSolvente ? '#166534' : '#92400e',
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