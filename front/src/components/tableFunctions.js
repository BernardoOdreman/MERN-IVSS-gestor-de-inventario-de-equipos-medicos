import jsPDF from 'jspdf';


export const redisVenezuela = [
  { nombre: 'REDI Capital', estados: ['Miranda', 'Vargas', 'Distrito Capital'] },
  { nombre: 'REDI Occidental', estados: ['Zulia', 'Falcón', 'Lara'] },
  { nombre: 'REDI Los Andes', estados: ['Mérida', 'Táchira', 'Trujillo'] },
  { nombre: 'REDI Central', estados: ['Aragua', 'Carabobo', 'Yaracuy'] },
  { nombre: 'REDI Los Llanos', estados: ['Apure', 'Barinas', 'Cojedes', 'Guárico', 'Portuguesa'] },
  { nombre: 'REDI Guayana', estados: ['Amazonas', 'Bolívar', 'Delta Amacuro'] },
  { nombre: 'REDI Oriental', estados: ['Anzoátegui', 'Monagas', 'Sucre'] },
  { nombre: 'REDI Marítima e Insular', estados: ['Nueva Esparta', 'Espacios marinos y submarinos de Venezuela'] },
];


const generatePDF = (dataForm, hospital, user) => {
  // Cambiar el tamaño de la hoja a A3
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });

  // Títulos
  doc.setFontSize(12);
  doc.text(`Equipos ${hospital}`, 210 / 2, 20, null, null, 'center');
  doc.setFontSize(10);
  doc.text(`Usuario: ${user}`, 20, 30);

  // Trazar una línea horizontal
  doc.setLineWidth(0.5);
  doc.line(20, 35, 400 - 20, 35);

  // Definir las cabeceras de la tabla
  const headers = [
    'Nombre', 'Marca', 'Modelo', 'Serial', 'Estado', 'Área',
    'Fecha de Ingreso', 'Servicios y Repuestos', 'Observaciones', 'Imagen'
  ];

  const startX = 20;
  const startY = 40;
  const rowHeight = 10;
  const colWidths = [30, 30, 30, 30, 20, 20, 30, 35, 30, 30];

  // Dibujar las cabeceras
  headers.forEach((header, index) => {
    doc.setFont('Arial', 'bold');
    doc.text(header, startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0), startY);
  });

  // Dibujar las filas de datos
  let yOffset = startY + rowHeight;
  dataForm.forEach((row) => {
    const rowData = [
      row.nombre, row.marca, row.modelo, row.serial, row.estado,
      row.area, row.fechaIngreso, row.serviciosRepuestos, row.observaciones
    ];

    rowData.forEach((cell, index) => {
      doc.setFont('Arial', 'normal');
      doc.text(cell, startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0), yOffset);
    });

    const imageWidth = 80;
    const imageHeight = 80;
    doc.addImage(row.imagenRecortada, 'JPEG', startX + colWidths.slice(0, 9).reduce((a, b) => a + b, 0), yOffset - 6, imageWidth, imageHeight);

    yOffset += rowHeight;


    doc.addPage();
    yOffset = 20; // Restablecer la posición y


  });

  // Guardar el PDF con el nombre adecuado
  doc.save(`${hospital} - ${new Date().toLocaleString()}.pdf`);
};

export const htmlToPDF = (dataForm, nombreHospital, user) => {
  generatePDF(dataForm, nombreHospital, user);
};