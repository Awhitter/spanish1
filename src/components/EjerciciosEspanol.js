import React, { useState, useEffect } from 'react';
import './EjerciciosEspanol.css';

// Function to normalize text (remove extra spaces, lowercase, and remove accents)
function normalizeText(text) {
  return text.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Function to check if the answer is correct
function isAnswerCorrect(userAnswer, acceptableAnswers, keywords) {
  const normalizedUserAnswer = normalizeText(userAnswer);
  
  // Check if the user's answer matches any of the acceptable answers
  const exactMatch = acceptableAnswers.some(answer => normalizeText(answer) === normalizedUserAnswer);
  if (exactMatch) return true;

  // Check if all keywords are present in the user's answer
  const allKeywordsPresent = keywords.every(keyword => 
    normalizedUserAnswer.includes(normalizeText(keyword))
  );

  return allKeywordsPresent;
}

const EjerciciosEspanol = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [feedback, setFeedback] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [mostrarRespuestaCorrecta, setMostrarRespuestaCorrecta] = useState(false);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [respuestasIncorrectas, setRespuestasIncorrectas] = useState(0);
  const [ejerciciosSaltados, setEjerciciosSaltados] = useState(0);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [animateQuestion, setAnimateQuestion] = useState(false);

  useEffect(() => {
    // Load exercises from local storage
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
      setEjercicios(JSON.parse(savedExercises));
    } else {
      // If no exercises in local storage, load from json file
      import('../data/ejercicios.json').then(data => {
        setEjercicios(data.default);
        localStorage.setItem('exercises', JSON.stringify(data.default));
      });
    }
  }, []);

  useEffect(() => {
    setRespuestaUsuario('');
    setFeedback('');
    setIntentos(0);
    setMostrarRespuestaCorrecta(false);
    setMostrarPista(false);
    setAnimateQuestion(true);
    setTimeout(() => setAnimateQuestion(false), 500);
  }, [ejercicioActual]);

  const verificarRespuesta = () => {
    if (respuestaUsuario.trim() === '') {
      setFeedback('Por favor, ingresa tu respuesta.');
      return;
    }

    const ejercicioActualData = ejercicios[ejercicioActual];
    const esCorrecta = isAnswerCorrect(respuestaUsuario, ejercicioActualData.acceptableAnswers, ejercicioActualData.keywords);

    if (esCorrecta) {
      setFeedback('¡Correcto! Muy bien.');
      setMostrarRespuestaCorrecta(true);
      setRespuestasCorrectas(respuestasCorrectas + 1);
    } else {
      setIntentos(intentos + 1);
      if (intentos >= 2) {
        setFeedback(`Incorrecto. Una respuesta correcta es: ${ejercicioActualData.acceptableAnswers[0]}`);
        setMostrarRespuestaCorrecta(true);
        setRespuestasIncorrectas(respuestasIncorrectas + 1);
      } else {
        setFeedback('Incorrecto. Intenta de nuevo.');
      }
    }
  };

  const siguienteEjercicio = () => {
    if (ejercicioActual < ejercicios.length - 1) {
      setEjercicioActual(ejercicioActual + 1);
    } else {
      setFeedback('¡Has completado todos los ejercicios!');
    }
  };

  const saltarEjercicio = () => {
    setEjerciciosSaltados(ejerciciosSaltados + 1);
    siguienteEjercicio();
  };

  const reiniciarEjercicio = () => {
    setRespuestaUsuario('');
    setFeedback('');
    setIntentos(0);
    setMostrarRespuestaCorrecta(false);
    setMostrarPista(false);
  };

  const mostrarPistaHandler = () => {
    setFeedback(`Pista: ${ejercicios[ejercicioActual].hint}`);
    setMostrarPista(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verificarRespuesta();
    }
  };

  const progreso = ((ejercicioActual + 1) / ejercicios.length) * 100;

  if (ejercicios.length === 0) {
    return <div>Loading exercises...</div>;
  }

  return (
    <div className="ejercicios-espanol">
      <h1>Ejercicios de Español</h1>
      <p className="nivel">Nivel: {ejercicios[ejercicioActual].difficulty}</p>
      <div className={`ejercicio ${animateQuestion ? 'animate-question' : ''}`}>
        <p className="pregunta">{ejercicios[ejercicioActual].pregunta}</p>
        <input
          type="text"
          value={respuestaUsuario}
          onChange={(e) => setRespuestaUsuario(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tu respuesta"
        />
        <div className="botones-respuesta">
          <button onClick={verificarRespuesta} className="verificar">
            Verificar
          </button>
          <button onClick={mostrarPistaHandler} className="pista" disabled={mostrarPista}>
            Pista
          </button>
        </div>
        {feedback && (
          <p className={`feedback ${feedback.includes('Correcto') ? 'correcto' : 'incorrecto'}`}>
            {feedback}
          </p>
        )}
        <div className="progreso-container">
          <div className="progreso-bar" style={{ width: `${progreso}%` }}></div>
        </div>
        <p className="contador">
          Ejercicio {ejercicioActual + 1} de {ejercicios.length}
        </p>
      </div>
      <div className="botones">
        <button onClick={reiniciarEjercicio} className="reiniciar">
          Reiniciar
        </button>
        <button onClick={saltarEjercicio} className="saltar">
          Saltar
        </button>
        <button 
          onClick={siguienteEjercicio} 
          disabled={!mostrarRespuestaCorrecta || ejercicioActual === ejercicios.length - 1}
          className="siguiente"
        >
          Siguiente
        </button>
      </div>
      <div className="estadisticas">
        <p>Correctas: {respuestasCorrectas}</p>
        <p>Incorrectas: {respuestasIncorrectas}</p>
        <p>Saltadas: {ejerciciosSaltados}</p>
      </div>
    </div>
  );
};

export default EjerciciosEspanol;