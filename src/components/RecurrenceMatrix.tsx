'use client';

import React, { useMemo } from 'react';
import { Asegurado } from '../types';
import { formatUSD } from '../lib/utils';
import { Layers, BarChart3 } from 'lucide-react';

interface RecurrenceMatrixProps {
  asegurados: Asegurado[];
}

const MESES = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
const MESES_ORDENADOS = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

// Cédulas que pertenecen estrictamente a la cohorte de Julio por solicitud directa
const CEDULAS_JULIO_FORZADAS = new Set([
  '11200321', '25773821', '10001358', '14907686', '18093973',
  '18501572', '18003787', '25847994', '27163228', '9609349',
  '12174446', '14652892', '11931380', '7793727', '25894713',
  '7662055', '11555269', '14652893', '14884967', '28443208',
  '10000106', '5831725', '31217211', '32266111'
]);

export const RecurrenceMatrix: React.FC<RecurrenceMatrixProps> = ({ asegurados }) => {
  const parseMontoUSD = (val: any): number => {
    if (val === undefined || val === null) return 5.99;
    let num = typeof val === 'number' ? val : parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 5.99;
    return num > 100 ? num / 100 : num;
  };

  const obtenerMesDesdeFecha = (fechaRaw: any): string | null => {
    if (!fechaRaw) return null;
    try {
      let d = new Date(fechaRaw);
      if (isNaN(d.getTime())) {
        const partes = String(fechaRaw).split('/');
        if (partes.length === 3) {
          d = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
        }
      }
      if (isNaN(d.getTime())) return null;

      const mesNum = d.getMonth();
      const mapaMesesNum: { [key: number]: string } = {
        6: 'JULIO',
        7: 'AGOSTO',
        8: 'SEPTIEMBRE',
        9: 'OCTUBRE',
        10: 'NOVIEMBRE',
        11: 'DICIEMBRE',
      };
      return mapaMesesNum[mesNum] || null;
    } catch {
      return null;
    }
  };

  // Consolidar datos de la matriz con prioridad para las cédulas de Julio
  const matrixData = useMemo(() => {
    const mapaTitulares = new Map<
      string,
      {
        cedulaTrim: string;
        mesInicial: string;
        pagosPorMes: Map<string, number>;
        fechasPagos: string[];
      }
    >();

    asegurados.forEach((item) => {
      const cedulaStr = item.cedula ? String(item.cedula).trim() : '';
      const cedulaKey = cedulaStr || item.nombreApellido.trim();
      
      const mesDesdeFecha = obtenerMesDesdeFecha(item.fechaPago);
      let mesItem = (mesDesdeFecha || item.mes || 'JULIO').toUpperCase().trim();

      // Si la cédula está en la lista forzada de Julio, asegurar su mes inicial
      if (CEDULAS_JULIO_FORZADAS.has(cedulaStr)) {
        mesItem = 'JULIO';
      }

      const montoUSD = parseMontoUSD(item.uds);

      if (!mapaTitulares.has(cedulaKey)) {
        const pagosMap = new Map<string, number>();
        pagosMap.set(mesItem, montoUSD);
        mapaTitulares.set(cedulaKey, {
          cedulaTrim: cedulaStr,
          mesInicial: CEDULAS_JULIO_FORZADAS.has(cedulaStr) ? 'JULIO' : mesItem,
          pagosPorMes: pagosMap,
          fechasPagos: item.fechaPago ? [item.fechaPago] : [],
        });
      } else {
        const ext = mapaTitulares.get(cedulaKey)!;
        if (mesItem) {
          const acumulado = ext.pagosPorMes.get(mesItem) || 0;
          ext.pagosPorMes.set(mesItem, acumulado + montoUSD);
        }
        if (item.fechaPago) {
          ext.fechasPagos.push(item.fechaPago);
        }
      }
    });

    const clientesConsolidados = Array.from(mapaTitulares.values()).map((c) => {
      if (CEDULAS_JULIO_FORZADAS.has(c.cedulaTrim)) {
        return { ...c, mesInicial: 'JULIO' };
      }

      let fechaMasAntigua = c.fechasPagos.length > 0
        ? c.fechasPagos.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
        : null;

      const mesDesdeFechaInicial = obtenerMesDesdeFecha(fechaMasAntigua);
      const primerMes =
        mesDesdeFechaInicial ||
        MESES_ORDENADOS.find((m) => c.pagosPorMes.has(m)) ||
        c.mesInicial;

      return {
        ...c,
        mesInicial: primerMes,
      };
    });

    return MESES.map((mesOrigen, origenIdx) => {
      const clientesCohorte = clientesConsolidados.filter((c) => c.mesInicial === mesOrigen);

      const emisionesCount = clientesCohorte.length;
      const emisionesMonto = clientesCohorte.reduce(
        (acc, c) => acc + (c.pagosPorMes.get(mesOrigen) || 0),
        0
      );

      const recurrenciaColumnas = MESES.map((mesCol, colIdx) => {
        if (colIdx <= origenIdx) {
          return { count: 0, monto: 0 };
        }

        const pagaronEnMesCol = clientesCohorte.filter((c) => c.pagosPorMes.has(mesCol));
        const montoEnMesCol = pagaronEnMesCol.reduce(
          (acc, c) => acc + (c.pagosPorMes.get(mesCol) || 0),
          0
        );

        return {
          count: pagaronEnMesCol.length,
          monto: montoEnMesCol,
        };
      });

      return {
        mesOrigen,
        emisionesCount,
        emisionesMonto,
        recurrenciaColumnas,
      };
    });
  }, [asegurados]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
      
      {/* 1. MATRIZ TRADICIONAL */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#090d16',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <Layers size={18} color="#38bdf8" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
            Seguimiento de Gestión de Cobranzas Banco Plaza - Banesco Mensual
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#f8fafc' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center', minWidth: '130px' }}>Mes de Gestion</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left', minWidth: '160px' }}>Seguimiento</th>
                {MESES.map((mes) => (
                  <th key={mes} style={{ padding: '0.85rem 1rem', textAlign: 'center', minWidth: '110px' }}>
                    {mes.charAt(0) + mes.slice(1).toLowerCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row) => {
                const bgHeader =
                  row.mesOrigen === 'JULIO'
                    ? '#3b82f6'
                    : row.mesOrigen === 'AGOSTO'
                    ? '#f59e0b'
                    : row.mesOrigen === 'SEPTIEMBRE'
                    ? '#0f172a'
                    : '#1e293b';

                const origenIdx = MESES.indexOf(row.mesOrigen);

                return (
                  <React.Fragment key={row.mesOrigen}>
                    <tr style={{ borderTop: '2px solid #334155', backgroundColor: '#0f172a' }}>
                      <td
                        rowSpan={4}
                        style={{
                          backgroundColor: bgHeader,
                          color: '#ffffff',
                          fontWeight: 800,
                          textAlign: 'center',
                          fontSize: '1rem',
                          borderRight: '1px solid #334155',
                        }}
                      >
                        {row.mesOrigen.charAt(0) + row.mesOrigen.slice(1).toLowerCase()}
                      </td>
                      <td style={{ padding: '0.45rem 1rem', fontWeight: 700, color: '#f8fafc' }}>Emision</td>
                      {MESES.map((mesCol, mIdx) => {
                        const esSuMes = mIdx === origenIdx;
                        return (
                          <td
                            key={mesCol}
                            style={{
                              padding: '0.45rem 1rem',
                              textAlign: 'center',
                              fontWeight: 700,
                              color: esSuMes ? '#38bdf8' : '#64748b',
                            }}
                          >
                            {esSuMes ? row.emisionesCount : ''}
                          </td>
                        );
                      })}
                    </tr>

                    <tr style={{ backgroundColor: '#0f172a' }}>
                      <td style={{ padding: '0.45rem 1rem', fontWeight: 700, color: '#f8fafc' }}>Recurrencia</td>
                      {MESES.map((mesCol, mIdx) => {
                        const colData = row.recurrenciaColumnas[mIdx];
                        const esPosterior = mIdx > origenIdx;
                        return (
                          <td
                            key={mesCol}
                            style={{
                              padding: '0.45rem 1rem',
                              textAlign: 'center',
                              fontWeight: 700,
                              color: esPosterior ? '#34d399' : '#64748b',
                            }}
                          >
                            {esPosterior ? colData.count : ''}
                          </td>
                        );
                      })}
                    </tr>

                    <tr style={{ backgroundColor: '#020617' }}>
                      <td style={{ padding: '0.45rem 1rem', fontWeight: 700, color: '#f8fafc' }}>Monto $ Emision</td>
                      {MESES.map((mesCol, mIdx) => {
                        const esSuMes = mIdx === origenIdx;
                        return (
                          <td
                            key={mesCol}
                            style={{
                              padding: '0.45rem 1rem',
                              textAlign: 'center',
                              fontWeight: 800,
                              color: esSuMes ? '#38bdf8' : '#64748b',
                            }}
                          >
                            {esSuMes ? formatUSD(row.emisionesMonto) : ''}
                          </td>
                        );
                      })}
                    </tr>

                    <tr style={{ backgroundColor: '#020617', borderBottom: '2px dashed #334155' }}>
                      <td style={{ padding: '0.45rem 1rem', fontWeight: 700, color: '#f8fafc' }}>Monto $ Recurrencia</td>
                      {MESES.map((mesCol, mIdx) => {
                        const colData = row.recurrenciaColumnas[mIdx];
                        const esPosterior = mIdx > origenIdx;
                        return (
                          <td
                            key={mesCol}
                            style={{
                              padding: '0.45rem 1rem',
                              textAlign: 'center',
                              fontWeight: 800,
                              color: esPosterior ? '#34d399' : '#64748b',
                            }}
                          >
                            {esPosterior ? (colData.monto > 0 ? formatUSD(colData.monto) : '$0,00') : ''}
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

      {/* 2. SECCIÓN DE GRÁFICOS ANALÍTICOS */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#090d16',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <BarChart3 size={18} color="#34d399" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
            Análisis Gráfico de Emisión y Recurrencia por Cohorte
          </h2>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {matrixData.map((row) => {
            const maxCount = Math.max(row.emisionesCount, 1);
            const bgHeader =
              row.mesOrigen === 'JULIO'
                ? '#3b82f6'
                : row.mesOrigen === 'AGOSTO'
                ? '#f59e0b'
                : row.mesOrigen === 'SEPTIEMBRE'
                ? '#64748b'
                : '#1e293b';

            return (
              <div
                key={row.mesOrigen}
                style={{
                  backgroundColor: '#020617',
                  border: '1px solid #1e293b',
                  borderRadius: '0.875rem',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #1e293b',
                    paddingBottom: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: bgHeader,
                      }}
                    />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                      Cohorte: {row.mesOrigen.charAt(0) + row.mesOrigen.slice(1).toLowerCase()}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>Emisión Base: <strong style={{ color: '#38bdf8' }}>{row.emisionesCount} clientes</strong></span>
                    <span>Monto Base: <strong style={{ color: '#34d399' }}>{formatUSD(row.emisionesMonto)}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {MESES.map((mesCol, mIdx) => {
                    const origenIdx = MESES.indexOf(row.mesOrigen);
                    const esSuMes = mIdx === origenIdx;
                    const esPosterior = mIdx > origenIdx;

                    let count = 0;
                    let monto = 0;
                    let labelTipo = '';

                    if (esSuMes) {
                      count = row.emisionesCount;
                      monto = row.emisionesMonto;
                      labelTipo = 'Emisión';
                    } else if (esPosterior) {
                      const colData = row.recurrenciaColumnas[mIdx];
                      count = colData.count;
                      monto = colData.monto;
                      labelTipo = 'Recurrencia';
                    } else {
                      return null;
                    }

                    const porcentajeBarra = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                      <div
                        key={mesCol}
                        style={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            {mesCol.charAt(0) + mesCol.slice(1).toLowerCase()}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: esSuMes ? '#38bdf8' : '#34d399', marginBottom: '0.4rem', fontWeight: 600 }}>
                            {labelTipo}
                          </div>
                        </div>

                        <div style={{ margin: '0.2rem 0' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
                            {count} <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#64748b' }}>cli.</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginTop: '0.15rem' }}>
                            {formatUSD(monto)}
                          </div>
                        </div>

                        <div style={{ width: '100%', backgroundColor: '#1e293b', borderRadius: '9999px', height: '6px', overflow: 'hidden', marginTop: '0.5rem' }}>
                          <div
                            style={{
                              width: `${porcentajeBarra}%`,
                              backgroundColor: esSuMes ? '#3b82f6' : '#10b981',
                              height: '100%',
                              borderRadius: '9999px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};