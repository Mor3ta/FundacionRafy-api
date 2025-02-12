// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from 'mssql';
import axios from 'axios';

dotenv.config();

const corsOptions = {
  origin: ["https://torneoapi1.azurewebsites.net/", "https://www.fundacionrafybueno.org/"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors(corsOptions));



const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

sql.connect(dbConfig)
  .then(() => console.log('SQL Server connected'))
  .catch(err => console.error('SQL Server connection error:', err));

app.post('/api/inscripciones', async (req, res) => {
  const { disciplina, manager, telefono, email, equipo, provincia, municipio } = req.body;

  if (!disciplina || !manager || !telefono || !equipo || !provincia || !municipio) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto el correo.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('disciplina', sql.VarChar, disciplina)
      .input('manager', sql.VarChar, manager)
      .input('telefono', sql.VarChar, telefono)
      .input('email', sql.VarChar, email || null)
      .input('equipo', sql.VarChar, equipo)
      .input('provincia', sql.VarChar, provincia)
      .input('municipio', sql.VarChar, municipio)
      .query(`INSERT INTO Inscripciones (disciplina, manager, telefono, email, equipo, provincia, municipio) 
              VALUES (@disciplina, @manager, @telefono, @email, @equipo, @provincia, @municipio)`);
    res.status(201).json({ message: 'Inscripción guardada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la inscripción.' });
  }
});

// Endpoint para recibir inscripciones desde el frontend
app.get('/api/inscripciones', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Inscripciones');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error al obtener las inscripciones.' });
  }
});

// // Conectar el formulario con el backend usando fetch
// app.post('/api/enviar-inscripcion', async (req, res) => {
//   try {
//     const response = await axios.post('http://localhost:5000/api/inscripciones', req.body);
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Error al conectar con el backend' });
//   }
// });


app.post("/api/inscripcion-escolar", async (req, res) => {
  try {
    const { nombreEquipo, manager, telefono, email, escuela, grado, provincia, municipio } = req.body;

    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("nombreEquipo", sql.VarChar, nombreEquipo)
      .input("manager", sql.VarChar, manager)
      .input("telefono", sql.VarChar, telefono)
      .input("email", sql.VarChar, email)
      .input("CentroEducativo", sql.VarChar, CentroEducativo)
      .input("DistritoEducativo", sql.VarChar, DistritoEducativo)
      .input("provincia", sql.VarChar, provincia)
      .input("municipio", sql.VarChar, municipio)
      .input('diciplina', sql.VarChar, diciplina)
      .query(`
        INSERT INTO Inscripciones_Escolares (nombreEquipo, manager, telefono, email, CentroEducativo, DistritoEducativo, provincia, municipio,disciplina)
        VALUES (@nombreEquipo, @manager, @telefono, @email, @escuela, @grado, @provincia, @municipio,@disciplina)
      `);

    res.status(201).json({ message: "Inscripción escolar guardada con éxito" });
  } catch (error) {
 
    res.status(500).json({ error: "Error al registrar la inscripción" });
  }
});


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
