import nodemailer from 'nodemailer';

export function enviarCodigoRecuperacion(recuperationCode, recipientEmail) {
  // El contenido HTML del correo
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
    <style>
      body {
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px; 
        margin: 0 auto; 
        padding: 20px; 
        background-color: #ffffff; 
        border-radius: 10px; 
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center; 
        padding-bottom: 20px;
      }
      .header img {
        max-width: 150px; 
        margin-bottom: 10px;
      }
      .header h2 {
        color: #333333; 
        font-size: 24px;
      }
      .content {
        color: #555555; 
        font-size: 16px; 
        line-height: 1.5;
      }
      .code {
        font-size: 20px; 
        font-weight: bold; 
        color: #007BFF; 
        padding: 10px; 
        background-color: #f0f8ff; 
        border-radius: 5px; 
        text-align: center;
        border: 1px solid #007BFF; /* Añadido para resaltar el código */
        margin: 20px 0; /* Espacio arriba y abajo del código */
      }
      .footer {
        margin-top: 30px; 
        font-size: 14px; 
        color: #777777; 
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        
        <h2>Recupera tu Contraseña</h2>
        <p class="content">Hemos recibido una solicitud para recuperar la contraseña de tu cuenta. Si no realizaste esta solicitud, ignora este correo. Si lo hiciste, usa el siguiente código para restablecer tu contraseña:</p>
        <div class="code">
          ${recuperationCode}
        </div>
      </div>
      <div class="footer">
        <p>Si no has solicitado recuperar tu contraseña, puedes ignorar este correo y no ocurrirá nada.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  // Crear un transportador utilizando el servicio de Gmail
  let transporter = nodemailer.createTransport({
    service: 'gmail',  // Especifica el servicio de Gmail
    auth: {
      user: 'odremanbernardo@gmail.com',  // Tu dirección de correo Gmail
      pass: 'qqzl wmtc jjff jxrr'  // Tu contraseña o contraseña de la aplicación
    }
  });

  // Configurar el correo
  let mailOptions = {
    from: 'odremanbernardo@gmail.com',  // El remitente
    to: recipientEmail,  // El destinatario
    subject: 'Recuperación de Contraseña',  // Asunto del correo
    text: `Hemos recibido una solicitud para recuperar tu contraseña. Tu código de recuperación es: ${recuperationCode}`,  // Contenido en texto plano
    html: htmlContent  // Contenido HTML
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo: ', error);
    } else {
      console.log('Correo enviado: ' + info.response);
    }
  });
}

