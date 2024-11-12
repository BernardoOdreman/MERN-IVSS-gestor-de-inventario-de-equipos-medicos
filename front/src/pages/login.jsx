import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './userContext';
import { usetheme } from './themeContext';
import axios from 'axios';
 
const Login = () => {
  const HOST = import.meta.env.REACT_APP_HOST || 'http://localhost:3000';
  axios.defaults.withCredentials = true;
  const { user, setUser } = useUser();
  const { theme } = usetheme();  // Aquí obtenemos el valor del tema (false para claro, true para oscuro)
  const navigate = useNavigate(); 
  const [ci, setci] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post(`${HOST}/login`, { ci, password })
      .then((response) => {
        if (response.data) {
          setError(false);
          setUser(response.data.userData);
        } else {
          setError("Usuario o clave inválidos");
        }
      }).catch((error) => {
        setError('Error al iniciar sesión');
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    if (user) {
      navigate('/Hospitales');
    }
  }, [user]);

  return (
    <section 
      className={`vh-100 ${theme ? 'bg-dark' : 'bg-light'}`} 
      
    >
      <div className="container-fluid h-custom">
        <div className="row d-flex justify-content-center align-items-center h-100">
          {/* Columna de imagen */}
          <div className="col-md-9 col-lg-6 col-xl-5">
            <img
              src="/ivss.svg"
              className="img-fluid"
              alt="ivss.svg"
            />
          </div>

          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <form onSubmit={handleSubmit} className={`p-4 rounded shadow-sm ${theme ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
              <div className="form-outline mb-4">
                <div className="divider d-flex align-items-center my-4">
                  <p className={`lead fw-normal ${theme ? 'text-white' : ''}`}>Iniciar sesión</p>
                </div>
                <input
                  required
                  type="number"
                  min={1}
                  id="form3Example3"
                  className={`form-control form-control-lg ${theme ? 'bg-dark text-white' : ''}`}
                  placeholder="Ingrese su número de cédula"
                  value={ci}
                  onChange={(event) => setci(event.target.value)}
                />
                <label className={`form-label ${theme ? 'text-white' : ''}`} htmlFor="form3Example3">Número de cédula</label>
              </div>

              {/* Password Input */}
              <div className="form-outline mb-4">
                <input
                  required
                  type="password"
                  id="form3Example4"
                  className={`form-control form-control-lg ${theme ? 'bg-dark text-white' : ''}`}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <label className={`form-label ${theme ? 'text-white' : ''}`} htmlFor="form3Example4">Contraseña</label>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="d-grid gap-2 mt-4">
                <button type="submit" className={`btn ${theme ? 'btn-secondary' : 'btn-primary'} btn-lg`}>
                  Acceder
                </button>
              </div>

              <p
               onClick={
                ()=>{
                  navigate('/CambiarClave')
                }
              } className={`btn text-center mt-3 ${theme ? 'btn text-white' : ''}`}>
                <a className="small">¿No recuerda su contraseña?</a>                
              </p>

              
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
