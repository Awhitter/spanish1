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
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exercises')"
    );
    
    if (!tableExists.rows[0].exists) {
      // Create the exercises table
      await client.query(`
        CREATE TABLE exercises (
          id SERIAL PRIMARY KEY,
          pregunta TEXT NOT NULL,
          keywords TEXT[],
          acceptable_answers TEXT[],
          difficulty TEXT,
          category TEXT,
          hint TEXT
        )
      `);
      console.log('Exercises table created');
      
      // Load seed data
      const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'ejercicios.json'), 'utf8'));
      for (const exercise of seedData) {
        await client.query(
          'INSERT INTO exercises (pregunta, keywords, acceptable_answers, difficulty, category, hint) VALUES ($1, $2, $3, $4, $5, $6)',
          [exercise.pregunta, exercise.keywords, exercise.acceptableAnswers, exercise.difficulty, exercise.category, exercise.hint]
        );
      }
      console.log('Seed data loaded');
    } else {
      console.log('Exercises table already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

initializeDatabase();

// Fetch all exercises
app.get('/exercises', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exercises');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Add a new exercise
app.post('/exercises', async (req, res) => {
  const { pregunta, keywords, acceptableAnswers, difficulty, category, hint } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO exercises (pregunta, keywords, acceptable_answers, difficulty, category, hint) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pregunta, keywords, acceptableAnswers, difficulty, category, hint]
    );
    const newExercise = result.rows[0];
    res.status(201).json(newExercise);
    io.emit('exercise_added', newExercise);
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update an exercise
app.put('/exercises/:id', async (req, res) => {
  const { id } = req.params;
  const { pregunta, keywords, acceptableAnswers, difficulty, category, hint } = req.body;
  try {
    const result = await pool.query(
      'UPDATE exercises SET pregunta = $1, keywords = $2, acceptable_answers = $3, difficulty = $4, category = $5, hint = $6 WHERE id = $7 RETURNING *',
      [pregunta, keywords, acceptableAnswers, difficulty, category, hint, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    const updatedExercise = result.rows[0];
    res.json(updatedExercise);
    io.emit('exercise_updated', updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Delete an exercise
app.delete('/exercises/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM exercises WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    const deletedExercise = result.rows[0];
    res.json(deletedExercise);
    io.emit('exercise_deleted', id);
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});