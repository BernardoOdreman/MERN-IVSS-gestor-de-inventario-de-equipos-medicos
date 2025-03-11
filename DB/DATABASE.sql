CREATE DATABASE IVSS;

use IVSS;
CREATE TABLE Hospital (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) UNIQUE NOT NULL,
  estado_ciudad VARCHAR(100) NOT NULL,
  municipio_zona VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  servicios_requeridos TEXT,
  nombre_director VARCHAR(100) NOT NULL,
  telefono_director VARCHAR(20) NOT NULL,
  email_director VARCHAR(100) NOT NULL,
  nombre_tecnico_encargado VARCHAR(100) NOT NULL,
  telefono_tecnico_encargado VARCHAR(20) NOT NULL,
  email_tecnico_encargado VARCHAR(100) NOT NULL,
  observaciones TEXT,
  redi int NOT NULL

);  sqlMessage: "Table 'IVSS.Imagenes' doesn't exist",
  sqlState: '42S02',
  index: 0,
  sql: '\n' +
    '      SELECT e.*, i.imagen\n' +
    '      FROM Equipos e\n' +
    '      JOIN Hospital h ON e.hospital_id = h.id\n' +
    '      LEFT JOIN Imagenes i ON e.serial = i.serial\n' +
    "      WHERE h.nombre = 'Miguel Perez Carreño'"
}




CREATE TABLE Usuarios(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    clave BLOB  NOT NULL,
    cedula INT UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tipoAcceso INT NOT NULL,
    redi int NOT NULL
);



	CREATE TABLE Equipos (
	  id INT PRIMARY KEY AUTO_INCREMENT,
	  nombre VARCHAR(255) NOT NULL,
	  marca VARCHAR(100),  
	  modelo VARCHAR(100),  
	  serial VARCHAR(100) UNIQUE ,       
	  estado VARCHAR(50) NOT NULL,
	  area VARCHAR(100) NOT NULL,
	  hospital_id INT,
	  FOREIGN KEY (hospital_id) REFERENCES Hospital(id),
	  fecha_ingreso DATE,
	  fecha_ultimo_mantenimiento DATE,
	  servicios_y_repuestos_requeridos TEXT,
	  observaciones TEXT
	);

	CREATE TABLE Reportes (
    id INT NOT NULL AUTO_INCREMENT,
    equipo_id INT DEFAULT NULL,
    Tecnicos VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    falla_reportada TEXT DEFAULT NULL,
    solucion TEXT DEFAULT NULL,
    PRIMARY KEY (id),
    KEY (equipo_id)
);

CREATE TABLE Imagenes (
  serial VARCHAR(50) PRIMARY KEY,
  imagen BLOB
);

INSERT INTO Usuarios (nombre, clave, cedula, email, tipoAcceso, redi) VALUES ("Bernardo Odreman", aes_encrypt("12345678", 'ivss'), 32627481, "odremanbernardo@gmail.com", 3, 0);

SELECT nombre, cast(AES_DECRYPT(clave, 'ivss') AS CHAR) FROM Usuarios WHERE  nombre = "Bernardo Odreman";

