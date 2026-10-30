'use client';

import React, { useMemo } from 'react';
import { Asegurado } from '@/types';

interface SeguimientoCobranzasProps {
  asegurados: Asegurado[];
}

export const SeguimientoCobranzas: React.FC<SeguimientoCobranzasProps> = ({ asegurados }) => {
  const dataSeguimiento = useMemo(() => {
    const mesesCols = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const gestionMeses = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE'];

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

      if (Number(itemAny.cuotaJulio || (item.mes?.toUpperCase().includes('JULIO') ? 1 : 0) || (item.jul || 0)) > 0 || String(item.fechaPago || '').includes('/7/2026')) entry.jul = 1;
      if (Number(itemAny.cuotaAgosto || (item.mes?.toUpperCase().includes('AGOSTO') ? 1 : 0) || (item.ago || 0)) > 0 || String(item.fechaPago || '').includes('/8/2026')) entry.ago = 1;
      if (Number(itemAny.cuotaSeptiembre || (item.mes?.toUpperCase().includes('SEPTIEMBRE') ? 1 : 0) || (item.sep || 0)) > 0 || String(item.fechaPago || '').includes('/9/2026')) entry.sep = 1;
      if (Number(itemAny.cuotaOctubre || (item.mes?.toUpperCase().includes('OCTUBRE') ? 1 : 0) || (item.oct || 0)) > 0 || String(item.fechaPago || '').includes('/10/2026')) entry.oct = 1;
      if (Number(itemAny.cuotaNoviembre || (item.mes?.toUpperCase().includes('NOVIEMBRE') ? 1 : 0) || (item.nov || 0)) > 0 || String(item.fechaPago || '').includes('/11/2026')) entry.nov = 1;
      if (Number(itemAny.cuotaDiciembre || (item.mes?.toUpperCase().includes('DICIEMBRE') ? 1 : 0) || (item.dic || 0)) > 0 || String(item.fechaPago || '').includes('/12/2026')) entry.dic = 1;
    });

    const clients = Array.from(clientMap.values()).map(client => {
      let mesInicial = 'JULIO';
      if (client.jul === 1) mesInicial = 'JULIO';
      else if (client.ago === 1) mesInicial = 'AGOSTO';
      else if (client.sep === 1) mesInicial = 'SEPTIEMBRE';
      else if (client.oct === 1) mesInicial = 'OCTUBRE';
      return { ...client, mesInicial };
    });

    return gestionMeses.map(mesGestion => {
      const clientesEmision = clients.filter(c => c.mesInicial === mesGestion);
      const cantEmision = clientesEmision.length;
      const montoEmision = clientesEmision.reduce((acc, c) => acc + c.uds, 0);

      const recurrenciaCounts: { [key: string]: number } = {};
      const recurrenciaMontos: { [key: string]: number } = {};

      mesesCols.forEach(mCol => {
        let count = 0;
        let monto = 0;
        clientesEmision.forEach(c => {
          const val = mCol === 'JULIO' ? c.jul : mCol === 'AGOSTO' ? c.ago : mCol === 'SEPTIEMBRE' ? c.sep : mCol === 'OCTUBRE' ? c.oct : mCol === 'NOVIEMBRE' ? c.nov : c.dic;
          if (val === 1) {
            count++;
            monto += c.uds;
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
        recurrenciaMontos
      };
    });
  }, [asegurados]);

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontFamily: 'sans-serif', overflowX: 'auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
        Seguimiento de Gestión de Cobranzas Banco Plaza - Banesco Mensual
      </h2>

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
            const bgMes = row.mes === 'JULIO' ? '#3b82f6' : row.mes === 'AGOSTO' ? '#eab308' : '#0f172a';
            const colorTextoMes = row.mes === 'AGOSTO' ? '#000' : '#fff';

            return (
              <React.Fragment key={row.mes}>
                <tr style={{ borderBottom: '1px dashed #cbd5e1' }}>
                  <td rowSpan={4} style={{ backgroundColor: bgMes, color: colorTextoMes, fontWeight: 700, border: '1px solid #cbd5e1', verticalAlign: 'middle', fontSize: '0.85rem' }}>
                    {row.mes.charAt(0) + row.mes.slice(1).toLowerCase()}
                  </td>
                  <td style={{ textAlign: 'left', padding: '0.4rem 0.8rem', fontWeight: 600, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>Emision</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.mes === 'JULIO' ? row.cantEmision : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.mes === 'AGOSTO' ? row.cantEmision : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.mes === 'SEPTIEMBRE' ? row.cantEmision : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.mes === 'OCTUBRE' ? row.cantEmision : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>-</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>-</td>
                </tr>
                <tr style={{ borderBottom: '1px dashed #cbd5e1' }}>
                  <td style={{ textAlign: 'left', padding: '0.4rem 0.8rem', fontWeight: 600, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>Recurrencia</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.recurrenciaCounts['JULIO'] || 0}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.recurrenciaCounts['AGOSTO'] || 0}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.recurrenciaCounts['SEPTIEMBRE'] || 0}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.recurrenciaCounts['OCTUBRE'] || 0}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.recurrenciaCounts['NOVIEMBRE'] || 0}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>{row.recurrenciaCounts['DICIEMBRE'] || 0}</td>
                </tr>
                <tr style={{ borderBottom: '1px dashed #cbd5e1' }}>
                  <td style={{ textAlign: 'left', padding: '0.4rem 0.8rem', fontWeight: 600, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>Monto $ Emision</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600 }}>{row.mes === 'JULIO' && row.montoEmision > 0 ? `$${row.montoEmision.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600 }}>{row.mes === 'AGOSTO' && row.montoEmision > 0 ? `$${row.montoEmision.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600 }}>{row.mes === 'SEPTIEMBRE' && row.montoEmision > 0 ? `$${row.montoEmision.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600 }}>{row.mes === 'OCTUBRE' && row.montoEmision > 0 ? `$${row.montoEmision.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>-</td>
                  <td style={{ border: '1px solid #cbd5e1' }}>-</td>
                </tr>
                <tr style={{ borderBottom: '2px solid #94a3b8' }}>
                  <td style={{ textAlign: 'left', padding: '0.4rem 0.8rem', fontWeight: 600, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>Monto $ Recurrencia</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600, color: '#16a34a' }}>${(row.recurrenciaMontos['JULIO'] || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600, color: '#16a34a' }}>${(row.recurrenciaMontos['AGOSTO'] || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600, color: '#16a34a' }}>${(row.recurrenciaMontos['SEPTIEMBRE'] || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600, color: '#16a34a' }}>${(row.recurrenciaMontos['OCTUBRE'] || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600, color: '#16a34a' }}>${(row.recurrenciaMontos['NOVIEMBRE'] || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600, color: '#16a34a' }}>${(row.recurrenciaMontos['DICIEMBRE'] || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};