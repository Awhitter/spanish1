require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
const csv = require('csv-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:4000",
  "http://localhost:3000",
  "https://master--alejandraspanish.netlify.app",
  "https://alejandraspanish.netlify.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

const connectionString = process.env.NEON_DB_CONNECTION_STRING;

if (!connectionString) {
  console.error('NEON_DB_CONNECTION_STRING is not set in the environment variables');
  process.exit(1);
}

const pool = new Pool({ connectionString });

// Initialize database
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('DROP TABLE IF EXISTS ejercicios');
    await client.query(`
      CREATE TABLE ejercicios (
        id SERIAL PRIMARY KEY,
        pregunta TEXT NOT NULL,
        palabras_clave TEXT,
        respuestas_aceptables TEXT,
        dificultad TEXT,
        categoria TEXT,
        pista TEXT
      )
    `);
    console.log('Tabla de ejercicios creada');

    const seedData = [
      {
        pregunta: 'Complete: Los plátanos son _______.',
        palabras_clave: 'amarillos',
        respuestas_aceptables: 'amarillos',
        dificultad: 'fácil',
        categoria: 'colores',
        pista: 'Es el color del sol.'
      },
      {
        pregunta: '¿Cómo se dice "red" en español?',
        palabras_clave: 'rojo',
        respuestas_aceptables: 'rojo',
        dificultad: 'fácil',
        categoria: 'colores',
        pista: 'Es el color de la sangre.'
      },
      {
        pregunta: 'Complete: El cielo es _______.',
        palabras_clave: 'azul',
        respuestas_aceptables: 'azul',
        dificultad: 'fácil',
        categoria: 'colores',
        pista: 'Es el color del mar también.'
      },
      {
        pregunta: '¿Cuál es el color de la hierba?',
        palabras_clave: 'verde',
        respuestas_aceptables: 'verde',
        dificultad: 'fácil',
        categoria: 'colores',
        pista: 'Es el color de las hojas de los árboles.'
      },
      {
        pregunta: 'Complete: La nieve es _______.',
        palabras_clave: 'blanca',
        respuestas_aceptables: 'blanca',
        dificultad: 'fácil',
        categoria: 'colores',
        pista: 'Es el color opuesto al negro.'
      }
    ];

    for (const ejercicio of seedData) {
      await client.query(
        'INSERT INTO ejercicios (pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista) VALUES ($1, $2, $3, $4, $5, $6)',
        [ejercicio.pregunta, ejercicio.palabras_clave, ejercicio.respuestas_aceptables, ejercicio.dificultad, ejercicio.categoria, ejercicio.pista]
      );
    }
    console.log('Datos iniciales cargados');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    client.release();
  }
}

initializeDatabase();

// Error handler middleware
const errorHandler = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
};

// Fetch all exercises
app.get('/ejercicios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ejercicios');
    console.log(`Ejercicios obtenidos: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    errorHandler(res, error, 'Error al obtener ejercicios:');
  }
});

// Add a new exercise
app.post('/ejercicios', async (req, res) => {
  const { pregunta, palabrasClave, respuestasAceptables, dificultad, categoria, pista } = req.body;
  
  if (!pregunta || !respuestasAceptables) {
    return res.status(400).json({ error: 'La pregunta y al menos una respuesta aceptable son obligatorias' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO ejercicios (pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pregunta, palabrasClave, respuestasAceptables, dificultad, categoria, pista]
    );
    const nuevoEjercicio = result.rows[0];
    res.status(201).json(nuevoEjercicio);
    io.emit('ejercicio_agregado', nuevoEjercicio);
  } catch (error) {
    errorHandler(res, error, 'Error al agregar ejercicio:');
  }
});

// Update an exercise
app.put('/ejercicios/:id', async (req, res) => {
  const { id } = req.params;
  const { pregunta, palabrasClave, respuestasAceptables, dificultad, categoria, pista } = req.body;
  
  if (!pregunta || !respuestasAceptables) {
    return res.status(400).json({ error: 'La pregunta y al menos una respuesta aceptable son obligatorias' });
  }

  try {
    const result = await pool.query(
      'UPDATE ejercicios SET pregunta = $1, palabras_clave = $2, respuestas_aceptables = $3, dificultad = $4, categoria = $5, pista = $6 WHERE id = $7 RETURNING *',
      [pregunta, palabrasClave, respuestasAceptables, dificultad, categoria, pista, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    const ejercicioActualizado = result.rows[0];
    res.json(ejercicioActualizado);
    io.emit('ejercicio_actualizado', ejercicioActualizado);
  } catch (error) {
    errorHandler(res, error, 'Error al actualizar ejercicio:');
  }
});

// Delete an exercise
app.delete('/ejercicios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM ejercicios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    const ejercicioEliminado = result.rows[0];
    res.json(ejercicioEliminado);
    io.emit('ejercicio_eliminado', id);
  } catch (error) {
    errorHandler(res, error, 'Error al eliminar ejercicio:');
  }
});

// CSV upload route
app.post('/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const stream = require('stream');
  const readStream = new stream.Readable();
  readStream._read = () => {};
  readStream.push(req.file.buffer);
  readStream.push(null);

  readStream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let addedCount = 0;
        let errorCount = 0;
        for (const row of results) {
          if (row.pregunta && row.respuestas_aceptables) {
            await pool.query(
              'INSERT INTO ejercicios (pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista) VALUES ($1, $2, $3, $4, $5, $6)',
              [row.pregunta, row.palabras_clave || '', row.respuestas_aceptables, row.dificultad, row.categoria, row.pista]
            );
            addedCount++;
          } else {
            errorCount++;
            console.error('Error: Ejercicio inválido', row);
          }
        }
        res.status(200).json({
          message: `CSV procesado. ${addedCount} ejercicios agregados, ${errorCount} ejercicios inválidos.`,
          addedCount,
          errorCount
        });
        io.emit('ejercicios_actualizados');
      } catch (error) {
        errorHandler(res, error, 'Error processing CSV:');
      }
    });
});

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');
  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});