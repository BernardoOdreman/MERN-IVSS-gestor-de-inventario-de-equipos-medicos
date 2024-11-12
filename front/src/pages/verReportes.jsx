import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FichasEquipos = () => {
  const [reportes, setReportes] = useState([]); // Aquí almacenaremos los reportes
  const [loading, setLoading] = useState(true); // Estado para manejar el estado de carga
  const [error, setError] = useState(null); // Estado para manejar los errores

  // Método para obtener los reportes desde la API
  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getReportes');
        setReportes(response.data);
        console.log(response)
      } catch (error) {
        setError('Error al cargar los reportes');
      } finally {
        setLoading(false); // Actualiza el estado de carga
      }
    };

    fetchReportes();
  }, []); // El array vacío significa que este efecto solo se ejecutará una vez al montar el componente

  // Si los datos están cargando, mostramos un mensaje de carga
  if (loading) {
    return <div className="text-center">Cargando reportes...</div>;
  }

  // Si hubo un error, mostramos el mensaje de error
  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <div className="container my-4">
      <div className="row">
        {reportes.length === 0 ? (
          <div className="col-12 text-center">
            <p>No hay reportes disponibles.</p>
          </div>
        ) : (
          reportes.map((reporte) => (
            <div className="col-md-4 mb-4" key={reporte.reporte_id}>
              <div className="card">

                <img
                  src={`data:image/webp;${reporte.imagen}`}
                  className="card-img-top"
                  alt={`Imagen del reporte ${reporte.reporte_id}`}
                />

                <div className="card-body">

                  <h5 className="card-title">{reporte.equipo_nombre}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">Técnicos: {reporte.Tecnicos}</h6>

                  <p className="card-text">
                    <strong>Marca:</strong> {reporte.equipo_marca || 'Sin especificar'}
                  </p>


                  <p className="card-text">
                    <strong>Modelo:</strong> {reporte.equipo_modelo || 'Sin especificar'}
                  </p>


       
                  <p className="card-text">
                    <strong>Serial:</strong> {reporte.equipo_serial || 'Sin especificar'}
                  </p>

                  <p className="card-text">
                    <strong>Status:</strong> {reporte.equipo_estado || 'Sin especificar'}
                   </p>



                  <p className="card-text">
                    <strong>Fecha:</strong> {new Date(reporte.reporte_fecha).toLocaleDateString() || 'Sin especificar'}
                  </p>
                  <p className="card-text">
                    <strong>Falla Reportada:</strong> {reporte.falla_reportada || 'Sin especificar'}
                  </p>
                  <p className="card-text">
                    <strong>Solución:</strong> {reporte.solucion || 'Sin especificar'}
                  </p>

                  

                  <p className="card-text">
                    <strong>Servicios y Repuestos Requeridos:</strong> {reporte.servicios_y_repuestos_requeridos || 'Sin especificar'}
                  </p>

                  <p className="card-text">
                    <strong>Observaciones:</strong> {reporte.observaciones || 'Sin especificar'}
                  </p>



                  
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FichasEquipos;