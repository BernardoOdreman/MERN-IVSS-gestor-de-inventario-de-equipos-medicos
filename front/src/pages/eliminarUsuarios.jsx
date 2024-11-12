import React, { useState, useEffect } from 'react';
import axios from 'axios';
 
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [confirmacion, setConfirmacion] = useState('');

  useEffect(() => {
    // Obtener los usuarios cuando el componente se monta
    axios.get('http://localhost:3000/getUsuarios')
      .then(response => setUsuarios(response.data))
      .catch(error => console.error('Error al obtener usuarios', error));
  }, []);

  const eliminarUsuario = (id) => {
    axios.delete(`http://localhost:3000/EliminarUsuarios/${id}`)
      .then(() => {
        // Después de eliminar, actualizamos la lista de usuarios
        setUsuarios(usuarios.filter(usuario => usuario.id !== id));
        setShowModal(false);
      })
      .catch(error => console.error('Error al eliminar el usuario', error));
  };

  const abrirModal = (usuario) => {
    setUsuarioAEliminar(usuario);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setConfirmacion('');
  };

  const manejarEliminacion = () => {
    if (confirmacion.toLowerCase() === 'eliminar') {
      eliminarUsuario(usuarioAEliminar.id);
    } else {
      alert('Debe escribir "eliminar" para confirmar');
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">Usuarios</h2>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Email</th>
            <th>Tipo de Acceso</th>
            <th>Redi</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.cedula}</td>
              <td>{usuario.email}</td>
              <td>{usuario.tipoAcceso}</td>
              <td>{usuario.redi}</td>
              <td>
                <button className="btn btn-danger" onClick={() => abrirModal(usuario)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} aria-labelledby="modalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modalLabel">Advertencia</h5>
                <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Cerrar"></button>
              </div>
              <div className="modal-body">
                <p>Se eliminará solamente este usuario, NO los datos asociados a él.</p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Escriba 'eliminar' para confirmar"
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={manejarEliminacion}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
