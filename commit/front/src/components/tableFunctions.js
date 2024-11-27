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




const generatePDFReportes = (dataForm, hospital, user) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });

  // Títulos
  doc.setFontSize(12);
  doc.text(`Reportes  ${hospital}`, 210 / 2, 20, null, null, 'center');
  doc.setFontSize(10);
  doc.text(`Usuario: ${user.nombre || 'Desconocido'}`, 20, 30);

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
      row.nombre || '',
      row.marca || '',
      row.modelo || '',
      row.serial || '',
      row.estado || '',
      row.area || '',
      row.fecha || '',
      row.serviciosRepuestos || '',
      row.observaciones || ''
    ];

    rowData.forEach((cell, index) => {
      doc.setFont('Arial', 'normal');
      // Asegúrate de que "cell" sea una cadena válida
      if (cell) {
        doc.text(String(cell), startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0), yOffset);
      }
    });

    // Verificar que la imagen esté disponible antes de agregarla
    if (row.imagenRecortada) {
      const imageWidth = 80;
      const imageHeight = 80;
      try {
        doc.addImage(row.imagenRecortada, 'JPEG', startX + colWidths.slice(0, 9).reduce((a, b) => a + b, 0), yOffset - 6, imageWidth, imageHeight);
      } catch (err) {
        console.error('Error al agregar imagen:', err);
      }
    }

    yOffset += rowHeight;
  });

  // Guardar el PDF con el nombre adecuado
  try {
    doc.save(`${hospital} - ${new Date().toLocaleString()}.pdf`);
  } catch (err) {
    console.error('Error al generar el PDF:', err);
  }
};
 

export const htmlToPDFReportes= (dataForm, hospital, user) => {
  generatePDFReportes(dataForm, hospital, user);
};



export function fusionarFotos(blob1, blob2) {
  return new Promise((resolve, reject) => {
    // Crear un objeto Image para cada blob
    const img1 = new Image();
    const img2 = new Image();
    
    // Crear un FileReader para convertir los blobs en URLs de imagen
    const reader1 = new FileReader();
    const reader2 = new FileReader();
    
    // Función que maneja la carga de la primera imagen
    reader1.onload = (e) => {
      img1.onload = () => {
        // Función que maneja la carga de la segunda imagen
        reader2.onload = (e) => {
          img2.onload = () => {
            // Crear un canvas con el tamaño de la imagen combinada
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Establecer el tamaño del canvas para que acomode ambas imágenes
            const width = Math.max(img1.width, img2.width);
            const height = img1.height + img2.height; // Puedes ajustar esto para superponer o cambiar el diseño
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar ambas imágenes en el canvas
            ctx.drawImage(img1, 0, 0);  // Imagen 1 en la parte superior
            ctx.drawImage(img2, 0, img1.height);  // Imagen 2 debajo de la imagen 1
            
            // Convertir el canvas a un blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject('Error al convertir el canvas en Blob');
              }
            }, 'image/png');
          };
          img2.src = e.target.result; // Cargar la segunda imagen
        };
        reader2.readAsDataURL(blob2); // Leer la segunda imagen como Data URL
      };
      img1.src = e.target.result; // Cargar la primera imagen
    };
    reader1.readAsDataURL(blob1); // Leer la primera imagen como Data URL
  });
}

