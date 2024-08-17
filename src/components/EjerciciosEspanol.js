import React, { useState, useEffect, useCallback, memo } from 'react';
import io from 'socket.io-client';
import './EjerciciosEspanol.css';
import { isAnswerCorrect } from '../utils/textUtils';
import useExerciseManagement from '../hooks/useExerciseManagement';

const socket = io('http://localhost:5000');

// ... (keep all the existing components: InputField, FeedbackMessage, ProgressBar, ActionButtons, Statistics)

const EjerciciosEspanol = () => {
  const {
    ejercicio,
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
  } = useExerciseManagement();

  useEffect(() => {
    fetchExercises();

    socket.on('exercise_added', (newExercise) => {
      console.log('New exercise added:', newExercise);
      fetchExercises(); // Refresh exercises when a new one is added
    });

    return () => {
      socket.off('exercise_added');
    };
  }, [fetchExercises]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verificarRespuesta();
    }
  }, [verificarRespuesta]);

  if (!ejercicio) {
    return <div>Loading exercises...</div>;
  }

  return (
    <div className="ejercicios-espanol">
      <h1>Ejercicios de Español</h1>
      <p className="nivel">Nivel: {ejercicio.difficulty}</p>
      <div className={`ejercicio ${animateQuestion ? 'animate-question' : ''}`}>
        <p className="pregunta">{ejercicio.pregunta}</p>
        <InputField
          value={respuestaUsuario}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Tu respuesta"
        />
        <ActionButtons
          onVerify={verificarRespuesta}
          onHint={mostrarPistaHandler}
          onReset={reiniciarEjercicio}
          onSkip={saltarEjercicio}
          onNext={siguienteEjercicio}
          showHint={mostrarPista}
          showNextButton={mostrarRespuestaCorrecta}
          isLastExercise={progreso === 100}
        />
        {feedback && <FeedbackMessage feedback={feedback} />}
        <ProgressBar progress={progreso} />
        <p className="contador">Ejercicio {estadisticas.currentExercise} de {estadisticas.totalExercises}</p>
      </div>
      <Statistics
        correct={estadisticas.respuestasCorrectas}
        incorrect={estadisticas.respuestasIncorrectas}
        skipped={estadisticas.ejerciciosSaltados}
      />
    </div>
  );
};

export default EjerciciosEspanol;