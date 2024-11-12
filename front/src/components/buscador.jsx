import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/input.css';

const Buscador = () => {
    const [equipos, setEquipos] = useState(null);
     const [texto, setTexto] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    const getEquipo = async (e) => {
        try {
            const response = await axios.post('http://localhost:3000/obtenerEquiposConImagen', { e });
            
            const equiposData = response.data.slice(0, 5).map(equipo => ({
                nombre: equipo.nombre,
                marca: equipo.marca,
                modelo: equipo.modelo,
                serial: equipo.serial,
                area: equipo.area,
                estado: equipo.estado,
            }));
            setEquipos(equiposData);

            setIsOpen(true); // Abre el panel al recibir la respuesta
        } catch (error) {
            console.error('Error al obtener el equipo:', error);
        }
    };

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
            <div className="input-group mb-3">
                <input 
                    onChange={e => setTexto(e.target.value)} 
                    type="text" 
                    className="" 
                    placeholder="Buscar Equipo" 
                    aria-label="Recipient's username" 
                    aria-describedby="button-addon2" 
                />
                <button 
                    disabled={texto===''}
                    onClick={() => getEquipo(texto)} 
                    className="btn btn-outline-secondary" 
                    type="button" 
                    id="button-addon2"
                >
                    Buscar
                </button>
            </div>

            {isOpen && equipos && (
                <div ref={panelRef} className="panel">
                    
                      <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Serial</th>
                                <th>Área</th>
                                <th>Estado</th>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {equipos.length < 5 ? (
                        <span>Ver {equipos.length} elementos</span>
                    ) : null}   
                </div>
            )}
        </>
    );
};

export default Buscador;
