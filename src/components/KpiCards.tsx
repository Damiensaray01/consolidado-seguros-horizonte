'use client';

import React, { useMemo } from 'react';
import { Asegurado } from '../types';
import { formatUSD, formatVES } from '../lib/utils';
import { Users, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface KpiCardsProps {
  asegurados: Asegurado[];
  activeTab: string;
}

const MESES_ORDENADOS = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

export const KpiCards: React.FC<KpiCardsProps> = ({ asegurados, activeTab }) => {
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

  // Calcular cuotas pendientes por cada cliente
  const calcularCuotasPendientes = (mesesPagados: Set<string>): number => {
    if (mesesPagados.has('OCTUBRE') || mesesPagados.has('NOVIEMBRE') || mesesPagados.has('DICIEMBRE')) {
      return 0; // Solvente o al día en los meses recientes
    }

    const ultMesPagadoIndex = MESES_ORDENADOS.reduce((ultimoIndex, mes, idx) => {
      return mesesPagados.has(mes) ? idx : ultimoIndex;
    }, -1);

    if (ultMesPagadoIndex === -1) {
      return MESES_ORDENADOS.indexOf('OCTUBRE') + 1; // Si no tiene pagos, debe todas hasta octubre
    }

    const INDICE_MES_ACTUAL = 3; // Octubre es índice 3
    const cuotasPendientes = INDICE_MES_ACTUAL - ultMesPagadoIndex;

    return cuotasPendientes > 0 ? cuotasPendientes : 0;
  };

  const { totalUnicos, solventes, totalCuotasPendientes, totalUSD, totalBs } = useMemo(() => {
    const mapa = new Map<
      string,
      {
        status: string;
        usd: number;
        bs: number;
        meses: Set<string>;
        mesInicial: string;
        fechasPagos: string[];
      }
    >();

    asegurados.forEach((a) => {
      const key = a.cedula ? String(a.cedula).trim() : a.nombreApellido.trim();
      const mesDesdeFecha = obtenerMesDesdeFecha(a.fechaPago);
      const mesItem = (mesDesdeFecha || a.mes || 'JULIO').toUpperCase().trim();
      const montoUSD = parseMontoUSD(a.uds);
      const montoBs = a.montoBs || 0;

      if (!mapa.has(key)) {
        const setMeses = new Set<string>();
        if (mesItem) setMeses.add(mesItem);
        mapa.set(key, {
          status: a.statusPago || 'Solvente',
          usd: montoUSD,
          bs: montoBs,
          meses: setMeses,
          mesInicial: mesItem,
          fechasPagos: a.fechaPago ? [a.fechaPago] : [],
        });
      } else {
        const ext = mapa.get(key)!;
        if (mesItem) {
          ext.meses.add(mesItem);
          ext.usd += montoUSD;
          ext.bs += montoBs;
        }
        if (a.fechaPago) {
          ext.fechasPagos.push(a.fechaPago);
        }
      }
    });

    let lista = Array.from(mapa.values()).map((item) => {
      let fechaMasAntigua = item.fechasPagos.length > 0
        ? item.fechasPagos.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
        : null;

      const mesDesdeFechaInicial = obtenerMesDesdeFecha(fechaMasAntigua);
      const primerMes =
        mesDesdeFechaInicial ||
        MESES_ORDENADOS.find((m) => item.meses.has(m)) ||
        item.mesInicial;

      const cuotasPend = calcularCuotasPendientes(item.meses);

      return {
        ...item,
        mesInicial: primerMes,
        cuotasPendientes: cuotasPend,
      };
    });

    if (activeTab !== 'TODOS') {
      lista = lista.filter((item) => item.mesInicial === activeTab);
    }

    const solv = lista.filter((i) => i.cuotasPendientes === 0).length;
    const sumaCuotasPendientes = lista.reduce((acc, curr) => acc + curr.cuotasPendientes, 0);

    return {
      totalUnicos: lista.length,
      solventes: solv,
      totalCuotasPendientes: sumaCuotasPendientes,
      totalUSD: lista.reduce((sum, i) => sum + i.usd, 0),
      totalBs: lista.reduce((sum, i) => sum + i.bs, 0),
    };
  }, [asegurados, activeTab]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '0.875rem',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: '0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', margin: '1.5rem 0' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Asegurados {activeTab !== 'TODOS' ? `(${activeTab})` : 'Totales'}
          </span>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: '0.5rem', display: 'flex' }}>
            <Users size={20} />
          </div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{totalUnicos}</div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>Ingresos consolidados</p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Solventes
          </span>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '0.5rem', display: 'flex' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{solventes}</div>
          <p style={{ fontSize: '0.75rem', color: '#059669', margin: '0.35rem 0 0 0' }}>
            {totalUnicos > 0 ? Math.round((solventes / totalUnicos) * 100) : 0}% al día
          </p>
        </div>
      </div>

      {/* Tarjeta de Cuotas Pendientes / Mora */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cuotas Pendientes / Mora
          </span>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', borderRadius: '0.5rem', display: 'flex' }}>
            <AlertCircle size={20} />
          </div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{totalCuotasPendientes}</div>
          <p style={{ fontSize: '0.75rem', color: '#d97706', margin: '0.35rem 0 0 0' }}>Total cuotas a gestionar</p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recaudación {activeTab !== 'TODOS' ? activeTab : 'Total'}
          </span>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderRadius: '0.5rem', display: 'flex' }}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{formatUSD(totalUSD)}</div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', margin: '0.35rem 0 0 0' }}>{formatVES(totalBs)}</p>
        </div>
      </div>
    </div>
  );
};