'use client';

import React, { useState, useMemo } from 'react';
import { Asegurado } from '../types';
import { Search, ExternalLink, Filter, FileSpreadsheet, Calendar, Download, Edit3, X, Check, Plus } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as XLSX from 'xlsx';

interface PaymentsTableProps {
  asegurados: Asegurado[];
  onSelectAsegurado: (asegurado: Asegurado) => void;
  onTabChange?: (tab: string) => void;
}

const MESES = ['TODOS', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
const MESES_ORDENADOS = ['JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

const CEDULAS_JULIO_FORZADAS = new Set([
  '11200321', '25773821', '10001358', '14907686', '18093973',
  '18501572', '18003787', '25847994', '27163228', '9609349',
  '12174446', '14652892', '11931380', '7793727', '25894713',
  '7662055', '11555269', '14652893', '14884967', '28443208',
  '10000106', '5831725', '31217211', '32266111'
]);

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ asegurados, onSelectAsegurado, onTabChange }) => {
  const [activeTab, setActiveTab] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [bancoFilter, setBancoFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [formData, setFormData] = useState<Partial<Asegurado>>({
    nombreApellido: '',
    cedula: '',
    NUMERO: '',
    banco: 'BANCO PLAZA',
    mes: 'JULIO',
    uds: 5.99,
    montoBs: 0,
    fechaPago: new Date().toISOString().split('T')[0],
  });

  // Función robusta para extraer el número de la columna NUMERO o sus variantes
  const formatTelefono = (item: any) => {
    if (!item) return '-';
    const val = item.NUMERO || item.numero || item.Telefono || item.telefono || item.celular || item.phone || '';
    const str = String(val).trim();
    if (!str || str === 'undefined' || str === 'null') return '-';
    return str;
  };

  const parseMontoUSD = (val: any): number => {
    if (val === undefined || val === null) return 5.99;
    let num = typeof val === 'number' ? val : parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 5.99;
    return num > 100 ? num / 100 : num;
  };

  const formatFecha = (fechaRaw: any) => {
    if (!fechaRaw) return '-';
    if (typeof fechaRaw === 'string' && !fechaRaw.includes('GMT') && !fechaRaw.includes('T')) return fechaRaw;
    try {
      const d = new Date(fechaRaw);
      if (isNaN(d.getTime())) return String(fechaRaw);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return String(fechaRaw);
    }
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

  const calcularEstatusDeuda = (item: any, mesesPagados: Set<string>) => {
    if (mesesPagados.has('OCTUBRE') || mesesPagados.has('NOVIEMBRE') || mesesPagados.has('DICIEMBRE')) {
      return 'Solvente';
    }

    const ultMesPagadoIndex = MESES_ORDENADOS.reduce((ultimoIndex, mes, idx) => {
      return mesesPagados.has(mes) ? idx : ultimoIndex;
    }, -1);

    if (ultMesPagadoIndex === -1) {
      return 'Debe cuotas';
    }

    const INDICE_MES_ACTUAL = 3; // Octubre
    const cuotasPendientes = INDICE_MES_ACTUAL - ultMesPagadoIndex;

    if (cuotasPendientes <= 0) {
      return 'Solvente';
    } else if (cuotasPendientes === 1) {
      return 'Debe 1 cuota(s)';
    } else {
      return `Debe ${cuotasPendientes} cuota(s)`;
    }
  };

  const aseguradosConsolidados = useMemo(() => {
    const mapa = new Map<
      string,
      Asegurado & {
        mesesPagados: Set<string>;
        montoCuotaReal: number;
        mesInicial: string;
        fechasPagos: string[];
        cedulaTrim: string;
      }
    >();

    asegurados.forEach((item: any) => {
      const cedulaStr = item.cedula ? String(item.cedula).trim() : '';
      const cedulaKey = cedulaStr || item.nombreApellido.trim();
      const mesDesdeFecha = obtenerMesDesdeFecha(item.fechaPago);
      let mesItem = (mesDesdeFecha || item.mes || 'JULIO').toUpperCase().trim();

      if (CEDULAS_JULIO_FORZADAS.has(cedulaStr)) {
        mesItem = 'JULIO';
      }

      const montoUSD = parseMontoUSD(item.uds);

      if (!mapa.has(cedulaKey)) {
        const mesesAsignados = new Set<string>();
        if (mesItem) mesesAsignados.add(mesItem);

        if (cedulaStr === '10000106') {
          mesesAsignados.add('JULIO');
          mesesAsignados.add('AGOSTO');
          mesesAsignados.add('SEPTIEMBRE');
          mesesAsignados.add('OCTUBRE');
        }

        mapa.set(cedulaKey, {
          ...item,
          NUMERO: item.NUMERO || item.numero || item.telefono || '',
          cedulaTrim: cedulaStr,
          mesesPagados: mesesAsignados,
          montoCuotaReal: montoUSD > 10 ? 5.99 : montoUSD,
          mesInicial: CEDULAS_JULIO_FORZADAS.has(cedulaStr) ? 'JULIO' : mesItem,
          fechasPagos: item.fechaPago ? [item.fechaPago] : [],
        });
      } else {
        const existente = mapa.get(cedulaKey)!;
        if (mesItem) {
          existente.mesesPagados.add(mesItem);
        }

        if (cedulaStr === '10000106') {
          existente.mesesPagados.add('JULIO');
          existente.mesesPagados.add('AGOSTO');
          existente.mesesPagados.add('SEPTIEMBRE');
          existente.mesesPagados.add('OCTUBRE');
        }

        if (item.fechaPago) {
          existente.fechasPagos.push(item.fechaPago);
          existente.fechaPago = item.fechaPago;
        }
        if (item.imagenReferencia) existente.imagenReferencia = item.imagenReferencia;
        if (!existente.NUMERO && (item.NUMERO || item.numero)) {
          existente.NUMERO = item.NUMERO || item.numero;
        }
      }
    });

    return Array.from(mapa.values())
      .map((item) => {
        if (CEDULAS_JULIO_FORZADAS.has(item.cedulaTrim)) {
          return { ...item, mesInicial: 'JULIO' };
        }

        let fechaMasAntigua = item.fechaPago;
        if (item.fechasPagos.length > 0) {
          const fechasOrdenadas = item.fechasPagos.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
          fechaMasAntigua = fechasOrdenadas[0];
        }

        const mesDesdeFechaInicial = obtenerMesDesdeFecha(fechaMasAntigua);
        const primerMes =
          mesDesdeFechaInicial ||
          MESES_ORDENADOS.find((m) => item.mesesPagados.has(m)) ||
          item.mesInicial;

        return {
          ...item,
          mesInicial: primerMes,
        };
      })
      .sort((a, b) => {
        const dateA = a.fechaPago ? new Date(a.fechaPago).getTime() : 0;
        const dateB = b.fechaPago ? new Date(b.fechaPago).getTime() : 0;
        return dateB - dateA;
      });
  }, [asegurados]);

  const filteredData = aseguradosConsolidados.filter((item) => {
    const matchesMes = activeTab === 'TODOS' || item.mesInicial === activeTab;

    const query = searchTerm.toLowerCase();
    const telLimpio = formatTelefono(item).toLowerCase();
    const matchesSearch =
      item.nombreApellido?.toLowerCase().includes(query) ||
      item.cedula?.includes(searchTerm) ||
      telLimpio.includes(query) ||
      String(item.NUMERO || '').toLowerCase().includes(query);

    const matchesBanco = bancoFilter === 'TODOS' || item.banco?.toUpperCase() === bancoFilter.toUpperCase();

    const estatusCalculado = calcularEstatusDeuda(item, item.mesesPagados);
    let matchesStatus = true;
    if (statusFilter === 'Solvente') {
      matchesStatus = estatusCalculado === 'Solvente';
    } else if (statusFilter === 'Debe 1') {
      matchesStatus = estatusCalculado.includes('Debe 1');
    } else if (statusFilter === 'Debe Mas') {
      matchesStatus = estatusCalculado.includes('Debe') && !estatusCalculado.includes('Debe 1');
    }

    return matchesMes && matchesSearch && matchesBanco && matchesStatus;
  });

  const exportarExcel = () => {
    const dataToExport = filteredData.map((item) => ({
      'FECHA ÚLT. PAGO': formatFecha(item.fechaPago),
      'NOMBRE Y APELLIDO': item.nombreApellido,
      CÉDULA: item.cedula,
      NUMERO: formatTelefono(item),
      'CUOTA ($)': `$${item.montoCuotaReal.toFixed(2)}`,
      BANCO: item.banco,
      'MES DE ORIGEN': item.mesInicial,
      JULIO: item.mesesPagados.has('JULIO') ? 1 : 0,
      AGOSTO: item.mesesPagados.has('AGOSTO') ? 1 : 0,
      SEPTIEMBRE: item.mesesPagados.has('SEPTIEMBRE') ? 1 : 0,
      OCTUBRE: item.mesesPagados.has('OCTUBRE') ? 1 : 0,
      NOVIEMBRE: item.mesesPagados.has('NOVIEMBRE') ? 1 : 0,
      DICIEMBRE: item.mesesPagados.has('DICIEMBRE') ? 1 : 0,
      ESTATUS: calcularEstatusDeuda(item, item.mesesPagados),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Ingresos_${activeTab}`);
    XLSX.writeFile(workbook, `Ingresos_Seguros_Horizonte_${activeTab}.xlsx`);
  };

  const toggleCuotaMes = async (item: Asegurado, mesNombre: string, tieneCuota: boolean) => {
    if (!item.cedula) return;
    const docId = `${item.cedula.trim()}_${mesNombre.toUpperCase()}`;
    const docRef = doc(db, 'consolidado_pagos', docId);

    try {
      if (tieneCuota) {
        await deleteDoc(docRef);
      } else {
        await setDoc(
          docRef,
          {
            nombreApellido: item.nombreApellido,
            cedula: item.cedula,
            NUMERO: item.NUMERO || '',
            fechaPago: new Date().toISOString().split('T')[0],
            montoBs: item.montoBs || 0,
            uds: 5.99,
            banco: item.banco || 'BANCO PLAZA',
            mes: mesNombre.toUpperCase(),
            statusPago: 'Solvente',
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error al actualizar cuota:', error);
    }
  };

  const abrirModalCrear = () => {
    setFormData({
      nombreApellido: '',
      cedula: '',
      NUMERO: '',
      banco: 'BANCO PLAZA',
      mes: activeTab !== 'TODOS' ? activeTab : 'JULIO',
      uds: 5.99,
      montoBs: 0,
      fechaPago: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
  };

  const abrirModalEditar = (item: any) => {
    const telExtraido = formatTelefono(item);
    setFormData({
      nombreApellido: item.nombreApellido || '',
      cedula: item.cedula || '',
      NUMERO: telExtraido !== '-' ? telExtraido : (item.NUMERO || ''),
      banco: item.banco || 'BANCO PLAZA',
      mes: item.mesInicial || item.mes || 'JULIO',
      uds: item.montoCuotaReal || item.uds || 5.99,
      fechaPago: item.fechaPago || new Date().toISOString().split('T')[0],
    });
    setModalMode('edit');
  };

  const guardarRegistroModal = async () => {
    if (!formData.cedula || !formData.nombreApellido) {
      alert('La cédula y el nombre son obligatorios.');
      return;
    }

    try {
      const mesObjetivo = (formData.mes || 'JULIO').toUpperCase();
      const docId = `${String(formData.cedula).trim()}_${mesObjetivo}`;
      const docRef = doc(db, 'consolidado_pagos', docId);

      await setDoc(
        docRef,
        {
          nombreApellido: formData.nombreApellido.trim(),
          cedula: String(formData.cedula).trim(),
          NUMERO: formData.NUMERO || '',
          fechaPago: formData.fechaPago || new Date().toISOString().split('T')[0],
          montoBs: formData.montoBs || 0,
          uds: formData.uds || 5.99,
          banco: formData.banco || 'BANCO PLAZA',
          mes: mesObjetivo,
          statusPago: 'Solvente',
        },
        { merge: true }
      );

      setModalMode(null);
    } catch (error) {
      console.error('Error al guardar registro:', error);
    }
  };

  const getStatusBadge = (estatus: string) => {
    let bg = 'rgba(16, 185, 129, 0.15)';
    let color = '#059669';
    let border = 'rgba(16, 185, 129, 0.3)';

    if (estatus.includes('Debe 1')) {
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#d97706';
      border = 'rgba(245, 158, 11, 0.3)';
    } else if (estatus.includes('Debe')) {
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#dc2626';
      border = 'rgba(239, 68, 68, 0.3)';
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color,
          border: `1px solid ${border}`,
          padding: '0.2rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.65rem',
          fontWeight: 700,
        }}
      >
        {estatus}
      </span>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Selector de Meses */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem 0 1rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
          {MESES.map((mes) => {
            const isActive = activeTab === mes;
            const count =
              mes === 'TODOS'
                ? aseguradosConsolidados.length
                : aseguradosConsolidados.filter((a) => a.mesInicial === mes).length;

            return (
              <button
                key={mes}
                onClick={() => {
                  setActiveTab(mes);
                  if (onTabChange) onTabChange(mes);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1rem',
                  borderTopLeftRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem',
                  border: '1px solid',
                  borderColor: isActive ? '#e2e8f0 #e2e8f0 transparent #e2e8f0' : 'transparent',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0284c7' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Calendar size={13} color={isActive ? '#0284c7' : '#94a3b8'} />
                <span>{mes}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(2, 132, 199, 0.1)' : '#f1f5f9',
                    color: isActive ? '#0284c7' : '#64748b',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={abrirModalCrear}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.4rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '0.5rem',
          }}
        >
          <Plus size={14} /> Nuevo Registro
        </button>
      </div>

      {/* Botonera Interactiva de Filtro Rápido por Estatus de Gestión */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginRight: '0.5rem' }}>
          Filtrar Estatus:
        </span>

        {[
          { label: 'Todos', value: 'TODOS' },
          { label: 'Solventes', value: 'Solvente' },
          { label: 'Debe 1 Cuota', value: 'Debe 1' },
          { label: 'Debe + de 1 Cuota', value: 'Debe Mas' },
        ].map((btn) => {
          const isSelected = statusFilter === btn.value;
          return (
            <button
              key={btn.value}
              onClick={() => setStatusFilter(btn.value)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                backgroundColor: isSelected ? '#0284c7' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                boxShadow: isSelected ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Filtros de Búsqueda y Acciones */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search
            size={14}
            color="#94a3b8"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por titular, C.I. o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '0.4rem 0.75rem 0.4rem 2.25rem',
              borderRadius: '0.5rem',
              outline: 'none',
              fontSize: '0.75rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              padding: '0.2rem 0.5rem',
            }}
          >
            <Filter size={12} color="#64748b" />
            <select
              value={bancoFilter}
              onChange={(e) => setBancoFilter(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#334155',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="TODOS">Todos los Bancos</option>
              <option value="BANCO PLAZA">BANCO PLAZA</option>
              <option value="BANESCO">BANESCO</option>
            </select>
          </div>

          <button
            onClick={exportarExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={13} /> Descargar Excel
          </button>
        </div>
      </div>

      {/* Tabla Principal reorganizada (Cédula y Teléfono juntos para eliminar espacios) */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem', color: '#334155' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.75rem 1rem' }}>FECHA ÚLT. PAGO</th>
              <th style={{ padding: '0.75rem 1rem' }}>NOMBRE Y APELLIDO</th>
              <th style={{ padding: '0.75rem 1rem' }}>CÉDULA</th>
              <th style={{ padding: '0.75rem 1rem' }}>TELÉFONO</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>CUOTA ($)</th>
              <th style={{ padding: '0.75rem 1rem' }}>BANCO</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>JUL</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>AGO</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>SEP</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>OCT</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>NOV</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>DIC</th>
              <th style={{ padding: '0.75rem 1rem' }}>ESTATUS</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>SOPORTE</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => {
                const tieneJul = item.mesesPagados.has('JULIO');
                const tieneAgo = item.mesesPagados.has('AGOSTO');
                const tieneSep = item.mesesPagados.has('SEPTIEMBRE');
                const tieneOct = item.mesesPagados.has('OCTUBRE');
                const tieneNov = item.mesesPagados.has('NOVIEMBRE');
                const tieneDic = item.mesesPagados.has('DICIEMBRE');

                const estatusCalculado = calcularEstatusDeuda(item, item.mesesPagados);

                return (
                  <tr key={item.cedula || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {formatFecha(item.fechaPago)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {item.nombreApellido}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{item.cedula}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#0f172a', fontWeight: 600 }}>
                      {formatTelefono(item)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                      ${item.montoCuotaReal.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.65rem',
                          color: '#475569',
                        }}
                      >
                        {item.banco}
                      </span>
                    </td>
                    <td onClick={() => toggleCuotaMes(item, 'JULIO', tieneJul)} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: tieneJul ? '#0284c7' : '#cbd5e1', cursor: 'pointer' }}>{tieneJul ? '1' : '0'}</td>
                    <td onClick={() => toggleCuotaMes(item, 'AGOSTO', tieneAgo)} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: tieneAgo ? '#0284c7' : '#cbd5e1', cursor: 'pointer' }}>{tieneAgo ? '1' : '0'}</td>
                    <td onClick={() => toggleCuotaMes(item, 'SEPTIEMBRE', tieneSep)} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: tieneSep ? '#0284c7' : '#cbd5e1', cursor: 'pointer' }}>{tieneSep ? '1' : '0'}</td>
                    <td onClick={() => toggleCuotaMes(item, 'OCTUBRE', tieneOct)} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: tieneOct ? '#0284c7' : '#cbd5e1', cursor: 'pointer' }}>{tieneOct ? '1' : '0'}</td>
                    <td onClick={() => toggleCuotaMes(item, 'NOVIEMBRE', tieneNov)} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: tieneNov ? '#0284c7' : '#cbd5e1', cursor: 'pointer' }}>{tieneNov ? '1' : '0'}</td>
                    <td onClick={() => toggleCuotaMes(item, 'DICIEMBRE', tieneDic)} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: tieneDic ? '#0284c7' : '#cbd5e1', cursor: 'pointer' }}>{tieneDic ? '1' : '0'}</td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      {getStatusBadge(estatusCalculado)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {item.imagenReferencia ? (
                        <a
                          href={item.imagenReferencia}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            backgroundColor: 'rgba(2, 132, 199, 0.1)',
                            color: '#0284c7',
                            border: '1px solid rgba(2, 132, 199, 0.2)',
                            borderRadius: '0.375rem',
                            padding: '0.25rem 0.4rem',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button onClick={() => abrirModalEditar(item)} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Edit3 size={12} /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={15} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  <FileSpreadsheet size={28} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                  No se encontraron registros de ingreso para el mes seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear / Editar */}
      {modalMode && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', width: '90%', maxWidth: '450px', color: '#0f172a', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                {modalMode === 'create' ? 'Crear Nuevo Registro' : `Editar Titular (${formData.cedula})`}
              </h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalMode(null)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <label style={{ color: '#64748b', fontWeight: 600 }}>Nombre y Apellido</label>
                <input
                  type="text"
                  value={formData.nombreApellido || ''}
                  onChange={(e) => setFormData({ ...formData, nombreApellido: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.4rem', borderRadius: '0.375rem', marginTop: '0.2rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ color: '#64748b', fontWeight: 600 }}>Cédula</label>
                <input
                  type="text"
                  value={formData.cedula || ''}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.4rem', borderRadius: '0.375rem', marginTop: '0.2rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ color: '#64748b', fontWeight: 600 }}>Teléfono (NUMERO)</label>
                <input
                  type="text"
                  value={formData.NUMERO || ''}
                  onChange={(e) => setFormData({ ...formData, NUMERO: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.4rem', borderRadius: '0.375rem', marginTop: '0.2rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ color: '#64748b', fontWeight: 600 }}>Banco</label>
                <select
                  value={formData.banco || 'BANCO PLAZA'}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.4rem', borderRadius: '0.375rem', marginTop: '0.2rem', boxSizing: 'border-box' }}
                >
                  <option value="BANCO PLAZA">BANCO PLAZA</option>
                  <option value="BANESCO">BANESCO</option>
                </select>
              </div>

              <div>
                <label style={{ color: '#64748b', fontWeight: 600 }}>Mes de Origen</label>
                <select
                  value={formData.mes || 'JULIO'}
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.4rem', borderRadius: '0.375rem', marginTop: '0.2rem', boxSizing: 'border-box' }}
                >
                  {MESES.filter(m => m !== 'TODOS').map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: '#64748b', fontWeight: 600 }}>Cuota ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.uds || 5.99}
                  onChange={(e) => setFormData({ ...formData, uds: parseFloat(e.target.value) || 5.99 })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.4rem', borderRadius: '0.375rem', marginTop: '0.2rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button onClick={() => setModalMode(null)} style={{ backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={guardarRegistroModal} style={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Check size={14} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};