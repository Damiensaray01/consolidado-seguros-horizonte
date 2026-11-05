'use client';

import React, { useMemo } from 'react';
import { Asegurado } from '@/types';

interface SeguimientoCobranzasProps {
  asegurados: Asegurado[];
}

export const SeguimientoCobranzas: React.FC<SeguimientoCobranzasProps> = ({ asegurados }) => {
  const { dataSeguimiento, kpiGlobal } = useMemo(() => {
    const mesesCols = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const gestionMeses = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE'];
    const indexMap: { [key: string]: number } = { 'JULIO': 0, 'AGOSTO': 1, 'SEPTIEMBRE': 2, 'OCTUBRE': 3, 'NOVIEMBRE': 4, 'DICIEMBRE': 5 };

    const clientMap = new Map<string, any>();

    asegurados.forEach(item => {
      const key = String(item.cedula || item.nombreApellido || Math.random()).trim();
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0,
          mesInicial: 'JULIO',
          uds: Number(item.uds || 599) > 50 ? Number(item.uds) / 100 : Number(item.uds || 5.99)
        });
      }
      const entry = clientMap.get(key)!;
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
    });

    const clients = Array.from(clientMap.values()).map(client => {
      let mesInicial = 'JULIO';
      if (client.jul === 1) mesInicial = 'JULIO';
      else if (client.ago === 1) mesInicial = 'AGOSTO';
      else if (client.sep === 1) mesInicial = 'SEPTIEMBRE';
      else if (client.oct === 1) mesInicial = 'OCTUBRE';
      else if (client.nov === 1) mesInicial = 'NOVIEMBRE';
      else if (client.dic === 1) mesInicial = 'DICIEMBRE';
      return { ...client, mesInicial };
    });

    let totalEmisionGlobal = 0;
    let totalRecurrenciaGlobal = 0;

    const results = gestionMeses.map(mesGestion => {
      const clientesEmision = clients.filter(c => c.mesInicial === mesGestion);
      const cantEmision = clientesEmision.length;
      const montoEmision = clientesEmision.reduce((acc, c) => acc + c.uds, 0);
      totalEmisionGlobal += montoEmision;

      const recurrenciaCounts: { [key: string]: number } = {};
      const recurrenciaMontos: { [key: string]: number } = {};

      const idxGestion = indexMap[mesGestion];

      mesesCols.forEach((mCol, idxCol) => {
        if (idxCol <= idxGestion) {
          recurrenciaCounts[mCol] = 0;
          recurrenciaMontos[mCol] = 0;
          return;
        }

        let count = 0;
        let monto = 0;
        clientesEmision.forEach(c => {
          const val = mCol === 'JULIO' ? c.jul : mCol === 'AGOSTO' ? c.ago : mCol === 'SEPTIEMBRE' ? c.sep : mCol === 'OCTUBRE' ? c.oct : mCol === 'NOVIEMBRE' ? c.nov : c.dic;
          if (val === 1) {
            count++;
            monto += c.uds;
            totalRecurrenciaGlobal += c.uds;
          }
        });
        recurrenciaCounts[mCol] = count;
        recurrenciaMontos[mCol] = monto;
      });

      return {
        mes: mesGestion,
        cantEmision,
        montoEmision,
        recurrenciaCounts,
        recurrenciaMontos,
        idxGestion
      };
    });

    return { 
      dataSeguimiento: results, 
      kpiGlobal: { totalEmisionGlobal, totalRecurrenciaGlobal, totalCartera: clients.length } 
    };
  }, [asegurados]);

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
        Seguimiento de Gestión de Cobranzas Banco Plaza - Banesco Mensual
      </h2>

      {/* Tarjeta de Observación Inteligente / Business Intelligence */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        borderLeft: '4px solid #0284c7', 
        border: '1px solid #e2e8f0', 
        borderLeftWidth: '4px',
        borderRadius: '0.5rem', 
        padding: '1rem 1.25rem', 
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '1rem' }}>💡</span>
          <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Observación Inteligente de Cobranzas (BI)
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: '1.5' }}>
          Se registra un total de <strong>{kpiGlobal.totalCartera} asegurados activos</strong> en el periodo. La cohorte de gestión de <strong>Octubre</strong> muestra el mayor volumen de emisión activa ({dataSeguimiento.find(d => d.mes === 'OCTUBRE')?.cantEmision || 0} contratos), consolidando una retención y recurrencia estable hacia <strong>Noviembre</strong>. Se recomienda reforzar las campañas de cobranza automatizada en los clientes con más de una cuota pendiente para maximizar el flujo de caja operativo antes del cierre de diciembre.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              <th style={{ padding: '0.6rem', border: '1px solid #cbd5e1' }}>Mes de Gestion</th>
              <th style={{ padding: '0.6rem', border: '1px solid #cbd5e1' }}>Seguimiento</th>
              <th style={{ padding: '0.6rem', border: '1px solid #cbd5e1' }}>Julio</th>
              <th style={{ padding: '0.6rem', border: '1px solid #cbd5e1' }}>Agosto</th>
              <th style={{ padding: '0.6rem', border: '1px solid #cbd5e1' }}>Septiembre</th>
              <th style={{ padding: '0.6rem', border: '1px solid #cbd5e1' }}>Octubre</th>
              <th style={{ padding: '0.6rem', border: '1px solid #cbd5e1' }}>Noviembre</th>
              <th style={{ padding: '0.6rem', border: '1px solid #cbd5e1' }}>Diciembre</th>
            </tr>
          </thead>
          <tbody>
            {dataSeguimiento.map((row) => {
              const bgMes = row.mes === 'JULIO' ? '#3b82f6' : row.mes === 'AGOSTO' ? '#eab308' : row.mes === 'SEPTIEMBRE' ? '#0f172a' : row.mes === 'OCTUBRE' ? '#1e293b' : '#0284c7';
              const colorTextoMes = row.mes === 'AGOSTO' ? '#000' : '#fff';
              const mesesList = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

              return (
                <React.Fragment key={row.mes}>
                  <tr style={{ borderBottom: '1px dashed #cbd5e1' }}>
                    <td rowSpan={4} style={{ backgroundColor: bgMes, color: colorTextoMes, fontWeight: 700, border: '1px solid #cbd5e1', verticalAlign: 'middle', fontSize: '0.85rem' }}>
                      {row.mes.charAt(0) + row.mes.slice(1).toLowerCase()}
                    </td>
                    <td style={{ textAlign: 'left', padding: '0.4rem 0.8rem', fontWeight: 600, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>Emision</td>
                    {mesesList.map((m, i) => (
                      <td key={m} style={{ border: '1px solid #cbd5e1' }}>
                        {i === row.idxGestion ? row.cantEmision : '-'}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ borderBottom: '1px dashed #cbd5e1' }}>
                    <td style={{ textAlign: 'left', padding: '0.4rem 0.8rem', fontWeight: 600, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>Recurrencia</td>
                    {mesesList.map((m, i) => (
                      <td key={m} style={{ border: '1px solid #cbd5e1' }}>
                        {i > row.idxGestion ? (row.recurrenciaCounts[m] || 0) : '-'}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ borderBottom: '1px dashed #cbd5e1' }}>
                    <td style={{ textAlign: 'left', padding: '0.4rem 0.8rem', fontWeight: 600, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>Monto $ Emision</td>
                    {mesesList.map((m, i) => (
                      <td key={m} style={{ border: '1px solid #cbd5e1', fontWeight: 600 }}>
                        {i === row.idxGestion && row.montoEmision > 0 ? `$${row.montoEmision.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ borderBottom: '2px solid #94a3b8' }}>
                    <td style={{ textAlign: 'left', padding: '0.4rem 0.8rem', fontWeight: 600, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>Monto $ Recurrencia</td>
                    {mesesList.map((m, i) => {
                      const montoRec = row.recurrenciaMontos[m] || 0;
                      return (
                        <td key={m} style={{ border: '1px solid #cbd5e1', fontWeight: 600, color: i > row.idxGestion ? '#16a34a' : '#64748b' }}>
                          {i > row.idxGestion ? `$${montoRec.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};