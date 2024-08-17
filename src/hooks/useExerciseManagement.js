import { useState, useEffect, useCallback } from 'react';
import { isAnswerCorrect } from '../utils/textUtils';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const useExerciseManagement = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [feedback, setFeedback] = useState('');
  const [mostrarRespuestaCorrecta, setMostrarRespuestaCorrecta] = useState(false);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [animateQuestion, setAnimateQuestion] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    respuestasCorrectas: 0,
    respuestasIncorrectas: 0,
    ejerciciosSaltados: 0,
    currentExercise: 1,
    totalExercises: 0,
  });

  const fetchExercises = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/exercises');
      const data = await response.json();
      setEjercicios(data);
      setEstadisticas(prev => ({ ...prev, totalExercises: data.length }));
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  }, []);

  useEffect(() => {
    fetchExercises();

    socket.on('exercise_added', (newExercise) => {
      setEjercicios(prevEjercicios => [...prevEjercicios, newExercise]);
      setEstadisticas(prev => ({ ...prev, totalExercises: prev.totalExercises + 1 }));
    });

    return () => {
      socket.off('exercise_added');
    };
  }, [fetchExercises]);

  const handleInputChange = (e) => {
    setRespuestaUsuario(e.target.value);
  };

  const verificarRespuesta = () => {
    const ejercicio = ejercicios[ejercicioActual];
    if (isAnswerCorrect(respuestaUsuario, ejercicio.acceptableAnswers)) {
      setFeedback('¡Correcto!');
      setEstadisticas(prev => ({ ...prev, respuestasCorrectas: prev.respuestasCorrectas + 1 }));
      setMostrarRespuestaCorrecta(true);
    } else {
      setFeedback(`Incorrecto. La respuesta correcta es: ${ejercicio.acceptableAnswers[0]}`);
      setEstadisticas(prev => ({ ...prev, respuestasIncorrectas: prev.respuestasIncorrectas + 1 }));
      setMostrarRespuestaCorrecta(true);
    }
  };

  const mostrarPistaHandler = () => {
    setMostrarPista(true);
  };

  const siguienteEjercicio = () => {
    if (ejercicioActual < ejercicios.length - 1) {
      setEjercicioActual(prev => prev + 1);
      setRespuestaUsuario('');
      setFeedback('');
      setMostrarRespuestaCorrecta(false);
      setMostrarPista(false);
      setAnimateQuestion(true);
      setEstadisticas(prev => ({ ...prev, currentExercise: prev.currentExercise + 1 }));
      setTimeout(() => setAnimateQuestion(false), 500);
    }
  };

  const saltarEjercicio = () => {
    setEstadisticas(prev => ({ ...prev, ejerciciosSaltados: prev.ejerciciosSaltados + 1 }));
    siguienteEjercicio();
  };

  const reiniciarEjercicio = () => {
    setRespuestaUsuario('');
    setFeedback('');
    setMostrarRespuestaCorrecta(false);
    setMostrarPista(false);
  };

  const progreso = (ejercicioActual / ejercicios.length) * 100;

  return {
    ejercicio: ejercicios[ejercicioActual],
    respuestaUsuario,
    feedback,
    mostrarRespuestaCorrecta,
    mostrarPista,
    animateQuestion,
    estadisticas,
    progreso,
    handleInputChange,
    verificarRespuesta,
    mostrarPistaHandler,
    siguienteEjercicio,
    saltarEjercicio,
    reiniciarEjercicio,
    fetchExercises,
  };
};

export default useExerciseManagement;