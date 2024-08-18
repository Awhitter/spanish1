import React, { useState, useEffect, useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import './EjerciciosEspanol.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function EjerciciosEspanol() {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioActual, setEjercicioActual] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [estadisticas, setEstadisticas] = useState({ correctas: 0, incorrectas: 0, saltadas: 0 });
  const [mostrarPista, setMostrarPista] = useState(false);
  const [animacionSalida, setAnimacionSalida] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const obtenerEjercicios = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios`);
      if (!response.ok) {
        throw new Error('No se pudieron obtener los ejercicios');
      }
      const data = await response.json();
      setEjercicios(data);
      if (data.length > 0) {
        setEjercicioActual(data[Math.floor(Math.random() * data.length)]);
      }
    } catch (error) {
      console.error('Error al obtener ejercicios:', error);
    }
  }, []);

  useEffect(() => {
    obtenerEjercicios();
  }, [obtenerEjercicios]);

  useEffect(() => {
    if (ejercicios.length > 0) {
      setProgreso((estadisticas.correctas + estadisticas.incorrectas + estadisticas.saltadas) / ejercicios.length * 100);
    }
  }, [estadisticas, ejercicios]);

  const verificarRespuesta = useCallback(() => {
    if (ejercicioActual.respuestas_aceptables.includes(respuestaUsuario.toLowerCase().trim())) {
      setRetroalimentacion('¡Correcto!');
      setEstadisticas(prev => ({ ...prev, correctas: prev.correctas + 1 }));
    } else {
      setRetroalimentacion(`Incorrecto. La respuesta correcta es: ${ejercicioActual.respuestas_aceptables.join(' o ')}`);
      setEstadisticas(prev => ({ ...prev, incorrectas: prev.incorrectas + 1 }));
    }
  }, [ejercicioActual, respuestaUsuario]);

  const manejarEnvio = useCallback((e) => {
    e.preventDefault();
    verificarRespuesta();
  }, [verificarRespuesta]);

  const siguienteEjercicio = useCallback(() => {
    setAnimacionSalida(true);
    setTimeout(() => {
      const siguienteEjercicio = ejercicios[Math.floor(Math.random() * ejercicios.length)];
      setEjercicioActual(siguienteEjercicio);
      setRespuestaUsuario('');
      setRetroalimentacion('');
      setMostrarPista(false);
      setAnimacionSalida(false);
    }, 300);
  }, [ejercicios]);

  const manejarSaltar = useCallback(() => {
    setEstadisticas(prev => ({ ...prev, saltadas: prev.saltadas + 1 }));
    siguienteEjercicio();
  }, [siguienteEjercicio]);

  const manejarMostrarPista = useCallback(() => {
    setMostrarPista(true);
  }, []);

  const reiniciarQuiz = useCallback(() => {
    setEstadisticas({ correctas: 0, incorrectas: 0, saltadas: 0 });
    siguienteEjercicio();
  }, [siguienteEjercicio]);

  const manejarTeclas = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      verificarRespuesta();
    } else if (e.key === 'ArrowRight') {
      siguienteEjercicio();
    } else if (e.key === ' ') {
      e.preventDefault();
      manejarMostrarPista();
    }
  }, [verificarRespuesta, siguienteEjercicio, manejarMostrarPista]);

  useEffect(() => {
    document.addEventListener('keydown', manejarTeclas);
    return () => {
      document.removeEventListener('keydown', manejarTeclas);
    };
  }, [manejarTeclas]);

  const toggleModoOscuro = useCallback(() => {
    setModoOscuro(prev => !prev);
  }, []);

  if (!ejercicioActual) {
    return <div>Cargando ejercicios...</div>;
  }

  return (
    <div className={`ejercicios-espanol ${modoOscuro ? 'modo-oscuro' : ''}`}>
      <h2>Ejercicios de Español</h2>
      <button onClick={toggleModoOscuro} className="toggle-modo-oscuro">
        {modoOscuro ? '☀️' : '🌙'}
      </button>
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
            <button onClick={siguienteEjercicio} className="btn btn-primary">Siguiente</button>
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

export default EjerciciosEspanol;