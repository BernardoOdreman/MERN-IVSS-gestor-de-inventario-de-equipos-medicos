import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal'; // Importa el componente Modal
import { useUser } from './userContext';
 import { ENDPOINT } from '../../env';

// Establecer el elemento de la aplicación para el modal
Modal.setAppElement('#root'); // Cambia '#root' si tu ID es diferente

const EquiposPorHospital = () => {
  axios.defaults.withCredentials = true;
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
        const response = await axios.get(`${ENDPOINT}/getEquipos/${hospital}`);
        setEquipos(response.data);
        setEquiposFiltrados(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEquipos();
  }, [hospital]);

  if (loading) return <p className='h1 text-center'>Cargando...</p>;
  if (error) return <p className='h1 text-danger text-center'>Error: {error}</p>;

  const handleCheckbox = (id) => {
    setEquiposSeleccionados((prevEquipos) => ({
      ...prevEquipos,
      [id]: !prevEquipos[id],
    }));
  };

  const handleEliminarEquipos = () => {
    const ids = Object.keys(equiposSeleccionados).filter((id) => equiposSeleccionados[id]);

    axios.post(`${ENDPOINT}/eliminarEquipos`, ids, { withCredentials: true })
      .then(response => {
        const nuevosEquipos = equipos.filter(equipo => !ids.includes(equipo.id.toString()));
        setEquipos(nuevosEquipos);
        setEquiposFiltrados(nuevosEquipos);
        setEquiposSeleccionados({});  // Limpiar los checkboxes seleccionados
      })
      .catch(error => {
        console.log("Error al eliminar equipos", error);
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
    <div className="container-lg mt-4">
      <h1 className='h1 text-center '>  {hospital}</h1>

      <div className="row mb-4">
        <div className="col-md-8 offset-md-2">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Filtrar equipos"
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
        </div>
      </div>

      {equiposFiltrados.length === 0 ? (
        <span className="text-danger h3 d-block text-center">No se encontraron equipos.</span>
      ) : (
        <div>
          {user && user.tipoAcceso > 1 && (
            <div className="d-flex justify-content-between mb-4">
              <label className="btn">
                <input type="checkbox" onChange={handleSeleccionarTodos} />
                <span> Seleccionar todos </span>
              </label>
              <button
                disabled={!Object.values(equiposSeleccionados).includes(true)}
                className="btn btn-danger"
                onClick={handleEliminarEquipos}
              >
                Eliminar equipos seleccionados
              </button>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  {user && user.tipoAcceso > 1 ? <th className="align-middle">Seleccionar</th> : null}
                  <th className="align-middle">Nombre</th>
                  <th className="align-middle">Marca</th>
                  <th className="align-middle">Modelo</th>
                  <th className="align-middle">Serial</th>
                  <th className="align-middle">Condición/Status</th>
                  <th className="align-middle">Área</th>
                  <th className="align-middle">Fecha de Ingreso</th>
                  <th className="align-middle">Repuestos requeridos</th>
                  <th className="align-middle">Observaciones</th>
                  <th className="align-middle">Ver Imagen</th>
                </tr>
              </thead>
              <tbody>
                {equiposFiltrados.map((equipo) => (
                  <tr key={equipo.id}>
                    {user && user.tipoAcceso > 1 ? (
                      <td className="form-check align-middle">
                        <input
                          type="checkbox"
                          checked={equiposSeleccionados[equipo.id] || false}
                          onChange={() => handleCheckbox(equipo.id)}
                        />
                      </td>
                    ) : null}
                    <td className="align-middle">{equipo.nombre}</td>
                    <td className="align-middle">{equipo.marca}</td>
                    <td className="align-middle">{equipo.modelo}</td>
                    <td className="align-middle">{equipo.serial}</td>
                    <td className="align-middle">{equipo.estado}</td>
                    <td className="align-middle">{equipo.area}</td>
                    <td className="align-middle">{new Date(equipo.fecha_ingreso).toLocaleDateString()}</td>
                    <td className="align-middle">{equipo.servicios_y_repuestos_requeridos}</td>
                    <td className="align-middle">{equipo.observaciones}</td>
                    <td className="align-middle">
                      {equipo.imagen && (
                        <button onClick={() => openModal(equipo)} className="btn btn-sm btn-info">
                          <i className="fas fa-image"></i> Ver Imagen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal para ver imagen */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Imagen del Equipo"
            style={{
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '600px',
                width: '80%',
                padding: '20px',
              },
            }}
          >
            {equipoSeleccionado && (
              <div className="text-center">
                <h3>{equipoSeleccionado.nombre}</h3>
                <img
                  src={`data:image/webp;${equipoSeleccionado.imagen}`}
                  alt={equipoSeleccionado.nombre}
                  className="img-fluid mb-3"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
                <p><strong>Marca:</strong> {equipoSeleccionado.marca}</p>
                <p><strong>Modelo:</strong> {equipoSeleccionado.modelo}</p>
                <p><strong>Serial:</strong> {equipoSeleccionado.serial}</p>
                <p><strong>Estado:</strong> {equipoSeleccionado.estado}</p>
                <button onClick={closeModal} className="btn btn-secondary">Cerrar</button>
              </div>
            )}
          </Modal>
        </div>
      )}
    </div>
  );
};

export default EquiposPorHospital;
