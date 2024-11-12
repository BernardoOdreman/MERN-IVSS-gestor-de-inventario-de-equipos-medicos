import React, { useState } from 'react';
import axios from 'axios';

const CambiarClave = () => {
    axios.defaults.withCredentials = true;

    const [cedula, setCedula] = useState('');
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [nuevaClave, setNuevaClave] = useState('');
    const [confirmarClave, setConfirmarClave] = useState('');
    const [codigoRecuperacion, setCodigoRecuperacion] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Función para recuperar el usuario basado en la cédula
    const recuperarUsuario = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/recuperarUsuario/${cedula}`);
            setNombre(response.data.nombre);
            setCorreo(response.data.email);
            setMensajeError('');
        } catch (error) {
            setMensajeError('No se pudo recuperar el usuario. Verifica la cédula.');
        }
    };

    // Validación de la nueva clave
    const esClaveValida = nuevaClave.length >= 8;
    const lasClavesCoinciden = nuevaClave === confirmarClave;
    const isSubmitDisabled = !esClaveValida || !lasClavesCoinciden || !codigoRecuperacion;

    // Función para cambiar la clave del usuario
    const cambiarClave = async () => {
        if (isSubmitDisabled) return;

        setIsLoading(true);

        try {
            // Enviar los datos a la API, incluyendo el código de recuperación
            await axios.post('http://localhost:3000/cambiarClaveUsuario', {
                cedula,
                nuevaClave,
                codigoRecuperacion, // Se incluye el código de recuperación
            });

            alert('Contraseña cambiada con éxito');
            // Limpiar el formulario
            setCedula('');
            setNombre('');
            setCorreo('');
            setNuevaClave('');
            setConfirmarClave('');
            setCodigoRecuperacion('');
        } catch (error) {
            alert('Hubo un error al cambiar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card p-4" style={{ width: '400px' }}>
                <h2 className="text-center mb-4">Recuperar Usuario</h2>
                <div>
                    <div className="mb-3">
                        <label htmlFor="cedula" className="form-label">Cédula:</label>
                        <input
                            type="text"
                            id="cedula"
                            className="form-control"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn btn-primary w-100"
                        onClick={recuperarUsuario}
                        disabled={isLoading || cedula.length === 0}
                    >
                        {isLoading ? 'Cargando...' : 'Enviar'}
                    </button>
                </div>

                {nombre && (
                    <div className="mt-4">
                        <h3 className="text-center mb-3">{nombre}</h3>
                        <p className="text-center mb-4">Se le envio el codigo de recuperacion al correo:
                           <i className='a'> {correo} </i> 
                        </p>

                        <div className="mb-3">
                            <label htmlFor="nuevaClave" className="form-label">Nueva contraseña:</label>
                            <input
                                type="password"
                                id="nuevaClave"
                                className="form-control"
                                value={nuevaClave}
                                onChange={(e) => setNuevaClave(e.target.value)}
                                onBlur={() => {
                                    if (!esClaveValida) {
                                        setMensajeError('La contraseña debe tener al menos 8 caracteres.');
                                    }
                                }}
                            />
                            <p className="text-danger">{!esClaveValida ? mensajeError : ''}</p>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="confirmarClave" className="form-label">Confirmar nueva contraseña:</label>
                            <input
                                type="password"
                                id="confirmarClave"
                                className="form-control"
                                value={confirmarClave}
                                onChange={(e) => setConfirmarClave(e.target.value)}
                            />
                            <p className="text-danger">
                                {!lasClavesCoinciden ? 'Las contraseñas no coinciden.' : ''}
                            </p>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="codigoRecuperacion" className="form-label">Código de recuperación:</label>
                            <input
                                type="text"
                                id="codigoRecuperacion"
                                className="form-control"
                                value={codigoRecuperacion}
                                onChange={(e) => setCodigoRecuperacion(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn btn-success w-100"
                            onClick={cambiarClave}
                            disabled={isSubmitDisabled || isLoading}
                        >
                            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                )}

                {mensajeError && <p className="text-danger text-center mt-3">{mensajeError}</p>}
            </div>
        </div>
    );
};

export default CambiarClave;
