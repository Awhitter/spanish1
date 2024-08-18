import { useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function useExerciseManagement(moduleId) {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioActual, setEjercicioActual] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [estadisticas, setEstadisticas] = useState({ correctas: 0, incorrectas: 0, saltadas: 0 });
  const [mostrarPista, setMostrarPista] = useState(false);
  const [error, setError] = useState(null);

  const obtenerEjerciciosPorModulo = useCallback(async (moduleId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios?modulo=${encodeURIComponent(moduleId)}`);
      if (!response.ok) {
        throw new Error('No se pudieron obtener los ejercicios');
      }
      const data = await response.json();
      if (data.length > 0) {
        setEjercicios(data);
        setEjercicioActual(data[Math.floor(Math.random() * data.length)]);
      } else {
        setError('No hay ejercicios disponibles en este módulo. Por favor, añade algunos ejercicios en la página de administración.');
      }
    } catch (error) {
      setError('Error al cargar los ejercicios. Por favor, intente de nuevo más tarde.');
    }
  }, []);

  useEffect(() => {
    if (moduleId) {
      obtenerEjerciciosPorModulo(moduleId);
    }
  }, [moduleId, obtenerEjerciciosPorModulo]);

  const verificarRespuesta = useCallback(() => {
    if (!ejercicioActual || !ejercicioActual.respuestas_aceptables) {
      setError('Error: El ejercicio actual no es válido. Por favor, contacte al administrador.');
      return;
    }

    const respuestasAceptables = ejercicioActual.respuestas_aceptables.split(',').map(r => r.trim());

    if (respuestasAceptables.length === 0) {
      setError('Error: No hay respuestas aceptables definidas para este ejercicio.');
      return;
    }

    const respuestaUsuarioNormalizada = respuestaUsuario.toLowerCase().trim();
    const respuestasAceptablesNormalizadas = respuestasAceptables.map(respuesta => 
      respuesta.toLowerCase().trim()
    );

    if (respuestasAceptablesNormalizadas.includes(respuestaUsuarioNormalizada)) {
      setRetroalimentacion('¡Correcto!');
      setEstadisticas(prev => ({ ...prev, correctas: prev.correctas + 1 }));
    } else {
      setRetroalimentacion(`Incorrecto. La respuesta correcta es: ${respuestasAceptables.join(' o ')}`);
      setEstadisticas(prev => ({ ...prev, incorrectas: prev.incorrectas + 1 }));
    }
  }, [ejercicioActual, respuestaUsuario]);

  const siguienteEjercicio = useCallback(() => {
    const ejerciciosRestantes = ejercicios.filter(ej => ej.id !== ejercicioActual.id);
    if (ejerciciosRestantes.length > 0) {
      const siguienteEjercicio = ejerciciosRestantes[Math.floor(Math.random() * ejerciciosRestantes.length)];
      setEjercicioActual(siguienteEjercicio);
    } else {
      setEjercicioActual(null);
    }
    setRespuestaUsuario('');
    setRetroalimentacion('');
    setMostrarPista(false);
    setError(null);
  }, [ejercicios, ejercicioActual]);

  const manejarSaltar = useCallback(() => {
    setEstadisticas(prev => ({ ...prev, saltadas: prev.saltadas + 1 }));
    siguienteEjercicio();
  }, [siguienteEjercicio]);

  const manejarMostrarPista = useCallback(() => setMostrarPista(true), []);

  const reiniciarQuiz = useCallback(() => {
    setEstadisticas({ correctas: 0, incorrectas: 0, saltadas: 0 });
    if (ejercicios.length > 0) {
      setEjercicioActual(ejercicios[Math.floor(Math.random() * ejercicios.length)]);
    }
    setRespuestaUsuario('');
    setRetroalimentacion('');
    setMostrarPista(false);
    setError(null);
  }, [ejercicios]);

  return {
    ejercicios,
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
    obtenerEjerciciosPorModulo,
  };
}

export default useExerciseManagement;