import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './AdminPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function AdminPage() {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioEditando, setEjercicioEditando] = useState(null);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({
    pregunta: '',
    palabrasClave: [],
    respuestasAceptables: [],
    dificultad: 'fácil',
    categoria: '',
    pista: ''
  });
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

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
      console.log('Ejercicios obtenidos:', data);
      setEjercicios(data);
    } catch (error) {
      console.error('Error al obtener ejercicios:', error);
      setMensajeError('No se pudieron obtener los ejercicios. Por favor, inténtelo de nuevo.');
    }
  };

  const manejarCambioInput = (e, campo) => {
    if (campo === 'palabrasClave' || campo === 'respuestasAceptables') {
      setNuevoEjercicio({
        ...nuevoEjercicio,
        [campo]: e.target.value.split(',').map(item => item.trim())
      });
    } else {
      setNuevoEjercicio({
        ...nuevoEjercicio,
        [campo]: e.target.value
      });
    }
  };

  const agregarEjercicioAPI = async (ejercicio) => {
    console.log('Enviando datos del ejercicio:', ejercicio);
    const response = await fetch(`${BACKEND_URL}/ejercicios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ejercicio),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo agregar el ejercicio');
    }
    return await response.json();
  };

  const manejarAgregarEjercicio = async () => {
    if (nuevoEjercicio.pregunta.trim() === '' || nuevoEjercicio.respuestasAceptables.length === 0) {
      setMensajeError('Por favor, ingrese tanto la pregunta como al menos una respuesta aceptable.');
      return;
    }
    try {
      const ejercicioAgregado = await agregarEjercicioAPI(nuevoEjercicio);
      console.log('Ejercicio agregado:', ejercicioAgregado);
      setEjercicios([...ejercicios, ejercicioAgregado]);
      setNuevoEjercicio({
        pregunta: '',
        palabrasClave: [],
        respuestasAceptables: [],
        dificultad: 'fácil',
        categoria: '',
        pista: ''
      });
      setMensajeExito('¡Ejercicio agregado con éxito!');
      setMensajeError('');
    } catch (error) {
      console.error('Error al agregar ejercicio:', error);
      setMensajeError(`No se pudo agregar el ejercicio: ${error.message}`);
    }
  };

  const manejarEditarEjercicio = (ejercicio) => {
    setEjercicioEditando(ejercicio);
  };

  const manejarActualizarEjercicio = async () => {
    try {
      console.log('Actualizando ejercicio:', ejercicioEditando);
      const response = await fetch(`${BACKEND_URL}/ejercicios/${ejercicioEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ejercicioEditando),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo actualizar el ejercicio');
      }
      const ejercicioActualizado = await response.json();
      console.log('Ejercicio actualizado:', ejercicioActualizado);
      setEjercicios(ejercicios.map(ej => ej.id === ejercicioActualizado.id ? ejercicioActualizado : ej));
      setEjercicioEditando(null);
      setMensajeExito('¡Ejercicio actualizado con éxito!');
      setMensajeError('');
    } catch (error) {
      console.error('Error al actualizar ejercicio:', error);
      setMensajeError(`No se pudo actualizar el ejercicio: ${error.message}`);
    }
  };

  const manejarEliminarEjercicio = async (id) => {
    try {
      console.log('Eliminando ejercicio:', id);
      const response = await fetch(`${BACKEND_URL}/ejercicios/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo eliminar el ejercicio');
      }
      setEjercicios(ejercicios.filter(ej => ej.id !== id));
      setMensajeExito('¡Ejercicio eliminado con éxito!');
      setMensajeError('');
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error);
      setMensajeError(`No se pudo eliminar el ejercicio: ${error.message}`);
    }
  };

  const manejarSubirArchivo = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      const formattedData = data.map(item => ({
        pregunta: item.pregunta,
        palabrasClave: item.palabrasClave ? item.palabrasClave.split(',').map(k => k.trim()) : [],
        respuestasAceptables: item.respuestasAceptables ? item.respuestasAceptables.split(',').map(a => a.trim()) : [],
        dificultad: item.dificultad || 'fácil',
        categoria: item.categoria || '',
        pista: item.pista || ''
      }));
      
      let addedCount = 0;
      let errorCount = 0;
      for (const ejercicio of formattedData) {
        try {
          await agregarEjercicioAPI(ejercicio);
          addedCount++;
        } catch (error) {
          console.error('Error al agregar ejercicio desde archivo:', error);
          errorCount++;
        }
      }
      obtenerEjercicios();
      setMensajeExito(`Se agregaron ${addedCount} ejercicios con éxito.`);
      if (errorCount > 0) {
        setMensajeError(`No se pudieron agregar ${errorCount} ejercicios. Revise la consola para más detalles.`);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="admin-page">
      <h2>Página de Administración</h2>
      {mensajeError && <div className="error-message">{mensajeError}</div>}
      {mensajeExito && <div className="success-message">{mensajeExito}</div>}
      <h3>Agregar Nuevo Ejercicio</h3>
      <div className="form-group">
        <label>Pregunta:</label>
        <input
          type="text"
          value={nuevoEjercicio.pregunta}
          onChange={(e) => manejarCambioInput(e, 'pregunta')}
        />
      </div>
      <div className="form-group">
        <label>Palabras Clave (separadas por comas):</label>
        <input
          type="text"
          value={nuevoEjercicio.palabrasClave.join(', ')}
          onChange={(e) => manejarCambioInput(e, 'palabrasClave')}
        />
      </div>
      <div className="form-group">
        <label>Respuestas Aceptables (separadas por comas):</label>
        <input
          type="text"
          value={nuevoEjercicio.respuestasAceptables.join(', ')}
          onChange={(e) => manejarCambioInput(e, 'respuestasAceptables')}
        />
      </div>
      <div className="form-group">
        <label>Dificultad:</label>
        <select
          value={nuevoEjercicio.dificultad}
          onChange={(e) => manejarCambioInput(e, 'dificultad')}
        >
          <option value="fácil">Fácil</option>
          <option value="medio">Medio</option>
          <option value="difícil">Difícil</option>
        </select>
      </div>
      <div className="form-group">
        <label>Categoría:</label>
        <input
          type="text"
          value={nuevoEjercicio.categoria}
          onChange={(e) => manejarCambioInput(e, 'categoria')}
        />
      </div>
      <div className="form-group">
        <label>Pista:</label>
        <input
          type="text"
          value={nuevoEjercicio.pista}
          onChange={(e) => manejarCambioInput(e, 'pista')}
        />
      </div>
      <button onClick={manejarAgregarEjercicio}>Agregar Ejercicio</button>

      <h3>Subir Archivo Excel</h3>
      <input type="file" accept=".xlsx, .xls" onChange={manejarSubirArchivo} />

      <h3>Ejercicios Actuales</h3>
      <ul>
        {ejercicios.map((ejercicio) => (
          <li key={ejercicio.id}>
            {ejercicioEditando && ejercicioEditando.id === ejercicio.id ? (
              <>
                <div className="form-group">
                  <label>Pregunta:</label>
                  <input
                    value={ejercicioEditando.pregunta}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, pregunta: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Palabras Clave:</label>
                  <input
                    value={ejercicioEditando.palabras_clave ? ejercicioEditando.palabras_clave.join(', ') : ''}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, palabras_clave: e.target.value.split(',').map(k => k.trim())})}
                  />
                </div>
                <div className="form-group">
                  <label>Respuestas Aceptables:</label>
                  <input
                    value={ejercicioEditando.respuestas_aceptables ? ejercicioEditando.respuestas_aceptables.join(', ') : ''}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, respuestas_aceptables: e.target.value.split(',').map(a => a.trim())})}
                  />
                </div>
                <div className="form-group">
                  <label>Dificultad:</label>
                  <select
                    value={ejercicioEditando.dificultad}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, dificultad: e.target.value})}
                  >
                    <option value="fácil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="difícil">Difícil</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Categoría:</label>
                  <input
                    value={ejercicioEditando.categoria}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, categoria: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Pista:</label>
                  <input
                    value={ejercicioEditando.pista}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, pista: e.target.value})}
                  />
                </div>
                <button onClick={manejarActualizarEjercicio}>Actualizar</button>
              </>
            ) : (
              <>
                <span>
                  <strong>Pregunta:</strong> {ejercicio.pregunta}<br />
                  <strong>Respuestas Aceptables:</strong> {ejercicio.respuestas_aceptables ? ejercicio.respuestas_aceptables.join(', ') : ''}<br />
                  <strong>Dificultad:</strong> {ejercicio.dificultad}<br />
                  <strong>Categoría:</strong> {ejercicio.categoria}<br />
                  <strong>Pista:</strong> {ejercicio.pista}
                </span>
                <button onClick={() => manejarEditarEjercicio(ejercicio)}>Editar</button>
                <button onClick={() => manejarEliminarEjercicio(ejercicio.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPage;