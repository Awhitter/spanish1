import React, { useState, useEffect } from 'react';
import './EjerciciosEspanol.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function EjerciciosEspanol() {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioActual, setEjercicioActual] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [estadisticas, setEstadisticas] = useState({ correctas: 0, incorrectas: 0, saltadas: 0 });
  const [mostrarPista, setMostrarPista] = useState(false);

  useEffect(() => {
    obtenerEjercicios();
  }, []);

  const obtenerEjercicios = async () => {
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
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (ejercicioActual.respuestas_aceptables.includes(respuestaUsuario.toLowerCase().trim())) {
      setRetroalimentacion('¡Correcto!');
      setEstadisticas(prev => ({ ...prev, correctas: prev.correctas + 1 }));
    } else {
      setRetroalimentacion(`Incorrecto. La respuesta correcta es: ${ejercicioActual.respuestas_aceptables.join(' o ')}`);
      setEstadisticas(prev => ({ ...prev, incorrectas: prev.incorrectas + 1 }));
    }
  };

  const manejarSaltar = () => {
    setEstadisticas(prev => ({ ...prev, saltadas: prev.saltadas + 1 }));
    siguienteEjercicio();
  };

  const siguienteEjercicio = () => {
    const siguienteEjercicio = ejercicios[Math.floor(Math.random() * ejercicios.length)];
    setEjercicioActual(siguienteEjercicio);
    setRespuestaUsuario('');
    setRetroalimentacion('');
    setMostrarPista(false);
  };

  const manejarMostrarPista = () => {
    setMostrarPista(true);
  };

  if (!ejercicioActual) {
    return <div>Cargando ejercicios...</div>;
  }

  return (
    <div className="ejercicios-espanol">
      <h2>Ejercicios de Español</h2>
      <div className="contenedor-ejercicio">
        <h3>Nivel: {ejercicioActual.dificultad}</h3>
        <p className="pregunta">{ejercicioActual.pregunta}</p>
        <form onSubmit={manejarEnvio}>
          <input
            type="text"
            value={respuestaUsuario}
            onChange={(e) => setRespuestaUsuario(e.target.value)}
            placeholder="Tu respuesta"
          />
          <button type="submit">Verificar</button>
        </form>
        <button onClick={manejarMostrarPista} disabled={mostrarPista}>Pista</button>
        {mostrarPista && <p className="pista">{ejercicioActual.pista}</p>}
        <button onClick={siguienteEjercicio}>Reiniciar</button>
        <button onClick={manejarSaltar}>Saltar</button>
        {retroalimentacion && <p className="retroalimentacion">{retroalimentacion}</p>}
      </div>
      <div className="estadisticas">
        <p>Ejercicio {ejercicios.indexOf(ejercicioActual) + 1} de {ejercicios.length}</p>
        <p>Correctas: {estadisticas.correctas}</p>
        <p>Incorrectas: {estadisticas.incorrectas}</p>
        <p>Saltadas: {estadisticas.saltadas}</p>
      </div>
    </div>
  );
}

export default EjerciciosEspanol;