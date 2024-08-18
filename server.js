require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

// Initialize database and load seed data if necessary
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Check if the exercises table exists
    const tableExists = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ejercicios')"
    );
    
    if (!tableExists.rows[0].exists) {
      // Create the ejercicios table
      await client.query(`
        CREATE TABLE ejercicios (
          id SERIAL PRIMARY KEY,
          pregunta TEXT NOT NULL,
          palabras_clave TEXT[],
          respuestas_aceptables TEXT[],
          dificultad TEXT,
          categoria TEXT,
          pista TEXT
        )
      `);
      console.log('Tabla de ejercicios creada');
      
      // Load seed data
      const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'ejercicios.json'), 'utf8'));
      for (const ejercicio of seedData) {
        await client.query(
          'INSERT INTO ejercicios (pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista) VALUES ($1, $2, $3, $4, $5, $6)',
          [ejercicio.pregunta, ejercicio.keywords, ejercicio.acceptableAnswers, ejercicio.difficulty, ejercicio.category, ejercicio.hint]
        );
      }
      console.log('Datos iniciales cargados');
    } else {
      console.log('La tabla de ejercicios ya existe');
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    client.release();
  }
}

initializeDatabase();

// Fetch all exercises
app.get('/ejercicios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ejercicios');
    console.log('Ejercicios obtenidos:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
  }
});

// Add a new exercise
app.post('/ejercicios', async (req, res) => {
  const { pregunta, palabrasClave, respuestasAceptables, dificultad, categoria, pista } = req.body;
  console.log('Datos del ejercicio recibidos:', req.body);
  try {
    const result = await pool.query(
      'INSERT INTO ejercicios (pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pregunta, palabrasClave, respuestasAceptables, dificultad, categoria, pista]
    );
    const nuevoEjercicio = result.rows[0];
    console.log('Nuevo ejercicio agregado:', nuevoEjercicio);
    res.status(201).json(nuevoEjercicio);
    io.emit('ejercicio_agregado', nuevoEjercicio);
  } catch (error) {
    console.error('Error al agregar ejercicio:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
  }
});

// Update an exercise
app.put('/ejercicios/:id', async (req, res) => {
  const { id } = req.params;
  const { pregunta, palabrasClave, respuestasAceptables, dificultad, categoria, pista } = req.body;
  console.log('Actualizando ejercicio:', id, req.body);
  try {
    const result = await pool.query(
      'UPDATE ejercicios SET pregunta = $1, palabras_clave = $2, respuestas_aceptables = $3, dificultad = $4, categoria = $5, pista = $6 WHERE id = $7 RETURNING *',
      [pregunta, palabrasClave, respuestasAceptables, dificultad, categoria, pista, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    const ejercicioActualizado = result.rows[0];
    console.log('Ejercicio actualizado:', ejercicioActualizado);
    res.json(ejercicioActualizado);
    io.emit('ejercicio_actualizado', ejercicioActualizado);
  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
  }
});

// Delete an exercise
app.delete('/ejercicios/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Eliminando ejercicio:', id);
  try {
    const result = await pool.query('DELETE FROM ejercicios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    const ejercicioEliminado = result.rows[0];
    console.log('Ejercicio eliminado:', ejercicioEliminado);
    res.json(ejercicioEliminado);
    io.emit('ejercicio_eliminado', id);
  } catch (error) {
    console.error('Error al eliminar ejercicio:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
  }
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