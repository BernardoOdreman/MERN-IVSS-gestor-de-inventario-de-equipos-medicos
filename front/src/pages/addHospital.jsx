import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './userContext';
import { redisVenezuela } from '../components/tableFunctions';
import { ENDPOINT } from '../../env';

const HospitalForm = () => {
 
  const [estado, setEstado] = useState("");
  const estadosVenezuela = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo',
    'Cojedes', 'Delta Amacuro', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda',
    'Monagas', 'a Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo',
    'Yaracuy', 'Zulia', 'Distrito Capital', 'Dependencias Federales',
  ];    

  
  const { user } = useUser();

  const [hospital, setHospital] = useState({
    nombre: '', estado_ciudad: '', municipio_zona: '', tipo: '', servicios_requeridos: '',
    nombre_director: '', telefono_director: '', email_director: '', nombre_tecnico_encargado: '',
    telefono_tecnico_encargado: '', email_tecnico_encargado: '', observaciones: '', redi: ''
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post(`${ENDPOINT}/insertHospital`, hospital)
      .then((response) => {
        console.log("response", response);
        alert(`El centro ${hospital.nombre} ha sido registrado con éxito`);
        setHospital({
          nombre: '', estado_ciudad: '', municipio_zona: '', tipo: '', servicios_requeridos: '',
          nombre_director: '', telefono_director: '', email_director: '', nombre_tecnico_encargado: '',
          telefono_tecnico_encargado: '', email_tecnico_encargado: '', observaciones: '', redi: ''
        });
      })
      .catch((error) => {
        console.error(error);
        alert('Error creando el hospital!');
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'estado_ciudad') {
      // Actualizamos el estado primero
      setEstado(value);

      // Buscar el índice de la REDI correspondiente al estado
      let rediIndex = -1;
      for (let i = 0; i < redisVenezuela.length; i++) {
        if (redisVenezuela[i].estados.includes(value)) {
          rediIndex = i + 1; // Asignamos el índice de REDI (1 basado)
          break;
        }
      }

      // Actualizamos el estado en el formulario junto con el redi calculado
      setHospital(prevHospital => ({
        ...prevHospital,
        [name]: value,
        redi: rediIndex,  // Asignamos el índice de REDI
      }));
    } else {
      // Para otros campos, simplemente actualizamos el estado
      setHospital(prevHospital => ({
        ...prevHospital,
        [name]: value
      }));
    }
  };

  return (
    <>
      {user && user.tipoAcceso > 2 ? (
        <div className="container">
          <h1 className="text-center">Registrar nuevo hospital</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={hospital.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <select
                className="form-control"
                name="estado_ciudad"
                value={hospital.estado_ciudad}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un estado</option>
                {estadosVenezuela.map((estado, index) => (
                  <option key={index} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Municipio/Zona:</label>
              <input
                type="text"
                className="form-control"
                name="municipio_zona"
                value={hospital.municipio_zona}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Redi:</label>
              <input
                type="text"
                className="form-control"
                name="redi"
                value={hospital.redi !== '' && hospital.redi > 0 ? 
                  `${hospital.redi} - ${redisVenezuela[hospital.redi - 1].nombre} - ${redisVenezuela[hospital.redi - 1].estados.join(", ")}` : 
                  ''}
                onChange={handleChange}
                required
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Tipo:</label>
              <input
                type="text"
                className="form-control"
                name="tipo"
                value={hospital.tipo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Servicios Requeridos:</label>
              <textarea
                className="form-control"
                name="servicios_requeridos"
                value={hospital.servicios_requeridos}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Nombre Director:</label>
              <input
                type="text"
                className="form-control"
                name="nombre_director"
                value={hospital.nombre_director}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono Director:</label>
              <input
                type="text"
                className="form-control"
                name="telefono_director"
                value={hospital.telefono_director}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Director:</label>
              <input
                type="email"
                className="form-control"
                name="email_director"
                value={hospital.email_director}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Nombre Técnico Encargado:</label>
              <input
                type="text"
                className="form-control"
                name="nombre_tecnico_encargado"
                value={hospital.nombre_tecnico_encargado}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono Técnico Encargado:</label>
              <input
                type="text"
                className="form-control"
                name="telefono_tecnico_encargado"
                value={hospital.telefono_tecnico_encargado}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Técnico Encargado:</label>
              <input
                type="email"
                className="form-control"
                name="email_tecnico_encargado"
                value={hospital.email_tecnico_encargado}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Observaciones:</label>
              <textarea
                className="form-control"
                name="observaciones"
                value={hospital.observaciones}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">Enviar</button>
          </form>
        </div>
      ) : (
        <p className="h1">Cargando...</p>
      )}
    </>
  );
};

export default HospitalForm;
