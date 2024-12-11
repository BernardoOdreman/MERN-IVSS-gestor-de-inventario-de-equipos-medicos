import express, { response } from 'express';
import cors from 'cors'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import multer from 'multer'
import bodyParser from 'body-parser'

import {
  actualizarUsuario, cambiarClaveUsuario, getEmail, getReportes, obtenerEquiposConImagen, eliminarEquipos,
  obtenerUsuarios, eliminarUsuario, insertarEquiposConImagenes, crearUsuario,
  eliminarHospital, getHospitals, insertHospital, getHospitalId, addReportes,
  getEquiposPorHospital, login
} from './services/dbconnect.js'

import { enviarCodigoRecuperacion } from './services/mail.js'

dotenv.config();
const app = express();

const SECRET = process.env.SECRET || "VAMOS_VINOTINTO";
const PORT = process.env.PORT  || 3000;
const CLIENT = process.env.CLIENT || 'http://localhost:5173';
 
app.use(express.json());// Middleware para parsear solicitudes JSON
app.use(cookieParser());// Middleware para aceptar las cookies

const ALLOWED_ORIGINS = [
  CLIENT
];

app.use(bodyParser.json({ limit: '50mb' }));  // Aumenta el límite de 50 MB
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


const storage = multer.memoryStorage();


const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limita el tamaño máximo de cada archivo a 50MB
});



const generateToken = (user) => {
  const token = jwt.sign({ user }, SECRET, { expiresIn: '6h' })
  return token
}

const generateTokenRecuparacion = (user) => {
  const token = jwt.sign({ user }, SECRET, { expiresIn: '5m' })
  return token
}


const authenticateJWTwithAccsesLevel = (requiredAccessLevel) => {
  return (req, res, next) => {
    const token = req.cookies['token'];


    if (token) {
      jwt.verify(token, SECRET, (err, user) => {
        if (err) {
          console.log(err);
          return res.sendStatus(403); // Forbidden
        }

        req.user = user;
        const userData = req.user; // Esto contiene el JSON del token
        console.log(userData.user.tipoAcceso, requiredAccessLevel, userData.user.tipoAcceso >= requiredAccessLevel)

        if (userData.user.tipoAcceso >= requiredAccessLevel) {
          next();
        } else {
          res.status(401).send('Unauthorized'); // Unauthorized
        }
      });
    } else {
      res.status(401).send('Unauthorized'); // Unauthorized
    }
  };
};


const authenticateJWT = (req, res, next) => {
  const token = req.body.codigoRecuperacion;

  if (token) {
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403); // Forbidden
      }

      req.user = user;
      const userData = req.user; // Esto contiene el JSON del token
      console.log("Datos del usuario:", userData);
      next()

    });
  } else {
    res.status(401).send('Unauthorized'); // Unauthorized
  }
};




app.get('/recuperarUsuario/:cedula', (req, res) => {
  getEmail(req.params.cedula).then(response => {
    console.log(response)

    const toket = generateTokenRecuparacion(req.params.cedula);
    enviarCodigoRecuperacion(toket, response.email)

    res.send(response)

  }).catch(err => {
    console.log(err)
  })
})

app.post('/cambiarClaveUsuario', authenticateJWT, (req, res) => {
  console.log(req.body);
  cambiarClaveUsuario(req.body.cedula, req.body.nuevaClave).then(response => {
    console.log(response)
    res.status(200).send('Clave a actualizada con extitos!')
  }).catch(err => {
    console.log(err)
    res.status(500).send(err)

  })
})




app.post('/login', (req, res) => {
  const { ci, password } = req.body;

  login(ci, password)
    .then(userData => {
      try {
        const data = {
          nombre: userData.nombre,
          cedula: userData.cedula,
          tipoAcceso: userData.tipoAcceso,
          redi: userData.redi,
          email: userData.email,
        }
        const token = generateToken(userData);

        res.cookie('token', token, {
          httpOnly: true,
          //secure: true, // Cambiar a true en produccion solo si usas https
          //sameSite: 'None', // Permite cross-origin requests.   //// Descomentar junto secure : true
        });

        res.json({ userData: data });


      } catch (err) {
        console.log('Datos invalidos')
        res.status(403).json('Cedula o clave incorrecta');

      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Error en el login' });
    });
});



app.post('/actualizarUsuario', authenticateJWTwithAccsesLevel(2), (req, res) => {

  actualizarUsuario(req.body).then(response=>
    res.status(200).send('Datos del usuario actualizados!')
  ).catch(err=>{
    console.log(err)
    res.status(400).send(err)

  })

})

app.get('/auth', authenticateJWTwithAccsesLevel(2), (req, res) => {

  const authenticatedUser = req.user; // Usuario verificado
  // Envía una respuesta con los datos del usuario
  res.json({
    message: 'Usuario autenticado',
    user: authenticatedUser  // Devuelve los datos del usuario
  });
});


app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).send({ message: 'Sesión cerrada' });
});



app.get('/getData', async (req, res) => {

  const hospitales = await getHospitals()
  res.send(hospitales)
})

app.post('/insertHospital', authenticateJWTwithAccsesLevel(3), (req, res) => {

  insertHospital(req.body)
    .then((id) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err)
      res.sendStatus(500);
    });
});


app.post('/Insertequipos', authenticateJWTwithAccsesLevel(2), upload.any(), (req, res) => {
  const equipos = req.body.equipos;
  try {
    getHospitalId(req.body.hospitalNombre).then(hospital_id => {
      insertarEquiposConImagenes({ hospital_id, equipos }).then(() => {
        res.status(200).send('Equipos procesados correctamente');
      }).catch(err => {
        console.log(err);
        res.status(520).send(err);
      });
    }).catch(err => {
      console.log('Error fetching hospital ID:', err);
      res.status(520).send(err);
    });
  } catch (err) {
    console.log(err)
  }

});

app.delete('/eliminarHospital/:id', authenticateJWTwithAccsesLevel(3), async (req, res) => {
  await eliminarHospital(req.params.id)
})

app.get('/getEquipos/:x', async (req, res) => {
  const results = await getEquiposPorHospital(req.params.x);
  res.send(results)

})

app.post('/crearUsuario', authenticateJWTwithAccsesLevel(3), async (req, res) => {
  crearUsuario(req.body)

})

app.get('/getUsuarios', authenticateJWTwithAccsesLevel(3), async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).send('Error al obtener usuarios');
  }
});

// Eliminar un usuario
app.delete('/EliminarUsuarios/:id', authenticateJWTwithAccsesLevel(3), async (req, res) => {
  const { id } = req.params;
  try {
    await eliminarUsuario(id);
    res.status(200).send('Usuario eliminado');
  } catch (error) {
    res.status(500).send('Error al eliminar usuario');
  }
});



app.post('/eliminarEquipos', authenticateJWTwithAccsesLevel(2), async (req, res) => {
  eliminarEquipos(req.body).then(response => {
    res.status(200).send("Equipos eliminados correctamente");
  }
  ).catch(err => {
    console.log(err)
    res.status(500).send("Error al elliminar equipos");
  })
})




app.post('/obtenerEquiposConImagen', (req, res) => {

  obtenerEquiposConImagen(req.body.e).then(equipos => {
    console.log('Equipos:', equipos);
    res.status(200).send(equipos);
  })
    .catch(error => {
      console.error('Error:', error);
    })

})

app.post('/addReporte', authenticateJWTwithAccsesLevel(2), upload.any(), async (req, res) => {

  console.log(req.body)
  addReportes(req.body).then(ok => res.status(200).send("Reportes insertados exitosamente")).catch(err => {
    console.log(err)
    res.status(500).send(err)

  })

})


app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

app.get('/getReportes', async (req, res) => {
  try {

    const response = await getReportes();
    res.status(200).send(response)

  } catch (err) {
    console.log(err)
  }
})

