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

  // 1. Consolidación de clientes únicos por Cédula con cálculo dinámico de estatus
  const consolidatedAsegurados = useMemo(() => {
    const map = new Map<string, any>();

    asegurados.forEach(item => {
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
        });
      }

      const entry = map.get(key)!;
      const itemAny = item as any;

      // Evaluar cuotas registradas en Firestore
      const julVal = Number(itemAny.cuotaJulio ?? item.jul ?? 0);
      const agoVal = Number(itemAny.cuotaAgosto ?? item.ago ?? 0);
      const sepVal = Number(itemAny.cuotaSeptiembre ?? item.sep ?? 0);
      const octVal = Number(itemAny.cuotaOctubre ?? item.oct ?? 0);
      const novVal = Number(itemAny.cuotaNoviembre ?? item.nov ?? 0);
      const dicVal = Number(itemAny.cuotaDiciembre ?? item.dic ?? 0);

      if (julVal > 0) entry.jul = 1;
      if (agoVal > 0) entry.ago = 1;
      if (sepVal > 0) entry.sep = 1;
      if (octVal > 0) entry.oct = 1;
      if (novVal > 0) entry.nov = 1;
      if (dicVal > 0) entry.dic = 1;

      // Respaldo por texto del mes o fecha
      const mesStr = String(item.mes || '').toUpperCase();
      const fecha = String(item.fechaPago || '');
      if (mesStr.includes('JULIO') || fecha.includes('/7/')) entry.jul = 1;
      if (mesStr.includes('AGOSTO') || fecha.includes('/8/')) entry.ago = 1;
      if (mesStr.includes('SEPTIEMBRE') || fecha.includes('/9/')) entry.sep = 1;
      if (mesStr.includes('OCTUBRE') || fecha.includes('/10/')) entry.oct = 1;
      if (mesStr.includes('NOVIEMBRE') || fecha.includes('/11/')) entry.nov = 1;
      if (mesStr.includes('DICIEMBRE') || fecha.includes('/12/')) entry.dic = 1;

      if (item.fechaPago) entry.fechaPago = item.fechaPago;
      if (item.banco) entry.banco = item.banco;
    });

    // Calcular mes inicial y estatus dinámico para cada cliente
    const list = Array.from(map.values());

    return list.map(client => {
      // Determinar mes inicial (el primer mes que tenga un 1 registrado)
      let mesInicial = 'JULIO';
      if (client.jul === 1) mesInicial = 'JULIO';
      else if (client.ago === 1) mesInicial = 'AGOSTO';
      else if (client.sep === 1) mesInicial = 'SEPTIEMBRE';
      else if (client.oct === 1) mesInicial = 'OCTUBRE';
      else if (client.nov === 1) mesInicial = 'NOVIEMBRE';
      else if (client.dic === 1) mesInicial = 'DICIEMBRE';

      // Calcular deuda real acumulada hasta Octubre (mes actual activo)
      // Evaluamos desde su mes inicial cuántas cuotas le faltan por pagar
      const mesesEvaluar = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE'];
      const startIndex = mesesEvaluar.indexOf(mesInicial);

      let cuotasDebidas = 0;
      if (startIndex !== -1) {
        const valores = [client.jul, client.ago, client.sep, client.oct];
        for (let i = startIndex; i < valores.length; i++) {
          if (valores[i] === 0) {
            cuotasDebidas++;
          }
        }
      }

      let estatusCalculado = 'Solvente';
      if (cuotasDebidas === 1) {
        estatusCalculado = 'Debe 1 Cuota';
      } else if (cuotasDebidas > 1) {
        estatusCalculado = 'Debe + de 1 Cuota';
      }

      return {
        ...client,
        mesInicial,
        estatusCalculado
      };
    });
  }, [asegurados]);

  // 2. Filtrado dinámico interactivo
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
      
      // Filtrar según el estatus calculado
      let matchStatus = true;
      if (selectedStatus === 'Solventes') {
        matchStatus = item.estatusCalculado === 'Solvente';
      } else if (selectedStatus === 'Debe 1 Cuota') {
        matchStatus = item.estatusCalculado === 'Debe 1 Cuota';
      } else if (selectedStatus === 'Debe + de 1 Cuota') {
        matchStatus = item.estatusCalculado === 'Debe + de 1 Cuota';
      }

      // Filtrar por pestaña de mes (por mes inicial o cuota activa)
      let matchMonth = true;
      if (selectedMonth === 'JULIO') matchMonth = item.mesInicial === 'JULIO' || item.jul > 0;
      if (selectedMonth === 'AGOSTO') matchMonth = item.mesInicial === 'AGOSTO' || item.ago > 0;
      if (selectedMonth === 'SEPTIEMBRE') matchMonth = item.mesInicial === 'SEPTIEMBRE' || item.sep > 0;
      if (selectedMonth === 'OCTUBRE') matchMonth = item.mesInicial === 'OCTUBRE' || item.oct > 0;
      if (selectedMonth === 'NOVIEMBRE') matchMonth = item.mesInicial === 'NOVIEMBRE' || item.nov > 0;
      if (selectedMonth === 'DICIEMBRE') matchMonth = item.mesInicial === 'DICIEMBRE' || item.dic > 0;

      return matchSearch && matchBanco && matchStatus && matchMonth;
    });
  }, [consolidatedAsegurados, searchTerm, selectedBanco, selectedStatus, selectedMonth]);

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      
      {/* Pestañas de Meses */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'TODOS', label: 'TODOS', count: consolidatedAsegurados.length },
            { key: 'JULIO', label: 'JULIO', count: consolidatedAsegurados.filter(i => i.mesInicial === 'JULIO' || i.jul > 0).length },
            { key: 'AGOSTO', label: 'AGOSTO', count: consolidatedAsegurados.filter(i => i.mesInicial === 'AGOSTO' || i.ago > 0).length },
            { key: 'SEPTIEMBRE', label: 'SEPTIEMBRE', count: consolidatedAsegurados.filter(i => i.mesInicial === 'SEPTIEMBRE' || i.sep > 0).length },
            { key: 'OCTUBRE', label: 'OCTUBRE', count: consolidatedAsegurados.filter(i => i.mesInicial === 'OCTUBRE' || i.oct > 0).length },
            { key: 'NOVIEMBRE', label: 'NOVIEMBRE', count: consolidatedAsegurados.filter(i => i.mesInicial === 'NOVIEMBRE' || i.nov > 0).length },
            { key: 'DICIEMBRE', label: 'DICIEMBRE', count: consolidatedAsegurados.filter(i => i.mesInicial === 'DICIEMBRE' || i.dic > 0).length },
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
        {[
          { key: 'Todos', label: 'Todos' },
          { key: 'Solventes', label: 'Solventes' },
          { key: 'Debe 1 Cuota', label: 'Debe 1 Cuota' },
          { key: 'Debe + de 1 Cuota', label: 'Debe + de 1 Cuota' }
        ].map(status => (
          <button
            key={status.key}
            onClick={() => setSelectedStatus(status.key)}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: selectedStatus === status.key ? '#0284c7' : '#f1f5f9',
              color: selectedStatus === status.key ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Buscador y Selección de Banco */}
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

                const isSolvente = item.estatusCalculado === 'Solvente';

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
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        backgroundColor: isSolvente ? '#dcfce7' : '#fef3c7',
                        color: isSolvente ? '#166534' : '#92400e'
                      }}>
                        {item.estatusCalculado}
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