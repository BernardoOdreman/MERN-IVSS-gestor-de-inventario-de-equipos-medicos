import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal'; // Importa el componente Modal
import { useUser } from './userContext';
import '../styles/equipos.css'

// Establecer el elemento de la aplicación para el modal
Modal.setAppElement('#root'); // Cambia '#root' si tu ID es diferente

const EquiposPorHospital = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const { user } = useUser();
  const { hospital } = useParams();
  const [equipos, setEquipos] = useState([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getEquipos/${hospital}`);
        setEquipos(response.data);
        setEquiposFiltrados(response.data);
        setLoading(false);
        console.log(response.data)
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEquipos();
  }, [hospital]);

  if (loading) return <p className='h1 '>Cargando...</p>;
  if (error) return <p className='h1 text-danger'>Error: {error}</p>;

  const handleCheckbox = (id) => {
    setEquiposSeleccionados((prevEquipos) => ({
      ...prevEquipos,
      [id]: !prevEquipos[id],
    }));
  };

  const handleEliminarEquipos = () => {
    const ids = Object.keys(equiposSeleccionados).filter((id) => equiposSeleccionados[id]);

    axios.post('http://localhost:3000/eliminarEquipos', ids, { withCredentials: true })
      .then(response => {

        // Filtrar los equipos eliminados localmente
        const nuevosEquipos = equipos.filter(equipo => !ids.includes(equipo.id.toString()));
        setEquipos(nuevosEquipos);
        setEquiposFiltrados(nuevosEquipos);
        setEquiposSeleccionados({});  // Limpiar los checkboxes seleccionados
      })
      .catch(error => {

        console.log("nope", error);
      });
  };


  const handleSeleccionarTodos = (event) => {
    const checked = event.target.checked;
    const nuevosSeleccionados = {};
    equiposFiltrados.forEach((equipo) => {
      nuevosSeleccionados[equipo.id] = checked;
    });
    setEquiposSeleccionados(nuevosSeleccionados);
  };

  const openModal = (equipo) => {
    setEquipoSeleccionado(equipo);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEquipoSeleccionado(null);
  };

  return (
    <div>
      <h2 className='h2 text-success'>{hospital}</h2>
      <div className='container-lg mt-4'>


        <input
          type="text"
          className='form-control form-control-lg'
          placeholder='filtar'
          onChange={(event) => {
            const value = event.target.value;
            const h = equipos.filter((equipo) => {
              const searchValue = value.toLowerCase();
              return (
                (equipo.nombre && equipo.nombre.toLowerCase().includes(searchValue)) ||
                (equipo.marca && equipo.marca.toLowerCase().includes(searchValue)) ||
                (equipo.modelo && equipo.modelo.toLowerCase().includes(searchValue)) ||
                (equipo.serial && equipo.serial.toLowerCase().includes(searchValue)) ||
                (equipo.area && equipo.area.toLowerCase().includes(searchValue)) ||
                (equipo.estado && equipo.estado.toLowerCase().includes(searchValue))
              );
            });
            setEquiposFiltrados(h);
          }}
        />

        {equiposFiltrados.length === 0 ? (
          <span className='text-danger h3'>No se encontraron equipos.</span>
        ) : (
          <div>
            {user && user.tipoAcceso > 1 && (
              <>
                <label className='btn'>
                  <input type="checkbox" onChange={handleSeleccionarTodos} />
                  Seleccionar todos
                </label>
                <button disabled={!Object.values(equiposSeleccionados).includes(true)} className='btn btn-danger' onClick={handleEliminarEquipos}>
                  Eliminar equipos seleccionados
                </button>
              </>
            )}


            <table className="table table-striped">
              <thead>
                <tr>
                  {user && user.tipoAcceso > 1 ? <th>Seleccionar</th> : null}
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Serial</th>
                  <th>Condicion/Status</th>
                  <th>Área</th>
                  <th>Fecha de Ingreso</th>
                  <th>Repuestos requeridos</th>
                  <th>Observaciones</th>
                  <th>Ver Imagen</th>
                </tr>
              </thead>
              <tbody>
                {equiposFiltrados.map((equipo) => (
                  <tr key={equipo.id}>
                    {user && user.tipoAcceso > 1 ? (
                      <td className='form-check'>
                        <input
                          type="checkbox"
                          checked={equiposSeleccionados[equipo.id] || false}
                          onChange={() => handleCheckbox(equipo.id)}
                        />
                      </td>
                    ) : null}
                    <td>{equipo.nombre}</td>
                    <td>{equipo.marca}</td>
                    <td>{equipo.modelo}</td>
                    <td>{equipo.serial}</td>
                    <td>{equipo.estado}</td>
                    <td>{equipo.area}</td>
                    <td>{new Date(equipo.fecha_ingreso).toLocaleDateString()}</td>

                    <td>{equipo.servicios_y_repuestos_requeridos}</td>
                    <td>{equipo.observaciones}</td>
                    <td>
                      {equipo.imagen && (
                        <button onClick={() => openModal(equipo)} className="btn btn-info">
                          Ver Imagen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal para ver imagen */}
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              contentLabel="Imagen del Equipo"
              style={{ content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)' } }}
            >
              {equipoSeleccionado && (
                <div>
                  <h3>{equipoSeleccionado.nombre}</h3>
                  <img
                    src={`data:image/webp;${equipoSeleccionado.imagen}`}
                    alt={equipoSeleccionado.nombre}
                    style={{ width: '100%', height: 'auto', maxWidth: '300px', maxHeight: '300px' }}
                  />


                  <p>Marca: {equipoSeleccionado.marca}</p>
                  <p>Modelo: {equipoSeleccionado.modelo}</p>
                  <p>Serial: {equipoSeleccionado.serial}</p>
                  <p>Estado: {equipoSeleccionado.estado}</p>
                  <button onClick={closeModal} className="btn btn-secondary">Cerrar</button>
                </div>
              )}
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquiposPorHospital;

