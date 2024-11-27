import React, { useState, useRef } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { HotTable } from '@handsontable/react';
import { htmlToPDFReportes } from '../components/tableFunctions';
import axios from 'axios';
import Papa from 'papaparse'
import * as XLSX from 'xlsx';
import 'handsontable/dist/handsontable.full.css';
import "../styles/AddEquipos.css";
import { useUser } from './userContext';
import { fusionarFotos } from '../components/tableFunctions';
import { ENDPOINT } from '../../env';


const AddReportes = () => {
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
    // Expresión regular para validar el formato YYYY/MM/DD o YYYY-MM-DD
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



  const today = new Date();
  const formattedDate = `
      ${today.getFullYear().toString()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;

  const { hospital } = useParams();
  const tableRef = useRef();
  const [data, setData] = useState([{
    nombre: '',
    marca: '',
    modelo: '',
    serial: '',
    estado: '',
    area: '',
    fecha: formattedDate,
    falla_reportada: '',
    solucion: '',
    serviciosRepuestos: '',
    observaciones: '',
    imagenRecortada: '', // Para mostrar la imagen recortada
    imagenOriginal: '',   // Para almacenar la URL de la imagen original
  }]);

  const [showExportModal, setShowExportModal] = useState(false);


  const handleImageUpload = (row, file) => {
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
    { data: 'nombre', title: 'Nombre', width: 80 },
    { data: 'marca', title: 'Marca', width: 80 },
    { data: 'modelo', title: 'Modelo', width: 80 },
    { data: 'serial', title: 'Serial', width: 80 },
    { data: 'estado', title: 'Status', width: 80 },
    { data: 'area', title: 'Área', width: 80 },
    { data: 'tecnicos', title: 'Técnicos', width: 120 },
    { data: 'fecha', title: 'Fecha A/M/D ', width: 80 },
    { data: 'falla_reportada', title: 'Falla Reportada', width: 120 },
    { data: 'solucion', title: 'Solución', width: 120 },
    { data: 'serviciosRepuestos', title: 'Servicios o Repuestos Requeridos', width: 200 },
    { data: 'observaciones', title: 'Observaciones', width: 100 },
    {
      data: 'imagenRecortada',
      title: 'Imagen',

      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.innerHTML = '';


        const button = document.createElement('button');
        button.textContent = 'Cargar Imágenes';
        button.className = 'btn-primary btn-sm';

        button.onclick = () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.multiple = true; // Permitir la selección de múltiples archivos

          input.onchange = (event) => {
            const files = event.target.files;

            if (files.length === 0) return; // Si no se selecciona ninguna imagen, salir

            if (files.length === 1) {
              // Si solo se selecciona una imagen, solo la procesamos sin fusionar
              const file = files[0];
              handleImageUpload(0, file);
            } else if (files.length === 2) {
              // Si se seleccionan dos imágenes, fusionarlas
              const blob1 = files[0];
              const blob2 = files[1];

              fusionarFotos(blob1, blob2).then(file => {
                handleImageUpload(0, file); // Usamos el archivo fusionado
              }).catch(err => {
                console.log('Error al fusionar las imágenes:', err);
              });
            } else {
              // Si se seleccionan más de 2 imágenes, mostrar una alerta
              alert('Por favor, selecciona un máximo de 2 imágenes.');
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
      const dataForm = new FormData();
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
            const randomSerial = `${row.nombre}${Math.floor(100000 + Math.random() * 900000)}`; // {nombre + serial de 6 dígitos}
            const updatedData = [...data];
            updatedData[rowsToSend.indexOf(row)].serial = randomSerial;
            setData(updatedData);
            return;
          } else {
            console.log(`Eliminando equipo sin serial: ${JSON.stringify(row)}`);
            continue;
          }
        }

        // Validación de la fecha
        /* if (!validateDate(row.fecha)) {
           alert(`La fecha en la fila ${rowsToSend.indexOf(row) + 1} es incorrecta. La fecha debe estar en el formato YYMMDD.`);
           return; // No enviar si la fecha es incorrecta
         }*/

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

      for (const [index, row] of rowsToSend.entries()) {
        for (const key of Object.keys(row)) {
          if (key === 'imagenOriginal' && row[key]) {
            const blob = await fetch(row[key]).then(res => res.blob());
            const imageName = row.serial
              ? `${row.serial}.webp`
              : `${row.nombre}_${Math.floor(100000 + Math.random() * 900000)}.webp`;
            dataForm.append(`imagenes[${index}]`, new File([blob], imageName, { type: 'image/webp' }));
          } else {
            dataForm.append(`equipos[${index}][${key}]`, row[key]);
          }
        }
      }

      const totalSize = Array.from(dataForm.entries()).reduce((total, [key, value]) => {
        if (value instanceof File) {
          return total + value.size; // Solo sumar los archivos
        }
        return total;
      }, 0);

      if (totalSize > 50 * 1024 * 1024) {
        console.log('El tamaño total de los archivos es demasiado grande.');
        alert('El tamaño total de los archivos es demasiado grande. Por favor, reduce el tamaño de las imágenes.');
        return;
      }

      // Enviar los datos y archivos al servidor
      const dataResponse = await axios.post(`${ENDPOINT}/addReporte`, dataForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Datos e imágenes enviados correctamente');

      // Ahora, generamos el PDF con los datos
      console.log(user)
      htmlToPDFReportes(rowsToSend, hospital, user.nombre);

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
        imagenRecortada: '',
        imagenOriginal: '',
      }]);

    } catch (error) {
      console.error('Error al enviar los datos o imágenes:', error);
      alert('Error al enviar los datos o imágenes');
    }
  };






  const addRow = () => {
    // Obtener la fecha actual en formato YYMMDD

    setData([
      ...data,
      {
        nombre: '',
        marca: '',
        modelo: '',
        serial: '',
        estado: '',
        area: '',
        técnico: '',
        fecha: formattedDate,  // Asignamos la fecha actual a la nueva fila
        falla_reportada: '',
        solucion: '',
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
        // Verifica cómo está estructurado el CSV
        console.log(result);

        // Filtra filas vacías o con datos incorrectos
        const validRows = result.data.filter(row => {
          return Object.values(row).some(value => value && value.trim() !== ''); // Filtra filas vacías
        });

        // Verifica las filas válidas después de filtrarlas
        console.log(validRows);

        // Mapea los datos y asegúrate de que las claves coincidan con las que esperas
        const newData = validRows.map((row) => ({
          nombre: row.nombre || '',
          marca: row.marca || '',
          modelo: row.modelo || '',
          serial: row.serial || '',
          estado: row.estado || '',
          area: row.area || '',
          tecnicos: row.tecnicos || '',
          fecha: row.fecha || '',
          falla_reportada: row.falla_reportada || '', // Asegúrate de que este campo esté correctamente mapeado
          solucion: row.solucion || '',
          serviciosRepuestos: row.serviciosRepuestos || '',
          observaciones: row.observaciones || '',
          imagen: row.imagen || '', // Si el CSV contiene URL de imagen, se incluirá aquí
        }));

        // Verifica cómo quedan los datos mapeados antes de agregarlos al estado
        console.log(newData);

        // Actualiza el estado con los nuevos datos
        setData((prevData) => [...prevData, ...newData]);
      },
      header: true,  // Indica que el CSV tiene una fila de encabezados
      skipEmptyLines: true,  // Ignora las líneas vacías
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
            tecnicos: row[6] || '',
            fecha: row[7] || '',
            falla_reportada: row[8] || '',
            solucion: row[9] || '',
            serviciosRepuestos: row[10] || '',
            observaciones: row[11] || '',
            imagen: row[12] || '', // Suponiendo que la imagen está en la columna 11
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
    // Excluimos las columnas que no deben ser exportadas (como 'imagen')
    const dataWithoutImages = data.map(({ imagenRecortada, imagenOriginal, ...rest }) => rest);

    // Convertir los datos a una hoja de Excel
    const ws = XLSX.utils.json_to_sheet(dataWithoutImages);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos');

    // Exportar el archivo
    XLSX.writeFile(wb, 'equipos.xlsx');
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
    <div className="container py-4">
      <h2 className="mb-4 text-center">Reportes - {hospital}</h2>

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

      {showExportModal && (
        <div className="modal show" style={{ display: 'block' }} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Seleccionar Formato de Exportación</h5>
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
              <div className="modal-body text-center">
                <button
                  className="btn btn-info btn-lg mr-3 mb-2"
                  onClick={() => handleExport('csv')}
                >
                  Exportar como CSV
                </button>
                <button
                  className="btn btn-success btn-lg mb-2"
                  onClick={() => handleExport('xlsx')}
                >
                  Exportar como XLSX
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive" ref={tableRef}>
        <HotTable
          colHeaders={columns.map((col) => col.title)}
          rowHeaders={true}
          width="100%"
          height="500"
          columnSorting={true}
          licenseKey="non-commercial-and-evaluation"
          contextMenu={true}
          cellRenderer={(row, col, value) => {
            return `<div style="padding: 10px; font-size: 16px;">${value}</div>`;
          }}
          data={data}
          columns={columns}
        />
      </div>

      <footer className="mt-4 text-center">
        <p className="text-muted">IVSS - Tecnología Médica</p>
      </footer>
    </div>
  );


}

export default AddReportes;