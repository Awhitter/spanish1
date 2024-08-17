require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
const { neonConfig } = require('@neondatabase/serverless');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const connectionString = process.env.NEON_DB_CONNECTION_STRING;

if (!connectionString) {
  console.error('NEON_DB_CONNECTION_STRING is not set in the environment variables');
  process.exit(1);
}

neonConfig.fetchConnectionCache = true;

const pool = new Pool({ connectionString });

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database', err.stack);
  } else {
    console.log('Connected to the database');
    release();
  }
});

// Fetch all exercises
app.get('/exercises', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exercises');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new exercise
app.post('/exercises', async (req, res) => {
  const { question, answer } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO exercises (question, answer) VALUES ($1, $2) RETURNING *',
      [question, answer]
    );
    const newExercise = result.rows[0];
    res.status(201).json(newExercise);
    io.emit('exercise_added', newExercise);
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
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