import React, { useState } from 'react';
import axios from 'axios';
import { ENDPOINT } from '../../env';

const CrearUsuario = () => {

 



    const redisVenezuela = [
        { nombre: 'REDI Capital', estados: ['Miranda', 'Vargas', 'Distrito Capital'] },
        { nombre: 'REDI Occidental', estados: ['Zulia', 'Falcón', 'Lara'] },
        { nombre: 'REDI Los Andes', estados: ['Mérida', 'Táchira', 'Trujillo'] },
        { nombre: 'REDI Central', estados: ['Aragua', 'Carabobo', 'Yaracuy'] },
        { nombre: 'REDI Los Llanos', estados: ['Apure', 'Barinas', 'Cojedes', 'Guárico', 'Portuguesa'] },
        { nombre: 'REDI Guayana', estados: ['Amazonas', 'Bolívar', 'Delta Amacuro'] },
        { nombre: 'REDI Oriental', estados: ['Anzoátegui', 'Monagas', 'Sucre'] },
        { nombre: 'REDI Marítima e Insular', estados: ['Nueva Esparta', 'Espacios marinos y submarinos de Venezuela'] },
    ];

    const [formData, setFormData] = useState({
        nombre: '',
        clave: '',
        cedula: '',
        email: '',
        tipoAcceso: '',
        redi: ''
    });

    const [message, setMessage] = useState({ error: '', success: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("")

        try {
            const response = await axios.post(`${ENDPOINT}/crearUsuario`, formData);
            setMessage({ success: 'Usuario creado con éxito!', error: '' });
            alert('Usuario creado con éxito!')
            setFormData({
                nombre: '',
                clave: '',
                cedula: '',
                email: '',
                tipoAcceso: '',
                redi: ''
            });
        } catch (err) {
            setMessage({ error: 'Error al crear el usuario.', success: '' });
        }
    };

    return (
        <div className="container mt-5">
            <h2>Crear Usuario</h2>
            {message.error && <div className="alert alert-danger">{message.error}</div>}
            {message.success && <div className="alert alert-success">{message.success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="clave" className="form-label">Clave</label>
                    <input type="password" className="form-control" name="clave" value={formData.clave} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="cedula" className="form-label">Cédula</label>
                    <input type="number" className="form-control" name="cedula" value={formData.cedula} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="tipoAcceso" className="form-label">Tipo de Acceso</label>
                    <input type="number" className="form-control" name="tipoAcceso" value={formData.tipoAcceso} onChange={handleChange} required />
                </div>
                <div className="mb-3">

                    <label htmlFor="redi" className="form-label">Redi</label>
                    <select type="number" className="form-control" name="redi" value={formData.redi} 
                    onChange={handleChange} required>
                        <option value="">Seleccione un estado</option>
                        {redisVenezuela.map((redi, index) => (
                            <option key={index} value={index+1}>{` ${redi.nombre} - ${redi.estados}`}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">Crear Usuario</button>
            </form>
        </div>
    );
};

export default CrearUsuario;