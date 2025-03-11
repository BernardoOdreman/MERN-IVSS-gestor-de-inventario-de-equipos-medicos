import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './userContext';
import { usetheme } from './themeContext';
import { ENDPOINT } from '../../env';
import { redisVenezuela } from '../components/tableFunctions';
import '../styles/Hospital.css';

const Hospitales = () => {


  const { user } = useUser();
  const { theme } = usetheme();
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [hospitales, setHospitales] = useState([]);
  const [hospitalesFiltrados, setHospitalesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null);
  const [orden, setOrden] = useState({
    columna: '', // Columna por la que se ordena
    direccion: 'asc', // Dirección de la ordenación
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${ENDPOINT}/getData`, {
          withCredentials: true,
        });
        setHospitales(response.data);
        setHospitalesFiltrados(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <h1 className={theme ? 'text-light' : ''} >Cargando...</h1>;
  }

  // Función para manejar el clic en los encabezados de columna
  const handleSort = (columna) => {
    const nuevaDireccion =
      orden.columna === columna && orden.direccion === 'asc' ? 'desc' : 'asc'; // Alternar dirección

    setOrden({
      columna,
      direccion: nuevaDireccion,
    });
  };

  // Función para ordenar los hospitales según la columna y dirección seleccionada
  const ordenarHospitales = (hospitales) => {
    const { columna, direccion } = orden;

    if (!columna) return hospitales; // Si no se ha seleccionado columna, no ordenar

    const hospitalesOrdenados = [...hospitales];
    hospitalesOrdenados.sort((a, b) => {
      let valorA = a[columna];
      let valorB = b[columna];

      // Si la columna es "redi", utilizamos el nombre del redi como criterio
      if (columna === 'redi') {
        valorA = redisVenezuela[a.redi - 1].nombre;
        valorB = redisVenezuela[b.redi - 1].nombre;
      }

      // Si los valores son strings, comparamos alfabéticamente
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (direccion === 'asc') {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });

    return hospitalesOrdenados;
  };

  // Ordenar los hospitales según el estado actual
  const hospitalesOrdenados = ordenarHospitales(hospitalesFiltrados);

  const handleDeleteHospital = (hospital) => {
    setHospitalIdToDelete(hospital.id);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${ENDPOINT}/eliminarHospital/${hospitalIdToDelete}`, {
        withCredentials: true,
      });
      setHospitales(hospitales.filter(h => h.id !== hospitalIdToDelete));
      setHospitalesFiltrados(hospitalesFiltrados.filter(h => h.id !== hospitalIdToDelete));
    } catch (err) {
      console.log(err);
    } finally {
      setHospitalIdToDelete(null);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className={`container ${theme ? 'dark-theme' : 'light-theme'}`}>

        <h1>Hospitales</h1>


        <label>Filtrar</label>
        <input
          className={`form-control ${theme ? 'input-dark' : 'input-light'}`}
          type="text"
          placeholder="filtrar"
          onChange={(event) => {
            const value = event.target.value;
            const h = hospitales.filter((hospital) =>
              hospital.nombre.toLowerCase().includes(value.toLowerCase()) ||
              hospital.redi == value ||
              redisVenezuela[hospital.redi]?.nombre.toLowerCase().includes(value) ||
              hospital.estado_ciudad.toLowerCase().includes(value.toLowerCase())
            );
            setHospitalesFiltrados(h);
          }}
        />

        <table className={`table table-striped ${theme ? 'table-dark' : 'table-light'}`}>
          <thead>
            <tr>
              <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer' }}>
                Nombre {orden.columna === 'nombre' ? (orden.direccion === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('estado_ciudad')} style={{ cursor: 'pointer' }}>
                Estado {orden.columna === 'estado_ciudad' ? (orden.direccion === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('redi')} style={{ cursor: 'pointer' }}>
                Redi {orden.columna === 'redi' ? (orden.direccion === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {hospitalesOrdenados.map((hospital) => (
              <tr key={hospital.id}>
                <td><i>{hospital.nombre}</i></td>
                <td><i>{hospital.estado_ciudad}</i></td>
                <td><i>{hospital.redi} — {redisVenezuela[hospital.redi - 1].nombre}</i></td>
                <td>
                  <div className="action-icons">
                    <span
                      className="ver action-icon"
                      onClick={() => navigate(`/EquiposPorHospital/${hospital.nombre}`)}
                    >
                      <img width='30px' src='./ver.svg' alt='Ver equipos' title="Ver equipos" />
                    </span>

                    {/* Añadir Equipo */}
                    {user && (hospital.redi === user.redi || user.tipoAcceso === 3) && (
                      <span
                        className="mas action-icon"
                        onClick={() => navigate(`/addEquipos/${hospital.nombre}`)}
                      >
                        <img width='30px' src='./mas.svg' alt='Añadir Equipo' title="Añadir equipo" />
                      </span>
                    )}

                    {user && (hospital.redi === user.redi || user.tipoAcceso === 3) && (
                      <span
                        className="mas action-icon"
                        onClick={() => navigate(`/addReportes/${hospital.nombre}`)}
                      >
                        <img width='30px' src='./reportes.svg' alt='Añadir Reporte' title="Añadir reporte" />
                      </span>
                    )}

                    {/* Eliminar Hospital (solo Admin) */}
                    {user && user.tipoAcceso === 3 && (
                      <span
                        className="eliminar action-icon"
                        onClick={() => handleDeleteHospital(hospital)}
                      >
                        <img  width='30px' src='./eliminar.svg' alt='Eliminar Hospital' title="Eliminar hospital" />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showConfirmDialog && (
          <div
            className={`confirm-dialog ${theme ? 'confirm-dark' : 'confirm-light'}`}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: theme ? '#333' : '#fff',
                padding: '20px', borderRadius: '10px', boxShadow: '15px 15px 15px rgba(15, 0, 0, 0.2)',
              }}
            >
              <h2 style={{ color: theme ? '#fff' : '#000' }}>Confirmación de eliminación</h2>
              <b style={{ color: theme ? '#fff' : '#000' }}>¿Estás seguro de que deseas eliminar el hospital? Esto eliminará todos los datos asociados.</b>
              <input
                type="text"
                className={`form-control form-control-lg ${theme ? 'input-dark' : 'input-light'}`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Escribe eliminar para continuar"
              />
              <div className='d-flex justify-content-end'>
                <button
                  className={`btn btn-success btn-sm me-2 ${theme ? 'btn-dark' : 'btn-light'}`}
                  disabled={confirmText.toLowerCase() !== 'eliminar'}
                  onClick={handleConfirmDelete}
                >
                  Continuar
                </button>
                <button
                  className={`btn btn-secondary btn-sm ${theme ? 'btn-dark' : 'btn-light'}`}
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Hospitales;
