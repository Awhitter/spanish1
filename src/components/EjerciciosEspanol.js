import React, { useState, useEffect } from 'react';
import './EjerciciosEspanol.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function EjerciciosEspanol() {
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/exercises`);
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      const data = await response.json();
      setExercises(data);
      if (data.length > 0) {
        setCurrentExercise(data[Math.floor(Math.random() * data.length)]);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentExercise.acceptableAnswers.includes(userAnswer.toLowerCase().trim())) {
      setFeedback('¡Correcto!');
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setFeedback(`Incorrecto. La respuesta correcta es: ${currentExercise.acceptableAnswers.join(' o ')}`);
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const handleSkip = () => {
    setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    nextExercise();
  };

  const nextExercise = () => {
    const nextExercise = exercises[Math.floor(Math.random() * exercises.length)];
    setCurrentExercise(nextExercise);
    setUserAnswer('');
    setFeedback('');
  };

  if (!currentExercise) {
    return <div>Cargando ejercicios...</div>;
  }

  return (
    <div className="ejercicios-espanol">
      <h2>Ejercicios de Español</h2>
      <div className="exercise-container">
        <h3>Nivel: {currentExercise.difficulty}</h3>
        <p className="question">{currentExercise.pregunta}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Tu respuesta"
          />
          <button type="submit">Verificar</button>
        </form>
        <button onClick={handleSkip}>Pista</button>
        <button onClick={nextExercise}>Reiniciar</button>
        <button onClick={handleSkip}>Saltar</button>
        {feedback && <p className="feedback">{feedback}</p>}
      </div>
      <div className="stats">
        <p>Ejercicio {exercises.indexOf(currentExercise) + 1} de {exercises.length}</p>
        <p>Correctas: {stats.correct}</p>
        <p>Incorrectas: {stats.incorrect}</p>
        <p>Saltadas: {stats.skipped}</p>
      </div>
    </div>
  );
}

export default EjerciciosEspanol;