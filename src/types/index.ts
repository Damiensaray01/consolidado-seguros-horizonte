export interface Asegurado {
  id?: string;
  fechaPago?: string;
  nombreApellido?: string;
  cedula?: string | number;
  telefono?: string;
  NUMERO?: string | number;
  uds?: number;
  banco?: string;
  mes?: string;
  estatus?: string;
  statusPago?: string;
  estatusCalculado?: string;
  mesInicial?: string;
  cuotasDebidas?: number;
  jul?: number | string;
  ago?: number | string;
  sep?: number | string;
  oct?: number | string;
  nov?: number | string;
  dic?: number | string;
  cuotaJulio?: number | string;
  cuotaAgosto?: number | string;
  cuotaSeptiembre?: number | string;
  cuotaOctubre?: number | string;
  cuotaNoviembre?: number | string;
  cuotaDiciembre?: number | string;
  imagenReferencia?: string;
}