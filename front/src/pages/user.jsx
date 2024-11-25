import React, { useState } from 'react';
import { useUser } from './userContext';
import Modal from 'react-modal';
import axios from 'axios';
import { redisVenezuela } from '../components/tableFunctions';
import { NavLink } from 'react-router-dom';
import { usetheme } from './themeContext';
import { ENDPOINT } from '../../env';
import '../styles/equiposDataUser.css';


const User = () => {
  const { user } = useUser();
  const {theme} = usetheme();

  if (!user) {
    return <div className='container center'>
      <h1 className='h1 text-danger'> Ups! Error 401: Unauthorized </h1>
      <h2 className='h2' >  POR FAVOR  {'\u00A0'}
        <NavLink to='/login'>INICIAR SESSIÓN</NavLink>
        {'\u00A0'} {/*espacio en blanco*/}
        PARRA ACCEDER A ESTAR RUTA </h2>
    </div>
  }


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
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message

    // Validaciones
    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await axios.post(`${ENDPOINT}/actualizarUsuario`, formData);
      console.log(response.data);
      setModalIsOpen(false);
      // Opcionalmente, refresca los datos del usuario
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <>
      {user && (
        <div className={theme?'dark container text-center mt-5 '  :"container text-center mt-5"}>
          <h2 className='h2'>{user.nombre}</h2>
          
          {user.tipoAcceso === 3 && <h3 className='h3'>Administrador</h3>}
          <div className='container user-info'>
            <p>Cedula: {user.cedula}</p>
            <p>
              {redisVenezuela[user.redi].nombre}: {'\u00A0'}
              {redisVenezuela[user.redi].estados}
            </p>
            <p>Email: {user.email}</p>
            <button className="btn btn-primary" onClick={() => setModalIsOpen(true)}>
              Editar Datos
            </button>
          </div>

          <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} ariaHideApp={false} 
          className={theme?' modal  dark':"modal"}  >
            <h2 className='h1'>Editar Información</h2>

            <form   onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Cedula:</label>
                <input type="text" className="form-control" name="cedula" value={formData.cedula} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Contraseña Actual:</label>
                <input type="password" className="form-control" name="oldPassword" value={formData.oldPassword} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Nueva Contraseña:</label>
                <input type="password" className="form-control" name="newPassword" value={formData.newPassword} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Confirmar Nueva Contraseña:</label>
                <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
              </div>

              {error && <div className="alert alert-danger">{error}</div>} {/* Mensaje de error */}

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