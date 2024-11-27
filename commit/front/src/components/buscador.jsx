import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/input.css';
import { usetheme } from '../pages/themeContext';
import { ENDPOINT } from '../../env';

const Buscador = () => {
    const {theme} = usetheme();
    const [equipos, setEquipos] = useState(null);
    const [texto, setTexto] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Función para obtener los equipos
    const getEquipo = async (e) => {
        try {
            const response = await axios.post(`${ENDPOINT}/obtenerEquiposConImagen`, { e });
             
             const equiposData = response.data.map(equipo => ({
                nombre: equipo.nombre,
                marca: equipo.marca,
                modelo: equipo.modelo,
                serial: equipo.serial,
                area: equipo.area,
                estado: equipo.estado,
                hospital_nombre: equipo.hospital_nombre,  
            }));

            setEquipos(equiposData);
            console.log(equiposData)
            setIsOpen(true); // Abrir el panel al recibir los datos
        } catch (error) {
            console.error('Error al obtener el equipo:', error);
        }
    };

    // Cerrar el panel cuando se haga clic fuera de él
    const handleClickOutside = (event) => {
        if (panelRef.current && !panelRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className=" input-group mb-3">
                <input 
                    onChange={e => setTexto(e.target.value)} 
                    type="text" 
                    className="form-control" 
                    placeholder="Buscar Equipo" 
                     
                />
                <button 
                    disabled={texto === ''} 
                    onClick={() => getEquipo(texto)} 
                    className="btn btn-outline-primary" 
                    type="button" 
                    id="button-addon2"
                >
                    Buscar
                </button>
            </div>

            {isOpen && equipos && (
                <div ref={panelRef} className={theme?'panel bg-dark text-ligh':'panel'
                    } style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Serial</th>
                                <th>Área</th>
                                <th>Estado</th>
                                <th>Hospital</th> {/* Columna para el nombre del hospital */}
                            </tr>
                        </thead>
                        <tbody>
                            {equipos.map((equipo, index) => (
                                <tr key={index}>
                                    <td>{equipo.nombre}</td>
                                    <td>{equipo.marca}</td>
                                    <td>{equipo.modelo}</td>
                                    <td>{equipo.serial}</td>
                                    <td>{equipo.area}</td>
                                    <td>{equipo.estado}</td>
                                    <td>{equipo.hospital_nombre}</td> 
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <span>Total {equipos.length} elementos</span>
                </div>
            )}
        </>
    );
};

export default Buscador;
