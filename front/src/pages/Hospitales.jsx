import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './userContext';
import {usetheme} from './themeContext'

import '../styles/Hospital.css';

const Hospitales = () => {

  const redisVenezuela = [
    { nombre: 'REDI Capital', estados: ['Miranda', 'Vargas', 'Distrito Capital'] },
    { nombre: 'REDI Occidental', estados: ['Zulia', 'Falcón', 'Lara'] },
    { nombre: 'REDI Los Andes', estados: ['Mérida', 'Táchira', 'Trujillo'] },
    { nombre: 'REDI Central', estados: ['Aragua', 'Carabobo', 'Yaracuy'] },
    { nombre: 'REDI Los Llanos', estados: ['Apure', 'Barinas', 'Cojedes', 'Guárico', 'Portuguesa'] },
    { nombre: 'REDI Guayana', estados: ['Amazonas', 'Bolívar', 'Delta Amacuro'] },
    { nombre: 'REDI Oriental', estados: ['Anzoátegui', 'Monagas', 'Sucre'] },
    { nombre: 'REDI Marítima e Insular', estados: ['Nueva Esparta', 'Espacios marinos y submarinos de Venezuela'] },
  ];

  const { user } = useUser();
  const{theme} = usetheme();
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [hospitales, setHospitales] = useState([]);
  const [hospitalesFiltrados, setHospitalesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null); // Nuevo estado para ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getData', {
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
    return <h1>Cargando...</h1>;
  }

  const handleDeleteHospital = (hospital) => {
    setHospitalIdToDelete(hospital.id);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/eliminarHospital/${hospitalIdToDelete}`, {
        withCredentials: true,
      });
      // Actualiza la lista de hospitales después de eliminar
      setHospitales(hospitales.filter(h => h.id !== hospitalIdToDelete));
      setHospitalesFiltrados(hospitalesFiltrados.filter(h => h.id !== hospitalIdToDelete));
    } catch (err) {
      console.log(err);
    } finally {
      setHospitalIdToDelete(null); // Reinicia el ID
      setShowConfirmDialog(false)
    }
  };

  
  return (
    <div className={`container ${theme ? 'dark-theme' : 'light-theme'}`}>
      <h1>Hospitales</h1>

      <label>Filtrar</label>
      <input 
        className={`form-control form-control-lg ${theme ? 'input-dark' : 'input-light'}`} 
        type="text" 
        placeholder='filtrar' 
        onChange={(event) => {
          const value = event.target.value;
          const h = hospitales.filter((hospital) =>
            hospital.nombre.toLowerCase().includes(value.toLowerCase()) ||
            hospital.redi == value ||
            redisVenezuela[hospital.redi].nombre.toLowerCase().includes(value)  ||
            hospital.estado_ciudad.toLowerCase().includes(value.toLowerCase())
          );
          setHospitalesFiltrados(h);
        }} 
      />

      <table className={`table table-striped ${theme ? 'table-dark' : 'table-light'}`}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Redi</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {hospitalesFiltrados.map((hospital) => (
            <tr key={hospital.id}>
              <td><i>{hospital.nombre}</i></td>
              <td><i>{hospital.estado_ciudad}</i></td>
              <td><i>{hospital.redi} — {redisVenezuela[hospital.redi-1].nombre}</i></td> 
              <td>
                {user && (hospital.redi == user.redi || user.tipoAcceso === 3) ? (
                  <button
                    className={`btn btn-success btn-sm ${theme ? 'btn-dark' : 'btn-light'}`}
                    onClick={() => navigate(`/addEquipos/${hospital.nombre}`)}
                  >
                    Añadir equipos
                  </button>
                ) : null}
                {user && (hospital.redi == user.redi || user.tipoAcceso === 3) ? (
                  <button
                    className={`btn btn-success btn-sm ${theme ? 'btn-dark' : 'btn-light'}`}
                    onClick={() => navigate(`/addReportes/${hospital.nombre}`)}
                  >
                    Añadir Reporte
                  </button>
                ) : null}

                <button
                  className={`btn btn-sm ${theme ? 'btn-dark' : 'btn-info'}`}
                  onClick={() => navigate(`/EquiposPorHospital/${hospital.nombre}`)}
                >
                  Ver equipos
                </button>

                {user && user.tipoAcceso === 3 ? (
                  <button
                    className={`btn btn-danger btn-sm ${theme ? 'btn-dark' : 'btn-light'}`}
                    onClick={() => handleDeleteHospital(hospital)}
                  >
                    Eliminar Hospital
                  </button>
                ) : null}
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
  );

};

export default Hospitales;








 