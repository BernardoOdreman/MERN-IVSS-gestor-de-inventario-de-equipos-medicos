
import HospitalForm from './pages/addHospital'
import Hospitales from './pages/Hospitales';
import EquiposPorHospital from './pages/Equipos'
import Login from './pages/login'
import Navbar from './pages/navbar'
import { UserProvider } from './pages/userContext'
import { ThemeProvider } from './pages/themeContext';
import CrearUsuario from './pages/crearUsuario'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddEquipos from './pages/addEquipos'
import AddReportes from './pages/addReportes';
import Usuarios from './pages/eliminarUsuarios';
import FichasEquipos from './pages/verReportes';
import User from './pages/user';
import CambiarClave from './pages/recuperarclave';
import Buscador from './components/buscador';
import './styles/App.css'


const NotFound = () => <h2>Página no encontrada</h2>;
const App = () => {


  return (
    <div id='body' className=''>

      <Router>
        <UserProvider>
          <ThemeProvider> 
            <Navbar />
            <Buscador />

            <div
            >
              <Routes>
                <Route path="/addHospitales" element={<HospitalForm />} />
                <Route path='/Hospitales' element={<Hospitales />} />
                <Route path='/login' element={<Login />} />
                <Route path='CrearUsuario' element={<CrearUsuario />} />
                <Route path='/EquiposPorHospital/:hospital' element={<EquiposPorHospital />} />
                <Route path='/addEquipos/:hospital' element={< AddEquipos />} />
                <Route path='/addReportes/:hospital' element={<AddReportes />} />
                <Route path='/usuario/:usuario' element={<User />} />
                <Route path='/eliminarUsuarios' element={<Usuarios />} />
                <Route path='/Reportes' element={<FichasEquipos />} />
                <Route path='/CambiarClave' element={<CambiarClave />} />

                <Route path='*' element={<NotFound />} />
              </Routes>
            </div>
          </ThemeProvider>
        </UserProvider>
      </Router>

      <div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />

      </div>


      <div
        className="footer-container">
        <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-red">
          <div className="text-white mb-3 mb-md-0">
            Copyright © 2024. Todos los derechos reservados.
          </div>
          <div className="text-white mb-3 mb-md-0">
            IVSS ~ Tecnologia Medica
          </div>
          <div>
            <a href="#!" className="text-white me-4">
              <i className="fab fa-facebook-f">F</i>
            </a>
            <a href="#!" className="text-white me-4">
              <i className="fab fa-twitter">X</i>
            </a>
            <a href="#!" className="text-white me-4">
              <i className="fab fa-google">ig</i>
            </a>
            <a href="#!" className="text-white">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;