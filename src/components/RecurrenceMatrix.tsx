import React from 'react';

interface RecurrenceMatrixProps {
  asegurados: any[];
  onSelectAsegurado: (item: any) => void;
}

export const RecurrenceMatrix: React.FC<RecurrenceMatrixProps> = ({ asegurados, onSelectAsegurado }) => {
  return (
    <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
            <th style={{ padding: '0.75rem 1rem' }}>Cédula</th>
            <th style={{ padding: '0.75rem 1rem' }}>Nombre / Asegurado</th>
            <th style={{ padding: '0.75rem 1rem' }}>Estatus</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asegurados.map((item, index) => {
            // Protección contra valores undefined o nulos usando || ''
            const cedula = item.cedula || item.CEDULA || '';
            const nombre = item.nombre || item.NOMBRES || 'Sin nombre';

            return (
              <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                  {cedula}
                </td>
                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                  {nombre}
                </td>
                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    backgroundColor: '#dcfce7', 
                    color: '#166534' 
                  }}>
                    {item.estatus || 'Activo'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => onSelectAsegurado(item)}
                    style={{ 
                      backgroundColor: '#f1f5f9', 
                      border: '1px solid #cbd5e1', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '0.25rem', 
                      cursor: 'pointer',
                      color: '#334155',
                      fontWeight: 500
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecurrenceMatrix;