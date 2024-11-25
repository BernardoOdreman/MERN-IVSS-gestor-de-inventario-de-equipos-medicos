import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { HotTable } from '@handsontable/react';
import axios from 'axios';
import { htmlToPDF } from '../components/tableFunctions';
import Papa from 'papaparse'
import 'jspdf-autotable';
import 'handsontable/dist/handsontable.full.css'; // Estilos de Handsontable
import { usetheme } from "./themeContext";
import { useUser } from './userContext';
import { ENDPOINT } from '../../env';
import "../styles/AddEquipos.css";




const AddEquipos = () => {

  const { user } = useUser();



  if (!user) {
    return <div className='container center'>
      <h1 className='h1 text-danger'> Ups! Error 401: Unauthorized </h1>
      <h2 className='h2' >  POR FAVOR  {'\u00A0'}
        <NavLink to='/login'>INICIAR SESSIÓN</NavLink>
        {'\u00A0'} {/*espacio en blanco*/}
        PARRA ACCEDER A ESTAR RUTA </h2>
    </div>
  }



  // Función para validar si la fecha está en formato YYMMDD
  function validateDate(dateString) {
    console.log(dateString)
    const regex = /^(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])$/;

    // Verificar si el formato es correcto
    if (!regex.test(dateString)) {
      return false;
    }

    // Obtener los componentes de la fecha
    const parts = dateString.split(/[-/]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // Validar la fecha real
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }


  const { theme } = usetheme();
  const { hospital } = useParams();
  const tableRef = useRef();
  const [data, setData] = useState([{
    nombre: '',
    marca: '',
    modelo: '',
    serial: '',
    estado: '',
    area: '',
    fechaIngreso: '',
    serviciosRepuestos: '',
    observaciones: '',
    imagenRecortada: '', // Para mostrar la imagen recortada
    imagenOriginal: '',   // Para almacenar la URL de la imagen original
  }]);

  const [showExportModal, setShowExportModal] = useState(false);

  const handleImageUpload = (row, file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo debe ser menor de 5 MB');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Mostrar recorte en la tabla
      canvas.width = 1000; // Ancho de la imagen recortada
      canvas.height = 1000; // Alto de la imagen recortada
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Almacenar la imagen original
      const originalBlob = new Blob([file], { type: file.type });
      const originalUrl = URL.createObjectURL(originalBlob);
      const newData = [...data];
      newData[row].imagenRecortada = canvas.toDataURL('image/webp');
      newData[row].imagenOriginal = originalUrl; // Almacena la URL original
      setData(newData);
    };

    img.src = imageUrl;
  };

  const columns = [
    {
      data: 'nombre', title: 'Nombre', width: 100, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'marca', title: 'Marca', width: 100, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'modelo', title: 'Modelo', width: 100, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'serial', title: 'Serial', width: 80, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'estado', title: 'Estado', width: 100, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        ``
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'area', title: 'Área', width: 100, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'fechaIngreso', title: 'Fecha de Ingreso', width: 100, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'serviciosRepuestos', title: 'Servicios o Repuestos Requeridos', width: 200, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'observaciones', title: 'Observaciones', width: 100, renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'imagenRecortada',
      title: 'Imagen',

      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.innerHTML = '';

        td.style.backgroundColor = theme ? '#444' : '000';
        td.style.color = theme ? '#fff' : '000';
        td.innerText = value || '';  // Mostrar el valor en la celda

        const button = document.createElement('button');
        button.textContent = 'Cargar Imagen';
        button.className = 'btn-primary btn-sm';

        button.onclick = () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';

          input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
              handleImageUpload(row, file);
            }
          };

          input.click();
        };

        td.appendChild(button);

        if (value) {
          const imgElement = document.createElement('img');
          imgElement.src = value;
          imgElement.style.width = '100px';
          imgElement.style.marginTop = '10px';
          td.appendChild(imgElement);
        }

        return td;
      },
      width: 140,
    },
  ];



  const sendDataToServer = async () => {
    try {
      const dataForm = new FormData();  // FormData para datos JSON y archivos
      const serialSet = new Set(); // Para verificar duplicados de serial
      const emptyRows = data.filter(row => Object.values(row).every(value => !value)); // Filtrar filas vacías
      const rowsToSend = data.filter(row => !emptyRows.includes(row)); // Mantener solo filas no vacías

      if (emptyRows.length > 0) {
        console.log("Se ignoraron los registros vacíos:", emptyRows);
      }

      let assignRandom = false;

      // Validación de datos
      for (const row of rowsToSend) {
        if (!row.nombre) {
          alert("No debe haber equipos con el nombre en blanco");
          return; // No enviar si hay un nombre vacío
        }

        if (!row.serial) {
          if (!assignRandom) {
            assignRandom = confirm("Hay equipos con el serial en blanco, desea que se les asigne uno al azar?");
          }

          if (assignRandom) {
            // Generar un serial aleatorio
            const randomSerial = `${row.nombre}${Math.floor(100000 + Math.random() * 900000)}`; // {nombre + serial de 6 dígitos}

            // Actualizar el estado de manera inmutable
            const updatedData = [...data]; // Crear una copia del estado de los datos
            updatedData[rowsToSend.indexOf(row)].serial = randomSerial; // Asignar el serial a la copia

            // Establecer el nuevo estado
            setData(updatedData);

            // Terminar la ejecución de la función aquí para que no siga procesando
            return;
          } else {
            // Si el usuario no acepta asignar seriales aleatorios, eliminar el registro
            console.log(`Eliminando equipo sin serial: ${JSON.stringify(row)}`);
            continue;
          }
        }
        console.log(row)

        if (!validateDate(row.fechaIngreso)) {
          alert(`La fecha en la fila ${rowsToSend.indexOf(row) + 1} es incorrecta. La fecha debe estar en el formato YYMMDD.`);
          return; // No enviar si la fecha es incorrecta
        }

        // Comprobar duplicados
        if (serialSet.has(row.serial)) {
          alert(`El serial ${row.serial} ya existe. Por favor, asigne un serial único.`);
          return;
        } else {
          serialSet.add(row.serial);
        }
      }

      // Añadir los registros al FormData
      dataForm.append('hospitalNombre', hospital);

      // Añadir los equipos y las imágenes
      for (const [index, row] of rowsToSend.entries()) {
        for (const key of Object.keys(row)) {
          if (key === 'imagenOriginal' && row[key]) {
            const blob = await fetch(row[key]).then(res => res.blob());
            const imageName = row.serial
              ? `${row.serial}.webp`
              : `${row.nombre}_${Math.floor(100000 + Math.random() * 900000)}.webp`;

            // Añadir la imagen al FormData como archivo binario
            dataForm.append(`imagenes[${index}]`, new File([blob], imageName, { type: 'image/webp' }));
          } else {
            // Añadir datos del equipo al FormData
            dataForm.append(`equipos[${index}][${key}]`, row[key]);
          }
        }
      }

      // Verificar el tamaño total de los archivos (en bytes)
      const totalSize = Array.from(dataForm.entries()).reduce((total, [key, value]) => {
        if (value instanceof File) {
          return total + value.size; // Solo sumar los archivos
        }
        return total;
      }, 0);

      if (totalSize > 50 * 1024 * 1024) { // 50 MB
        console.log('El tamaño total de los archivos es demasiado grande.');
        alert('El tamaño total de los archivos es demasiado grande. Por favor, reduce el tamaño de las imágenes.');
        return;
      }

      // Enviar los datos y archivos al servidor
      axios.post(`${ENDPOINT}/Insertequipos`, dataForm, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Usamos multipart/form-data para enviar archivos
        },
      }).then(response => {
        alert('Datos e imágenes enviados correctamente');

        // Limpiar los datos de la tabla
        setData([{
          nombre: '',
          marca: '',
          modelo: '',
          serial: '',
          estado: '',
          area: '',
          fechaIngreso: '',
          serviciosRepuestos: '',
          observaciones: '',
          imagenRecortada: '', // Para mostrar la imagen recortada
          imagenOriginal: '',   // Para almacenar la URL de la imagen original
        }]);


        // Convertir el HTML a PDF y descargarlo
        htmlToPDF(rowsToSend, hospital, user.nombre);

      }).catch(err => {
        //alert(`Error al enviar, el serial ${err.response.data.sqlMessage.split(' ')[2]} ya ha sido ingresado`);
        console.log(err);
      });

    } catch (error) {
      console.error('Error al enviar los datos o imágenes:', error);
      alert('Error al enviar los datos o imágenes');
    }
  };





  const addRow = () => {
    setData([
      ...data,
      {
        nombre: '',
        marca: '',
        modelo: '',
        serial: '',
        estado: '',
        area: '',
        fechaIngreso: '',
        serviciosRepuestos: '',
        observaciones: '',
        imagen: '',
      }
    ]);
  };

  const removeRow = () => {
    const newData = data.slice(0, -1);
    setData(newData);
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const newData = result.data.map((row) => ({
          nombre: row.nombre || '',
          marca: row.marca || '',
          modelo: row.modelo || '',
          serial: row.serial || '',
          estado: row.estado || '',
          area: row.area || '',
          fechaIngreso: row.fechaIngreso || '',
          serviciosRepuestos: row.serviciosRepuestos || '',
          observaciones: row.observaciones || '',
          imagen: row.imagen || '', // Si el CSV contiene URL de imagen
        }));

        setData((prevData) => [...prevData, ...newData]);
      },
      header: true,
    });
  };

  const handleXLSXImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Leer el archivo XLSX
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: 'array' });

      // Convertir la primera hoja a CSV
      const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);

      // Parsear el CSV
      Papa.parse(csv, {
        complete: (result) => {
          const newData = result.data.map((row) => ({
            nombre: row[0] || '',
            marca: row[1] || '',
            modelo: row[2] || '',
            serial: row[3] || '',
            estado: row[4] || '',
            area: row[5] || '',
            fechaIngreso: row[6] || '',
            serviciosRepuestos: row[7] || '',
            observaciones: row[8] || '',
            imagen: row[9] || '', // Suponiendo que la imagen está en la columna 11
          }));

          setData((prevData) => [...prevData, ...newData]);
        },
        header: false // No hay cabecera en el CSV generado
      });
    };

    // Leer el archivo como array
    reader.readAsArrayBuffer(file);
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();

    // Verificar si el archivo es CSV o XLSX
    if (fileExtension === 'csv') {
      handleCSVImport(event);
    } else if (fileExtension === 'xlsx') {
      handleXLSXImport(event);
    } else {
      // Si el archivo no es CSV ni XLSX, muestra un mensaje de error o simplemente no hacer nada
      alert("Por favor, cargue un archivo CSV o XLSX.");
    }
  };



  const handleExportCSV = () => {
    // Excluimos la columna 'imagen' de los datos antes de generar el CSV
    const dataWithoutImages = data.map(({ imagen, ...rest }) => rest);
    const csv = Papa.unparse(dataWithoutImages);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'equipos.csv';
    link.click();
  };

  const handleExportXLSX = () => {
    // Excluimos la columna 'imagen' de los datos antes de generar el XLSX
    const dataWithoutImages = data.map(({ imagen, ...rest }) => rest);

    const ws = XLSX.utils.json_to_sheet(dataWithoutImages);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
    XLSX.writeFile(wb, 'equipos.xlsx');
  };


  const downloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const margin = 10;
      const lineHeight = 10;
      const imgWidth = 50; // Ancho de la imagen en el PDF
      const imgHeight = 50; // Alto de la imagen en el PDF
      let currentY = margin; // Posición vertical inicial

      // Añadir el título al PDF
      doc.setFontSize(16);
      doc.text(`${hospital} -  ${Date.now()}`, margin, currentY);
      currentY += lineHeight * 2;

      // Recorremos los datos de los equipos
      for (let i = 0; i < data.length; i++) {
        const equipo = data[i];

        // Crear contenido HTML para los detalles del equipo
        const equipoHTML = `
          <div style="font-size: 12px;">
            <p><strong>Nombre:</strong> ${equipo.nombre}</p>
            <p><strong>Marca:</strong> ${equipo.marca}</p>
            <p><strong>Modelo:</strong> ${equipo.modelo}</p>
            <p><strong>Serial:</strong> ${equipo.serial}</p>
            <p><strong>Estado:</strong> ${equipo.estado}</p>
            <p><strong>Área:</strong> ${equipo.area}</p>
            <p><strong>Fecha de Ingreso:</strong> ${equipo.fechaIngreso}</p>
            <p><strong>Servicios/Rep.:</strong> ${equipo.serviciosRepuestos}</p>
            <p><strong>Observaciones:</strong> ${equipo.observaciones}</p>
          </div>
        `;

        // Usar doc.html() para agregar el contenido HTML al PDF
        // La posición vertical se ajusta con `currentY`
        await doc.html(equipoHTML, {
          x: margin, // Margen izquierdo
          y: currentY, // Posición vertical actual
          width: 180, // Ancho del área de renderizado
          callback: (doc) => {
            currentY = doc.lastAutoTable.finalY + lineHeight; // Ajuste de la posición después de agregar el HTML
          }
        });

        currentY += lineHeight * 2; // Separar por un poco de espacio entre equipos

        // Si hay una imagen recortada, añadirla al PDF
        if (equipo.imagenRecortada) {
          const blob = await fetch(equipo.imagenRecortada).then((res) => res.blob());
          const imageUrl = URL.createObjectURL(blob);

          // Añadir la imagen al PDF
          doc.addImage(imageUrl, 'JPEG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + lineHeight; // Avanzamos la posición vertical después de la imagen
        }

        // Verificar si se debe agregar una nueva página (en caso de que se sobrepase el tamaño de la página)
        if (currentY > 280) { // La página tiene un tamaño limitado en Y (aproximadamente 290)
          doc.addPage();
          currentY = margin; // Restablecer la posición Y al principio
        }
      }

      // Descargar el PDF generado
      doc.save(`${hospital} -  ${Date.now()}`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }
  };



  const handleExport = (format) => {
    if (format === 'csv') {
      handleExportCSV();
    } else if (format === 'xlsx') {
      handleExportXLSX();
    }
    setShowExportModal(false); // Cerrar el modal después de la exportación
  };

  return (
    <div className={`container py-4 ${theme ? 'bg-dark' : 'light-theme'}`}>
      <h2 className={`text-center ${theme ? 'text-light' : 'text-dark'}`}>{hospital}</h2>

      <div className="row justify-content-center mb-4">
        <div className="col-md-3 d-flex justify-content-between mb-3">
          <button onClick={addRow} className="btn btn-success btn-block w-100">
            Añadir Fila
          </button>
        </div>

        <div className="col-md-3 d-flex justify-content-between mb-3">
          <button onClick={removeRow} className="btn btn-danger btn-block w-100">
            Eliminar Fila
          </button>
        </div>

        <div className="col-md-3 mb-3">
          <label htmlFor="file-upload" className="btn btn-info btn-block w-100">
            Seleccionar archivo
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".csv, .xlsx"
            onChange={handleFileImport}
            className="d-none" // Oculta el input real
          />
        </div>


        <div className="col-md-3 d-flex justify-content-between mb-3">
          <button
            className="btn btn-primary btn-block w-100"
            onClick={() => setShowExportModal(true)}
          >
            Exportar
          </button>
        </div>

        <div className="col-md-3 d-flex justify-content-between mb-3">
          <button
            className="btn btn-primary btn-block w-100"
            onClick={sendDataToServer}
          >
            Enviar Datos
          </button>
        </div>
      </div>


      {/* Modal para Exportación */}
      {showExportModal && (
        <div
          className={`modal show ${theme ? 'modal-dark' : 'modal-light'}`}
          style={{ display: 'block' }}
          role="dialog"
        >
          <div className="modal-dialog">
            <div className={`modal-content ${theme ? 'bg-dark' : 'bg-light'}`}>
              <div className="modal-header">
                <h5 className={`modal-title ${theme ? 'text-light' : 'text-dark'}`}>
                  Seleccionar Formato de Exportación
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowExportModal(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className={`modal-body ${theme ? 'text-light' : 'text-dark'}`}>
                <div className="d-flex justify-content-center">
                  <button
                    className={`btn ${theme ? 'btn-dark' : 'btn-info'} btn-lg mr-3`}
                    onClick={() => handleExport('csv')}
                  >
                    Exportar como CSV
                  </button>
                  <button
                    className={`btn ${theme ? 'btn-dark' : 'btn-success'} btn-lg`}
                    onClick={() => handleExport('xlsx')}
                  >
                    Exportar como XLSX
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="table-responsive" ref={tableRef}>
        <HotTable
          data={data}
          columns={columns}
          colHeaders={columns.map((col) => col.title)}
          rowHeaders={true}
          width="100%"
          height="500"
          licenseKey="non-commercial-and-evaluation"
          contextMenu={['row_above', 'row_below', 'remove_row', 'undo', 'redo']}
          cellRenderer={(row, col, value) => {
            return `<div  style="padding: 10px; font-size: 16px;">${value}</div>`;
          }}
        />
      </div>

      {/* Footer */}
      <footer className={`mt-4 text-center ${theme ? 'text-light' : 'text-muted'}`}>
        <p>IVSS - Tecnología Médica</p>
      </footer>
    </div>
  );





}

export default AddEquipos;


