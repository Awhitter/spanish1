import React, { useState, useEffect } from 'react';
import './EjerciciosEspanol.css';
import ejerciciosData from '../data/ejercicios.json';

// Levenshtein distance function for approximate string matching
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

const EjerciciosEspanol = () => {
  const [ejercicios] = useState(ejerciciosData);
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [feedback, setFeedback] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [mostrarRespuestaCorrecta, setMostrarRespuestaCorrecta] = useState(false);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [respuestasIncorrectas, setRespuestasIncorrectas] = useState(0);
  const [ejerciciosSaltados, setEjerciciosSaltados] = useState(0);
  const [mostrarPista, setMostrarPista] = useState(false);

  useEffect(() => {
    setRespuestaUsuario('');
    setFeedback('');
    setIntentos(0);
    setMostrarRespuestaCorrecta(false);
    setMostrarPista(false);
  }, [ejercicioActual]);

  const verificarRespuesta = () => {
    if (respuestaUsuario.trim() === '') {
      setFeedback('Por favor, ingresa tu respuesta.');
      return;
    }

    const respuestaCorrecta = ejercicios[ejercicioActual].respuesta.toLowerCase();
    const respuestaUsuarioLower = respuestaUsuario.toLowerCase();

    // Check for exact match or permutation
    const esCorrecta = respuestaCorrecta === respuestaUsuarioLower ||
      respuestaCorrecta.split(' ').sort().join(' ') === respuestaUsuarioLower.split(' ').sort().join(' ');

    // Check for approximate match
    const distancia = levenshteinDistance(respuestaCorrecta, respuestaUsuarioLower);
    const esAproximada = distancia <= 2;

    if (esCorrecta || esAproximada) {
      setFeedback(esCorrecta ? '¡Correcto! Muy bien.' : '¡Casi! Tu respuesta es muy cercana a la correcta.');
      setMostrarRespuestaCorrecta(true);
      setRespuestasCorrectas(respuestasCorrectas + 1);
    } else {
      setIntentos(intentos + 1);
      if (intentos >= 2) {
        setFeedback(`Incorrecto. La respuesta correcta es: ${respuestaCorrecta}`);
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
    const respuestaCorrecta = ejercicios[ejercicioActual].respuesta;
    const pista = respuestaCorrecta.split(' ').map(word => word[0] + '_'.repeat(word.length - 1)).join(' ');
    setFeedback(`Pista: ${pista}`);
    setMostrarPista(true);
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
        <div className="botones-respuesta">
          <button onClick={verificarRespuesta} className="verificar">
            Verificar
          </button>
          <button onClick={mostrarPistaHandler} className="pista" disabled={mostrarPista}>
            Pista
          </button>
        </div>
        {feedback && (
          <p className={`feedback ${feedback.includes('Correcto') || feedback.includes('Casi') ? 'correcto' : 'incorrecto'}`}>
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