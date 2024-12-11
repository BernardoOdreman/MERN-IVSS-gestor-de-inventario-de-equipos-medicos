
Instala las dependencias con npm install.
Puedes ejecutar el servidor con node app.js o pm2 start.
El servidor se puede ejecutar con npm run dev o, para producción, hacer npm run build; serve -s dist/ -l 5173.

Para producción, configura las direcciones IPv4 según donde sirvas las aplicaciones. Usa, por ejemplo, la dirección local del rango 192 en el front y back.

El presente es un sistema de gestión de inventario para el IVSS (INSTITUTO VENEZOLANO DE LOS SEGUROS SOCIALES), DGMTM.
Permite el registro de cada equipo médico de cada centro hospitalario a nivel nacional, así como un seguimiento del mantenimiento de cada equipo, lo que requiere y/o presenta. A la hora de editar o introducir nueva información, el personal administrativo deberá iniciar su sesión y solo podrá editar la información de los hospitales de su red correspondiente. (Las REDIS en VZLA son, en pocas palabras, agrupaciones de varios estados).
Solamente el jefe podrá crear y eliminar los usuarios de los empleados (que administran las REDIS). No tendría sentido que cualquiera pueda hacerse un usuario y libremente editar la información.

Las imágenes de los equipos se guardan en MySQL como long blob.

Para enviar el código de recuperación por Gmail, deberás generar una contraseña de aplicaciones en la configuración de Google. Vas a necesitar habilitar la autenticación de dos factores. Es gratis habilitar dicha contraseña. ¡NO LA PIERDAS NI LA COMPARTAS! luego editas en el archivo .env del backend.
