import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { CSSTransition } from 'react-transition-group';
import { DarkModeContext } from '../App';
import useExerciseManagement from '../hooks/useExerciseManagement';
import './EjerciciosEspanol.css';

function EjerciciosEspanol() {
  const { darkMode } = useContext(DarkModeContext);
  const {
    ejercicioActual,
    respuestaUsuario,
    retroalimentacion,
    estadisticas,
    mostrarPista,
    error,
    setRespuestaUsuario,
    verificarRespuesta,
    siguienteEjercicio,
    manejarSaltar,
    manejarMostrarPista,
    reiniciarQuiz,
  } = useExerciseManagement();

  const [animacionSalida, setAnimacionSalida] = useState(false);

  const progreso = useMemo(() => {
    const total = estadisticas.correctas + estadisticas.incorrectas + estadisticas.saltadas;
    return total > 0 ? (total / (total + 1)) * 100 : 0;
  }, [estadisticas]);

  const manejarEnvio = useCallback((e) => {
    e.preventDefault();
    verificarRespuesta();
  }, [verificarRespuesta]);

  const manejarSiguienteEjercicio = useCallback(() => {
    setAnimacionSalida(true);
    setTimeout(() => {
      siguienteEjercicio();
      setAnimacionSalida(false);
    }, 300);
  }, [siguienteEjercicio]);

  const manejarTeclas = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      verificarRespuesta();
    } else if (e.key === 'ArrowRight') {
      manejarSiguienteEjercicio();
    } else if (e.key === ' ') {
      e.preventDefault();
      manejarMostrarPista();
    }
  }, [verificarRespuesta, manejarSiguienteEjercicio, manejarMostrarPista]);

  useEffect(() => {
    document.addEventListener('keydown', manejarTeclas);
    return () => {
      document.removeEventListener('keydown', manejarTeclas);
    };
  }, [manejarTeclas]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!ejercicioActual) {
    return <div className="loading">Cargando ejercicios...</div>;
  }

  return (
    <div className={`ejercicios-espanol ${darkMode ? 'dark-mode' : ''}`}>
      <div className="barra-progreso">
        <div className="progreso" style={{ width: `${progreso}%` }}></div>
      </div>
      <CSSTransition
        in={!animacionSalida}
        timeout={300}
        classNames="fade"
        unmountOnExit
      >
        <div className="contenedor-ejercicio">
          <h3>Nivel: {ejercicioActual.dificultad}</h3>
          <p className="pregunta">{ejercicioActual.pregunta}</p>
          <form onSubmit={manejarEnvio}>
            <input
              type="text"
              value={respuestaUsuario}
              onChange={(e) => setRespuestaUsuario(e.target.value)}
              placeholder="Tu respuesta"
              autoFocus
            />
            <button type="submit" className="btn btn-primary">Verificar</button>
          </form>
          <div className="botones-container">
            <button onClick={manejarMostrarPista} disabled={mostrarPista} className="btn btn-secondary">
              Pista
            </button>
            <button onClick={manejarSiguienteEjercicio} className="btn btn-primary">Siguiente</button>
            <button onClick={manejarSaltar} className="btn btn-secondary">Saltar</button>
            <button onClick={reiniciarQuiz} className="btn btn-warning">Reiniciar Quiz</button>
          </div>
          {mostrarPista && <p className="pista">{ejercicioActual.pista}</p>}
          {retroalimentacion && (
            <CSSTransition
              in={!!retroalimentacion}
              timeout={300}
              classNames="feedback"
              unmountOnExit
            >
              <p className={`retroalimentacion ${retroalimentacion.startsWith('¡Correcto!') ? 'correcta' : 'incorrecta'}`}>
                {retroalimentacion}
              </p>
            </CSSTransition>
          )}
        </div>
      </CSSTransition>
      <div className="estadisticas">
        <p>Progreso: {Math.round(progreso)}%</p>
        <p>Correctas: {estadisticas.correctas}</p>
        <p>Incorrectas: {estadisticas.incorrectas}</p>
        <p>Saltadas: {estadisticas.saltadas}</p>
      </div>
    </div>
  );
}

export default React.memo(EjerciciosEspanol);