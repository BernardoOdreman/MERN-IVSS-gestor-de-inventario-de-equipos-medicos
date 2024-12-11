import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();


const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user:  process.env.DB_USER || 'root',
  password:  process.env.DB_PASSWORD || '0004',
  database: process.env.DB_DATABASE || 'IVSS'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

export function insertHospital(hospitalData) {
  const query = `INSERT INTO Hospital (
      nombre,estado_ciudad,municipio_zona,tipo,servicios_requeridos,nombre_director,
      telefono_director,email_director,nombre_tecnico_encargado,telefono_tecnico_encargado,
      email_tecnico_encargado,observaciones,redi) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  return new Promise((resolve, reject) => {
    db.query(query, [
      hospitalData.nombre,
      hospitalData.estado_ciudad,
      hospitalData.municipio_zona,
      hospitalData.tipo,
      hospitalData.servicios_requeridos,
      hospitalData.nombre_director,
      hospitalData.telefono_director,
      hospitalData.email_director,
      hospitalData.nombre_tecnico_encargado,
      hospitalData.telefono_tecnico_encargado,
      hospitalData.email_tecnico_encargado,
      hospitalData.observaciones,
      hospitalData.redi

    ], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
}

export function getHospitalId(nombre) {
  const query = `SELECT id FROM Hospital WHERE nombre = ?`;

  return new Promise((resolve, reject) => {
    db.query(query, [nombre], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(results[0].id);
        } else {
          resolve(null); // o puedes lanzar un error si no se encuentra el hospital
        }
      }
    });
  });
}

export function getEquipoBySerial(serial) {
  const query = `
    SELECT 
      e.nombre, e.marca, e.modelo, e.serial, e.estado, e.area, 
      e.fecha_ingreso, e.servicios_y_repuestos_requeridos, 
      e.observaciones, h.nombre AS hospital_nombre
    FROM 
      Equipo e
    INNER JOIN 
      Hospital h ON e.hospital_id = h.id
    WHERE 
      e.serial = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [serial], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(results[0]);
        } else {
          resolve(null); // or throw an error if not found
        }
      }
    });
  });
}
export function getHospitals() {
  const query = `SELECT * FROM Hospital`;

  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results); // Devuelve todos los resultados, no solo el primer elemento
      }
    });
  });
}


export function getEquiposPorHospital(nombreHospital) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, i.imagen
      FROM Equipos e
      JOIN Hospital h ON e.hospital_id = h.id
      LEFT JOIN Imagenes i ON e.serial = i.serial
      WHERE h.nombre = ?`;

    db.query(query, [nombreHospital], (error, results) => {
      if (error) {
        reject(error);
      } else {
        // Procesa los resultados, convirtiendo la imagen de blob a base64
        const equiposConImagen = results.map(equipo => ({
          ...equipo,
          imagen: equipo.imagen ? Buffer.from(equipo.imagen).toString() : null
        }));

        resolve(equiposConImagen); // Resuelve la promesa con los resultados procesados
      }
    });
  });
}


export function insertEquipo(equipoData) {
  const query = `
    INSERT INTO Equipos (
      nombre, marca, modelo, serial, estado, area, hospital_id, 
      fecha_ingreso, servicios_y_repuestos_requeridos, observaciones
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [
      equipoData.nombre,
      equipoData.marca,
      equipoData.modelo,
      equipoData.serial,
      equipoData.estado,
      equipoData.area,
      equipoData.hospital_id,
      equipoData.fecha_ingreso,
      equipoData.servicios_y_repuestos_requeridos,
      equipoData.observaciones
    ], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);  // Returns the ID of the inserted equipment
      }
    });
  });
}


// Elimina todos los equipos de un hospital y luego el propio hospital.
export function eliminarHospital(hospitalId) {
  const queryReportes = `DELETE FROM Reportes WHERE equipo_id IN (SELECT id FROM Equipos WHERE hospital_id = ${hospitalId})`;
  const queryImagenes = `DELETE FROM Imagenes WHERE serial IN (SELECT serial FROM Equipos WHERE hospital_id = ${hospitalId})`;
  const queryEquipos = `DELETE FROM Equipos WHERE hospital_id = ${hospitalId}`;
  const queryHospital = `DELETE FROM Hospital WHERE id = ${hospitalId}`;

  return new Promise((resolve, reject) => {
    // Primero eliminamos los reportes asociados a los equipos del hospital
    db.query(queryReportes, (err, results) => {
      if (err) {
        console.error("Error deleting from Reportes:", err);
        return reject(err);
      }

      // Luego eliminamos las imagenes asociadas a los equipos
      db.query(queryImagenes, (err, results) => {
        if (err) {
          console.error("Error deleting from Imagenes:", err);
          return reject(err);
        }

        // Después eliminamos los equipos
        db.query(queryEquipos, (err, results) => {
          if (err) {
            console.error("Error deleting from Equipos:", err);
            return reject(err);
          }

          // Finalmente eliminamos el hospital
          db.query(queryHospital, (err, results) => {
            if (err) {
              console.error("Error deleting from Hospital:", err);
              return reject(err);
            }

            resolve(results); // Devuelve los resultados de la eliminación del hospital
          });
        });
      });
    });
  });
}


export function login(cedula, password) {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT nombre, cedula,email, redi,tipoAcceso, CAST(AES_DECRYPT(clave, \'ivss\') AS CHAR) AS decrypted_password FROM Usuarios WHERE cedula = ?',
      [cedula],
      (error, results) => {
        if (error) {
          console.log(error);
          return reject(error);
        }

        if (results.length === 0) {
          return resolve(null); // Usuario no encontrado
        }

        const user = results[0];

        // Comparar la contraseña desencriptada con la proporcionada
        if (user.decrypted_password === password) {
          resolve(user); // Retorna los datos del usuario
        } else {
          resolve(null); // Contraseña incorrecta
        }
      }
    );
  });
}

export function getEmail(cedula) {

  return new Promise((resolve, reject) => {
    db.query(
      'SELECT nombre, email FROM Usuarios WHERE cedula = ?',
      [cedula],
      (error, results) => {
        if (error) {
          console.log(error);
          return reject(error);
        }

        if (results.length === 0) {
          return resolve(null); // Usuario no encontrado
        }
        resolve(results[0]);

      }
    );
  });
}


export function crearUsuario(userData) {
  const query = `INSERT INTO Usuarios (
      nombre, clave, cedula, email, tipoAcceso, redi) VALUES (?, AES_ENCRYPT(?, 'ivss'), ?, ?, ?, ?)`;

  return new Promise((resolve, reject) => {
    db.query(query, [
      userData.nombre,
      userData.clave, // Se cifrará aquí
      userData.cedula, // Se incluye cedula
      userData.email,
      userData.tipoAcceso,
      userData.redi
    ], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
}

export function cambiarClaveUsuario(cedula, nuevaClave) {
  const query = `UPDATE Usuarios 
                 SET clave = AES_ENCRYPT(?, 'ivss') 
                 WHERE cedula = ?`;

  return new Promise((resolve, reject) => {
    db.query(query, [nuevaClave, cedula], (err, results) => {
      if (err) {
        reject(err);
      } else {
        // Verifica si se actualizó alguna fila
        if (results.affectedRows > 0) {
          resolve(true); // Clave cambiada exitosamente
        } else {
          resolve(false); // No se encontró el usuario con la cédula proporcionada
        }
      }
    });
  });
}


export function actualizarUsuario(userData) {
  const { nombre, cedula, email, oldPassword, newPassword } = userData;

  // Base query with common fields
  let query = `
    UPDATE Usuarios 
    SET 
      nombre = ?, 
      cedula = ?, 
      email = ? 
  `;

  // Add password update conditionally
  const queryParams = [nombre, cedula, email];
  
  if (newPassword) {
    query += ', clave = AES_ENCRYPT(?, "ivss")';
    queryParams.push(newPassword); // Add the new password to the parameters
  }

  query += `
    WHERE cedula = ? AND AES_DECRYPT(clave, "ivss") = ?;
  `;

  // Add the WHERE parameters
  queryParams.push(cedula, oldPassword);

  return new Promise((resolve, reject) => {
    db.query(query, queryParams, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}



export function eliminarEquipos(ids) {
  // Asegúrate de que ids sea un array no vacío
  if (!Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('El array de IDs está vacío o no es válido.'));
  }

  // Convertimos el array de IDs en una cadena de signos de pregunta (?) para la consulta SQL
  const placeholders = ids.map(() => '?').join(', ');

  // Iniciar una transacción
  return new Promise((resolve, reject) => {
    db.beginTransaction(err => {
      if (err) return reject(err);

      // Primero, eliminamos los reportes asociados a los equipos
      const deleteReportesQuery = `
        DELETE FROM Reportes WHERE equipo_id IN (${placeholders})
      `;

      db.query(deleteReportesQuery, ids, (err) => {
        if (err) {
          return db.rollback(() => reject(err));  // Revertir la transacción si hay un error
        }

        // Luego, eliminamos las imágenes asociadas a los equipos
        const deleteImagesQuery = `
          DELETE FROM Imagenes WHERE serial IN (
            SELECT serial FROM Equipos WHERE id IN (${placeholders})
          )
        `;

        db.query(deleteImagesQuery, ids, (err) => {
          if (err) {
            return db.rollback(() => reject(err));  // Revertir la transacción si hay un error
          }

          // Finalmente, eliminamos los equipos
          const deleteEquiposQuery = `
            DELETE FROM Equipos WHERE id IN (${placeholders})
          `;

          db.query(deleteEquiposQuery, ids, (err, results) => {
            if (err) {
              return db.rollback(() => reject(err));  // Revertir si hay un error
            }

            db.commit(err => {
              if (err) {
                return db.rollback(() => reject(err));  // Revertir si hay un error al confirmar
              }
              resolve(results);  // Resolvemos con los resultados de la eliminación de los equipos
            });
          });
        });
      });
    });
  });
}





export function insertarEquiposConImagenes(equiposArray) {
  if(equiposArray.equipos===undefined) return('equiposArray is NULL')
  try {
    return new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) return reject(err);
        const insertEquipoQuery = `
                INSERT INTO Equipos (
                    nombre, marca, modelo, serial, estado, area, hospital_id, 
                    fecha_ingreso, servicios_y_repuestos_requeridos, observaciones
                ) VALUES ?
            `;

        const equiposValues = equiposArray.equipos.map(equipo => [
          equipo.nombre,
          equipo.marca,
          equipo.modelo,
          equipo.serial,
          equipo.estado,
          equipo.area,
          equiposArray.hospital_id,
          equipo.fecha_ingreso,
          equipo.servicios_y_repuestos_requeridos,
          equipo.observaciones
        ]);
        const imagenesValues = equiposArray.equipos.map(equipo => [
          equipo.imagenRecortada,
          equipo.serial
        ])


        db.query(insertEquipoQuery, [equiposValues], (err, results) => {
          if (err) {
            return db.rollback(() => reject(err));
          }


          if (imagenesValues.length > 0) {
            const insertImagenesQuery = `
                        INSERT INTO Imagenes (imagen,serial) VALUES ?
                    `;
            db.query(insertImagenesQuery, [imagenesValues], (err) => {
              if (err) {
                return db.rollback(() => reject(err));
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => reject(err));
                }
                resolve('Datos de equipos e imágenes insertados correctamente.');
              });
            });
          } else {
            // Si no hay imágenes, simplemente hacer commit
            db.commit((err) => {
              if (err) {
                return db.rollback(() => reject(err));
              }
              resolve('Datos de equipos insertados correctamente.');
            });
          }
        });
      });
    });
  } catch (err) {
    console.log(err)
    return(err)
  }


}







export function obtenerEquipos(parametro, valor) {
  return new Promise((resolve, reject) => {
    const query = `
          SELECT e.*, i.imagen FROM Equipos e LEFT JOIN Imagenes i ON e.serial = i.serial WHERE e.${parametro} = ?
      `;

    db.query(query, [valor], (err, results) => {
      if (err) {
        return reject(err);
      }

      // Agrupar imágenes por equipo
      const equipos = results.reduce((acc, row) => {
        const { id, nombre, marca, modelo, serial, estado, area, hospital_id, fecha_ingreso, servicios_y_repuestos_requeridos, observaciones, imagen } = row;

        // Verifica si el equipo ya está en el acumulador
        if (!acc[id]) {
          acc[id] = {
            id,
            nombre,
            marca,
            modelo,
            serial,
            estado,
            area,
            hospital_id,
            fecha_ingreso,
            servicios_y_repuestos_requeridos,
            observaciones,
            imagenes: []
          };
        }

        // Agrega la imagen si existe
        if (imagen) {
          acc[id].imagenes.push(imagen.toString('base64'));
        }

        return acc;
      }, {});

      resolve(Object.values(equipos));
    });
  });
}





// Función para obtener los usuarios
export function obtenerUsuarios() {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, nombre, cedula, email, tipoAcceso, redi FROM Usuarios WHERE tipoAcceso<>3', (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}

// Función para eliminar un usuario
export function eliminarUsuario(id) {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Usuarios WHERE id = ?', [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}








// Función para obtener equipos con su imagen usando Promesas y filtrando por término
export function obtenerEquiposConImagen(term) {
  return new Promise((resolve, reject) => {
    const query = `
            SELECT e.nombre AS equipo_nombre, 
            e.marca, 
            e.serial, 
            e.modelo,
            e.area, 
            e.estado, 
            i.serial, 
            h.nombre AS hospital_nombre
      FROM Equipos e
      LEFT JOIN Imagenes i ON e.serial = i.serial
      LEFT JOIN Hospital h ON e.hospital_id = h.id
      WHERE e.nombre LIKE ? 
        OR e.marca LIKE ? 
        OR e.area LIKE ? 
        OR e.estado LIKE ?

      `;

    // Se usa un arreglo para evitar SQL injection
    const values = [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`];

    db.query(query, values, (error, results) => {
      if (error) {
        console.error('Error al obtener los equipos:', error);
        return reject(error);
      }

      // Procesa los resultados, convirtiendo la imagen de blob a base64
      const equiposConImagen = results.map(equipo => ({
        nombre: equipo.equipo_nombre,
        marca: equipo.marca,
        serial: equipo.serial,
        modelo: equipo.modelo,
        area: equipo.area,
        estado: equipo.estado,
        hospital_nombre: equipo.hospital_nombre,
        imagen: equipo.imagen ? equipo.imagen.toString('base64') : null // Convierte a base64 si existe
      }));
      console.log(equiposConImagen)
      resolve(equiposConImagen);
    });
  });
}



export function addReportes(data) {
  return new Promise((resolve, reject) => {
    // Obtener el hospital ID antes de procesar los equipos
    getHospitalId(data.hospitalNombre)
      .then(hospital => {
        const equiposPromises = data.equipos.map(equipo => manejarEquipoYReporte(equipo, hospital));

        // Esperar a que todas las promesas se resuelvan
        return Promise.all(equiposPromises);
      })
      .then(results => {
        resolve({ message: 'Todos los equipos procesados exitosamente.', results });
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}
function manejarEquipoYReporte(data, hospital) {
  return new Promise((resolve, reject) => {
    const {
      nombre,
      marca,
      modelo,
      serial,
      estado,
      area,
      fecha,
      falla_reportada,
      solucion,
      serviciosRepuestos,
      observaciones,
      imagenRecortada,
      tecnicos
    } = data;

    // Verificar si el equipo existe
    const queryEquipo = `SELECT * FROM Equipos WHERE serial = ?`;

    db.query(queryEquipo, [serial], (err, results) => {
      if (err) return reject(err);

      // Si el equipo no existe, lo creamos
      if (results.length === 0) {
        const insertEquipoQuery = `
          INSERT INTO Equipos (nombre, marca, modelo, serial, estado, area, hospital_id,
          servicios_y_repuestos_requeridos, observaciones)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertEquipoQuery, [nombre, marca, modelo, serial, estado, area, hospital, serviciosRepuestos, observaciones], (err, equipoResult) => {
          if (err) return reject(err);
          const equipoId = equipoResult.insertId;
          manejarImagenYReporte(equipoId, serial, imagenRecortada, fecha, falla_reportada, solucion, tecnicos, resolve, reject);
        });
      } else {
        // Si el equipo existe, actualizamos
        const updateEquipoQuery = `
          UPDATE Equipos 
          SET nombre = ?, marca = ?, modelo = ?, estado = ?, area = ?, servicios_y_repuestos_requeridos = ?, observaciones = ?
          WHERE serial = ?
        `;

        db.query(updateEquipoQuery, [nombre, marca, modelo, estado, area, serviciosRepuestos, observaciones, serial], (err) => {
          if (err) return reject(err);
          const equipoId = results[0].id;
          manejarImagenYReporte(equipoId, serial, imagenRecortada, fecha, falla_reportada, solucion, tecnicos, resolve, reject);
        });
      }
    });
  });
}
function manejarImagenYReporte(equipoId, serial, imagenRecortada, fecha, falla_reportada, solucion, tecnicos, resolve, reject) {
  // Manejar la imagen
  const queryImagen = `SELECT * FROM Imagenes WHERE serial = ?`;

  db.query(queryImagen, [serial], (err, imagenResults) => {
    if (err) return reject(err);

    if (imagenResults.length === 0) {
      // Insertar imagen si no existe
      const insertImagenQuery = `
        INSERT INTO Imagenes (imagen, serial) VALUES (?, ?)
      `;
      db.query(insertImagenQuery, [imagenRecortada, serial], (err) => {
        if (err) return reject(err);
        agregarReporte(equipoId, fecha, falla_reportada, solucion, tecnicos, resolve, reject);
      });
    } else {
      // Actualizar imagen si ya existe
      const updateImagenQuery = `
        UPDATE Imagenes SET imagen = ? WHERE serial = ?
      `;
      db.query(updateImagenQuery, [imagenRecortada, serial], (err) => {
        if (err) return reject(err);
        agregarReporte(equipoId, fecha, falla_reportada, solucion, tecnicos, resolve, reject);
      });
    }
  });
}
function agregarReporte(equipoId, fecha, falla_reportada, solucion, tecnicos, resolve, reject) {
  // Si la fecha es null, asignar la fecha actual
  if (!fecha) {
    fecha = new Date(); // Obtener la fecha actual
  }

  const insertReporteQuery = `
    INSERT INTO Reportes (equipo_id, tecnicos, fecha, falla_reportada, solucion) VALUES (?, ?, ?, ?, ?)
  `;

  db.query(insertReporteQuery, [equipoId, tecnicos, fecha, falla_reportada, solucion], (err) => {
    if (err) return reject(err);
    resolve({ message: 'Proceso completado exitosamente.' });
  });
}

export function getReportes() {
  return new Promise((resolve, reject) => {
    // Consulta SQL para obtener los equipos, reportes e imágenes

    const query = `
          SELECT 
          e.id AS equipo_id, 
          e.nombre AS equipo_nombre, 
          e.marca AS equipo_marca, 
          e.modelo AS equipo_modelo, 
          e.serial AS equipo_serial, 
          e.estado AS equipo_estado, 
          e.servicios_y_repuestos_requeridos AS servicios_y_repuestos_requeridos, 
          e.observaciones AS observaciones, 
          r.id AS reporte_id, 
          r.Tecnicos, 
          r.fecha AS reporte_fecha, 
          r.falla_reportada, 
          r.solucion, 
          i.id AS imagen_id, 
          i.imagen 
      FROM Equipos e
      INNER JOIN Reportes r ON e.id = r.equipo_id  -- Cambié LEFT JOIN por INNER JOIN
      LEFT JOIN Imagenes i ON e.serial = i.serial;

    `;



    // Ejecuta la consulta
    db.query(query, (err, results) => {
      if (err) {
        reject('Error en la consulta: ' + err); // Rechazar la promesa en caso de error
      } else {
        // Convertir las imágenes a Base64
        const reportesConImagenes = results.map(reporte => {
          console.log(reporte)
          if (reporte.imagen) {
            // Convierte la imagen a de hexadecimal a blob 
            const base64Image = Buffer.from(reporte.imagen).toString();
            return {
              ...reporte,
              imagen: `${base64Image}` // Cambia el tipo MIME si es necesario
            };
          }
          // Si no hay imagen, devuelve el reporte sin cambios
          return reporte;
        });

        resolve(reportesConImagenes); // Resolver la promesa con los resultados procesados
      }
    });
  });
}
