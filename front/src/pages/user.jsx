import React, { useState } from 'react';
import { useUser } from './userContext';
import Modal from 'react-modal';
import axios from 'axios';

const User = () => {
  const { user } = useUser();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    cedula: user?.cedula || '',
    redi: user?.redi || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/user/update', formData);
      console.log(response.data);
      setModalIsOpen(false);
      // Optionally, refresh user data
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <>
      {user && (
        <div className="container text-center mt-5">
          <h2 className='h2'>{user.nombre}</h2>
          {user.tipoAcceso === 3 ? (
            <h3 className='h3'>Administrador</h3>
          ) : null}
          <div className='container'>
            <p>Cedula: {user.cedula}</p>
            <p>Redi: {user.redi}</p>
            <p>Email: {user.email}</p>
            <button className="btn btn-primary" onClick={() => setModalIsOpen(true)}>
              Editar Datos
            </button>
          </div>

          <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} ariaHideApp={false}>
            <h2>Editar Información</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Nombre:</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Cedula:</label>
                <input type="text" name="cedula" value={formData.cedula} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Redi:</label>
                <input type="text" name="redi" value={formData.redi} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Contraseña Actual:</label>
                <input type="password" name="oldPassword" value={formData.oldPassword} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Nueva Contraseña:</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Confirmar Nueva Contraseña:</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="btn btn-success">Guardar Cambios</button>
              <button type="button" className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>Cancelar</button>
            </form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default User;