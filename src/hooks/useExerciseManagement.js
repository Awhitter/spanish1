import { useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function useExerciseManagement() {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioActual, setEjercicioActual] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [estadisticas, setEstadisticas] = useState({ correctas: 0, incorrectas: 0, saltadas: 0 });
  const [mostrarPista, setMostrarPista] = useState(false);
  const [error, setError] = useState(null);

  const obtenerEjercicios = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios`);
      if (!response.ok) {
        throw new Error('No se pudieron obtener los ejercicios');
      }
      const data = await response.json();
      if (data.length > 0) {
        setEjercicios(data);
        setEjercicioActual(data[Math.floor(Math.random() * data.length)]);
      } else {
        setError('No hay ejercicios disponibles. Por favor, añade algunos ejercicios en la página de administración.');
      }
    } catch (error) {
      console.error('Error al obtener ejercicios:', error);
      setError('Error al cargar los ejercicios. Por favor, intente de nuevo más tarde.');
    }
  }, []);

  useEffect(() => {
    obtenerEjercicios();
  }, [obtenerEjercicios]);

  const verificarRespuesta = useCallback(() => {
    if (!ejercicioActual || !ejercicioActual.respuestas_aceptables) {
      setError('Error: El ejercicio actual no es válido. Por favor, contacte al administrador.');
      return;
    }

    const respuestasAceptables = ejercicioActual.respuestas_aceptables.split(',').map(r => r.trim());

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
    const siguienteEjercicio = ejercicios[Math.floor(Math.random() * ejercicios.length)];
    setEjercicioActual(siguienteEjercicio);
    setRespuestaUsuario('');
    setRetroalimentacion('');
    setMostrarPista(false);
    setError(null);
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

  return {
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
  };
}

export default useExerciseManagement;