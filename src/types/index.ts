export interface Asegurado {
  id?: string;
  NUMERO?: string | number;
  nombreApellido: string;
  cedula: string;
  telefono?: string;
  fechaPago: string;
  montoBs?: number;
  uds: number;
  banco?: string;
  referencia?: string;
  observaciones?: string;
  estatus?: string;
  statusPago?: string;
  mes?: string;
  imagenReferencia?: string;
  mesesPagados?: Set<string>;
  montoCuotaReal?: number;
  primerMesPagado?: string;
  fechasPagos?: string[];
  [key: `mes_${string}`]: any;
}

export interface PaymentRecord {
  id?: string;
  NUMERO?: string | number;
  cedula: string;
  nombreApellido: string;
  statusPago?: string;
  mes?: string;
  imagenReferencia?: string;
  [key: string]: any;
}
