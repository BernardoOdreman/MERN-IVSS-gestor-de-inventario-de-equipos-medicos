import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useUser } from './userContext';
import { usetheme } from "./themeContext";
import Buscador from '../components/buscador';
import ReactSwitch from 'react-switch';
import '../styles/navbar.css'
import { ENDPOINT } from '../../env';

function NavBar() {

  const toggleTheme = () => {
    const root = document.getElementById("body");
    

    if (root) {
      if (!theme) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };


  const { user, setUser } = useUser();
  const { theme, setTheme } = usetheme();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);  // Para el menú de usuario
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);  // Para el menú de gestionar usuarios

  const handleLogout = async () => {
    try {
      await axios.post(`${ENDPOINT}/logout`); // Llama al endpoint de logout
      setUser(null);
      navigate('/Hospitales');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /**
   * Si hay una cookie con el token del usuario, al recargar la página el estado del usuario se volverá a cargar
   */
  axios.defaults.withCredentials = true;
  useEffect(() => {
    setAdminMenuOpen(false)
    setUserMenuOpen(false)
    const fetchData = async () => {
      try {
        const response = await axios.get(`${ENDPOINT}/auth`, { withCredentials: true });
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
          <li className="nav-item">
            <NavLink activeClassName="active" className=' navbar-brand' to="/login">Iniciar sesión</NavLink>
          </li>

          <li className="nav-item">
            <NavLink activeClassName="active" className=' navbar-brand' to="/Hospitales">Ver Hospitales</NavLink>
          </li>

          <li className="nav-item">
            <NavLink activeClassName="active" className=' navbar-brand' to="/Reportes">Ver Reportes</NavLink>
          </li>

        </>
      );
    }

    const commonLinks = (
      <>
        <li className="nav-item">
          <NavLink activeClassName="active" className=' navbar-brand' to="/Hospitales">
            Ver Hospitales
          </NavLink>
        </li>

        <li className="nav-item ">
          <NavLink activeClassName="active" className='  navbar-brand' to="/Reportes">
            Ver Reportes
          </NavLink>
        </li>



        <li className={userMenuOpen ? 'nav-item dropdown dropUser ' : "nav-item dropdown"}>
          <NavLink
            activeClassName="active"
            to='#'
            className="navbar-brand dropdown-toggle"
            onClick={
              () => {
                setAdminMenuOpen(false)
                setUserMenuOpen(!userMenuOpen)
              }
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {user.nombre}
          </NavLink>

          <ul className={theme?' bg-dark dropdown-menu':`dropdown-menu`}>

            <li  ><NavLink activeClassName="" className={theme?' text-light dropdown-item':`dropdown-item`} to={`/usuario/${user.nombre}`}>Editar Datos</NavLink></li>
            <li><button className={theme?' text-light dropdown-item':`dropdown-item`} onClick={handleLogout}>Salir</button></li>

          </ul>

        </li>
      </>
    );

    return (
      <>
        {user.tipoAcceso === 3 && (
          <li className="nav-item">
            <NavLink activeClassName="active" className='  navbar-brand' to="/addHospitales">
              Registrar Hospital
            </NavLink>
          </li>

        )}

        {commonLinks}
        {user.tipoAcceso === 3 && (
          <>




            <li className={adminMenuOpen ? '"nav-item dropdown dropUser ' : "nav-item dropdown"}>
              <NavLink
                activeClassName="active"
                className="navbar-brand dropdown-toggle"
                to="#"
                onClick={(
                  () => {
                    setAdminMenuOpen(!adminMenuOpen)
                    setUserMenuOpen(false)
                  }
                )}
              >
                Gestionar Usuarios
              </NavLink>

              <ul className={theme?' bg-dark dropdown-menu':`dropdown-menu`}>
                <li>
                  <NavLink activeClassName="active" className={theme?' text-light dropdown-item':`dropdown-item`}   to="/CrearUsuario">Crear Usuario</NavLink>
                </li>
                <li>
                  <NavLink activeClassName="active" className={theme?' text-light dropdown-item':`dropdown-item`} to="/eliminarUsuarios">
                    Eliminar Usuario
                  </NavLink>
                </li>
              </ul>
            </li>

          </>

        )}
      </>
    );
  };

  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);

  return (
    <>
      <nav className={theme ? ' navbar navbar-expand-lg bg-body-tertiary' : ' navbar navbar-expand-lg bg-body-tertiary'}>
        <div className="nav-container">
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            {Links()}
          </ul>
          <div className="nav-icon" onClick={handleClick}>
            {click ? (
              <span className="icon">
                <img src="./hamburger-lg.svg" alt="Menu" />
              </span>
            ) : (
              <span className="icon">
                <img src="./hamburger-lg.svg" alt="Menu" />
              </span>
            )}
          </div>

          <div>
            <ReactSwitch
              checked={theme}
              onChange={() => {
                toggleTheme(),
                setTheme(!theme)
              }}
              onColor="#11f"
              offColor="#ccc"
              onHandleColor="#00c7ff"
              offHandleColor="#aaa"
              height={20}
              width={40}
              handleDiameter={20}
            />
            {'\u00A0'} 
            {theme ? <span className="text-light text-sm"   > Modo Oscuro</span> : <span  >Modo Claro</span>}
          </div>

        </div>
      </nav>

      


    </>
  );
}

export default NavBar;
