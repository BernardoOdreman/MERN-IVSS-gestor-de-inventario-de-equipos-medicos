import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useUser } from './userContext';
import { usetheme } from "./themeContext";
import Buscador from '../components/buscador';
import ReactSwitch from 'react-switch';
import '../styles/navbar.css'

function NavBar() {
  const { user, setUser } = useUser();
  const { theme, setTheme } = usetheme();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);  // Para el menú de usuario
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);  // Para el menú de gestionar usuarios

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/logout'); // Llama al endpoint de logout
      setUser(null);
      navigate('/Hospitales');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Manejo del estado del menú de usuario
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  // Manejo del estado del menú de gestionar usuarios
  const toggleAdminMenu = () => setAdminMenuOpen(!adminMenuOpen);

  /**
   * Si hay una cookie con el token del usuario, al recargar la página el estado del usuario se volverá a cargar
   */
  axios.defaults.withCredentials = true;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth', { withCredentials: true });
        setUser(response.data.user.user);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []); // El array vacío asegura que esto se ejecute solo una vez al montar el componente

  const Links = () => {
    if (!user) {
      return (
        <>
          <NavLink activeClassName="active" className='nav-item navbar-brand' to="/login">Iniciar sección</NavLink>
          <NavLink activeClassName="active" className='nav-itemnavbar-brand' to="/Hospitales">Ver Hospitales</NavLink>
          <NavLink activeClassName="active" className='nav-item navbar-brand' to="/Reportes">Ver Reportes</NavLink>
        </>
      );
    }

    const commonLinks = (
      <>
        <li className="nav-item">
          <NavLink activeClassName="active" className='navbar-brand' to="/addHospitales">Registrar Hospital</NavLink>
        </li>
        <li className="nav-item">
          <NavLink activeClassName="active" className='navbar-brand' to="/Hospitales">Ver Hospitales</NavLink>
        </li>
        <li>
          <NavLink activeClassName="active" className=' nav-item navbar-brand' to="/Reportes">Ver Reportes</NavLink>
        </li>

        <li className="nav-item dropdown">
          <NavLink
            activeClassName="active"
            to='#'
            className="navbar-brand dropdown-toggle"
            onClick={toggleUserMenu}  // Cambiamos para manejar el clic
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {user.nombre}
          </NavLink>

          <ul className={`dropdown-menu ${userMenuOpen ? "active" : ""}`}>
            <li>
              <NavLink activeClassName="active" className="dropdown-item" to={`/usuario/${user.nombre}`}>Editar</NavLink>
            </li>
            <li>
              <button className="dropdown-item" onClick={handleLogout}>Salir</button>
            </li>
          </ul>
        </li>
      </>
    );

    return (
      <>
        {commonLinks}
        {user.tipoAcceso === 3 && (
          <li className="nav-item dropdown">
            <NavLink
              activeClassName="active"
              className="navbar-brand dropdown-toggle"
              to="#"
              onClick={toggleAdminMenu}  // Manejar clic en el menú de administración
            >
              Gestionar Usuarios
            </NavLink>
            <ul className={`dropdown-menu ${adminMenuOpen ? "active" : ""}`}>
              <li>
                <NavLink activeClassName="active" className="dropdown-item" to="/CrearUsuario">Crear Usuario</NavLink>
              </li>
              <li>
                <NavLink activeClassName="active" className="dropdown-item" to="/eliminarUsuarios">Eliminar Usuario</NavLink>
              </li>
            </ul>
          </li>
        )}
      </>
    );
  };

  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);

  return (
    <>
      <nav className={theme ? 'bg-dark navbar navbar-expand-lg bg-body-tertiary' : ' navbar navbar-expand-lg bg-body-tertiary'}>
        <div className="nav-container">
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            {Links()}
          </ul>
          <div className="nav-icon" onClick={handleClick}>
            {click ? (
              <span className="icon">_-_</span>
            ) : (
              <span className="icon">{'</>'}</span>
            )}
          </div>
        </div>

        <ReactSwitch
          checked={theme}
          onChange={() => setTheme(!theme)}
          onColor="#11f"
          offColor="#ccc"
          onHandleColor="#00c7ff"
          offHandleColor="#aaa"
          height={20}
          width={40}
          handleDiameter={20}
        />

        {theme ? <span>Modo Oscuro</span> : <span>Modo Claro</span>}
        <Buscador />
      </nav>
    </>
  );
}

export default NavBar;
