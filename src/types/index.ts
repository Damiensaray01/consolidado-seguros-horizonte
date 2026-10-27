export interface Asegurado {
  id?: string;
  nombreApellido: string;
  cedula: string;
  telefono?: string;
  fechaPago: string;
  montoBs?: number;
  uds: number; // Forzado a number
  banco?: string;
  mes?: string;
  emisiones?: number;
  cuotaJulio?: number;
  cuotaAgosto?: number;
  cuotaSeptiembre?: number;
  cuotaOctubre?: number;
  cuotaNoviembre?: number;
  cuotaDiciembre?: number;
  statusPago?: string;
  referencia?: string;
  imagenReferencia?: string;
}