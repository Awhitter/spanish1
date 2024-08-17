import React, { useEffect, useCallback, memo } from 'react';
import io from 'socket.io-client';
import './EjerciciosEspanol.css';
import useExerciseManagement from '../hooks/useExerciseManagement';

const socket = io('http://localhost:5000');

// Define missing components
const InputField = memo(({ value, onChange, onKeyPress, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    placeholder={placeholder}
    className="input-field"
  />
));

const ActionButtons = memo(({
  onVerify,
  onHint,
  onReset,
  onSkip,
  onNext,
  showHint,
  showNextButton,
  isLastExercise
}) => (
  <div className="action-buttons">
    <button onClick={onVerify}>Verificar</button>
    <button onClick={onHint} disabled={showHint}>Pista</button>
    <button onClick={onReset}>Reiniciar</button>
    <button onClick={onSkip}>Saltar</button>
    {showNextButton && !isLastExercise && <button onClick={onNext}>Siguiente</button>}
  </div>
));

const FeedbackMessage = memo(({ feedback }) => (
  <p className="feedback">{feedback}</p>
));

const ProgressBar = memo(({ progress }) => (
  <div className="progress-bar">
    <div className="progress" style={{ width: `${progress}%` }}></div>
  </div>
));

const Statistics = memo(({ correct, incorrect, skipped }) => (
  <div className="statistics">
    <p>Correctas: {correct}</p>
    <p>Incorrectas: {incorrect}</p>
    <p>Saltadas: {skipped}</p>
  </div>
));

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