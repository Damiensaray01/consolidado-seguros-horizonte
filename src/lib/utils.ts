import { Asegurado } from '../types';

export const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatVES = (amount: number) => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
  }).format(amount);
};

export const calcularStatusPago = (cuotasPagadas: number, emisiones: number): string => {
  const pendientes = emisiones - cuotasPagadas;
  if (pendientes <= 0) return 'Solvente';
  return `Debe ${pendientes} cuota(s)`;
};