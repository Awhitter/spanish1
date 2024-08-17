import React, { useState, useEffect } from 'react';
import './EjerciciosEspanol.css';
import ejerciciosData from '../data/ejercicios.json';

const EjerciciosEspanol = () => {
  const [ejercicios] = useState(ejerciciosData);
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [feedback, setFeedback] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [mostrarRespuestaCorrecta, setMostrarRespuestaCorrecta] = useState(false);

  useEffect(() => {
    setRespuestaUsuario('');
    setFeedback('');
    setIntentos(0);
    setMostrarRespuestaCorrecta(false);
  }, [ejercicioActual]);

  const verificarRespuesta = () => {
    if (respuestaUsuario.trim() === '') {
      setFeedback('Por favor, ingresa tu respuesta.');
      return;
    }

    const respuestaCorrecta = ejercicios[ejercicioActual].respuesta;
    if (respuestaUsuario.toLowerCase().trim() === respuestaCorrecta) {
      setFeedback('¡Correcto! Muy bien.');
      setMostrarRespuestaCorrecta(true);
    } else {
      setIntentos(intentos + 1);
      if (intentos >= 2) {
        setFeedback(`Incorrecto. La respuesta correcta es: ${respuestaCorrecta}`);
        setMostrarRespuestaCorrecta(true);
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

  const reiniciarEjercicio = () => {
    setRespuestaUsuario('');
    setFeedback('');
    setIntentos(0);
    setMostrarRespuestaCorrecta(false);
  };

  const progreso = ((ejercicioActual + 1) / ejercicios.length) * 100;

  return (
    <div className="ejercicios-espanol">
      <h1>Ejercicios de Español</h1>
      <p className="nivel">Nivel: Principiante</p>
      <div className="ejercicio">
        <p className="pregunta">{ejercicios[ejercicioActual].pregunta}</p>
        <input
          type="text"
          value={respuestaUsuario}
          onChange={(e) => setRespuestaUsuario(e.target.value)}
          placeholder="Tu respuesta"
        />
        <button onClick={verificarRespuesta} className="verificar">
          Verificar
        </button>
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
        <button 
          onClick={siguienteEjercicio} 
          disabled={!mostrarRespuestaCorrecta || ejercicioActual === ejercicios.length - 1}
          className="siguiente"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default EjerciciosEspanol;