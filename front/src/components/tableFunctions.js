import jsPDF from 'jspdf';


const generateHTML = (dataForm, hospital) => {
  let htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.4; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 6px 8px; border: 5px solid #ddd; text-align: left; font-size: 10px; }
        th { background-color: #f4f4f4; }
        h1 { text-align: center; font-size: 14px; }
        
      </style>
    </head>
    <body>
      <h1>Equipos ${hospital}</h1>
      <hr/>
      <table>
        <thead>
          <tr>
            <th>Nombre &nbsp;</th>
            <th>Marca &nbsp;</th>
            <th>Modelo &nbsp;</th>
            <th>Serial &nbsp;</th>
            <th>Estado &nbsp;</th>
            <th>Área &nbsp; &nbsp;</th>
            <th>Fecha de Ingreso &nbsp;</th>
            <th>Servicios y Repuestos &nbsp;</th>
            <th>Observaciones &nbsp;</th>
            <th> &nbsp; Imagen &nbsp;</th>
          </tr>
        </thead>
        <tbody>`;

  // Añadir las filas de equipos
  dataForm.forEach(row => {
    htmlContent += `
      <tr>
        <td>${row.nombre} &nbsp;</td>
        <td>${row.marca} &nbsp;</td>
        <td>${row.modelo} &nbsp;</td>
        <td>${row.serial} &nbsp;</td>
        <td>${row.estado} &nbsp;</td>
        <td>${row.area} &nbsp;</td>
        <td>${row.fechaIngreso} &nbsp;</td>
        <td>${row.serviciosRepuestos} &nbsp;</td>
        <td>${row.observaciones} &nbsp;</td>
        <td>
          <img 
              src='${row.imagenRecortada}' 
              alt='${row.nombre}' 
              style='max-width: 200px; height: auto;' />
        </td>

      </tr>
      <hr/>
      `;

  });

  htmlContent += `
        </tbody>
      </table>
    </body>
    </html>`;

  return htmlContent;
};

export const htmlToPDF = (dataForm, nombreHospital) => {
  const htmlContent = generateHTML(dataForm, nombreHospital );
  const doc = new jsPDF({
    orientation: 'landscape', // Cambia a 'landscape' si deseas un formato horizontal
    unit: 'mm', // Usar milímetros
    format: [1600, 1600],
  });

  // Agregar contenido HTML al PDF con ajuste de salto de página y márgenes
  doc.html(htmlContent, {
    callback: function (doc) {
      // Descargar el archivo PDF
      doc.save(`${nombreHospital} - ${Date()} .pdf`);
    },
    margin: [20, 20, 20, 20], // Márgenes
    x: 10,  // Posición horizontal
    y: 10,  // Posición vertical
    autoPaging: true // Activar paginación automática
  });
};

