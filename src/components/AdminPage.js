import React, { useState, useEffect, useCallback, useContext } from 'react';
import { DarkModeContext } from '../App';
import './AdminPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const ADMIN_PASSWORD = 'hoje papa';
const ITEMS_PER_PAGE = 10;

function AdminPage() {
  const { darkMode } = useContext(DarkModeContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioEditando, setEjercicioEditando] = useState(null);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({
    pregunta: '',
    palabras_clave: '',
    respuestas_aceptables: '',
    dificultad: 'fácil',
    categoria: '',
    pista: ''
  });
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [filtro, setFiltro] = useState('');
  const [filtroDificultad, setFiltroDificultad] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [ejercicioToDelete, setEjercicioToDelete] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      obtenerEjercicios();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password.toLowerCase() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMensajeError('');
    } else {
      setMensajeError('Contraseña incorrecta');
      setShowHint(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setShowHint(false);
  };

  const obtenerEjercicios = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios`);
      if (!response.ok) {
        throw new Error('No se pudieron obtener los ejercicios');
      }
      const data = await response.json();
      setEjercicios(data);
    } catch (error) {
      console.error('Error al obtener ejercicios:', error);
      setMensajeError('No se pudieron obtener los ejercicios. Por favor, inténtelo de nuevo.');
    }
  };

  const manejarCambioInput = (e, campo) => {
    setNuevoEjercicio({
      ...nuevoEjercicio,
      [campo]: e.target.value
    });
  };

  const agregarEjercicioAPI = async (ejercicio) => {
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
    if (nuevoEjercicio.pregunta.trim() === '' || nuevoEjercicio.respuestas_aceptables.trim() === '') {
      setMensajeError('Por favor, ingrese tanto la pregunta como al menos una respuesta aceptable.');
      return;
    }
    try {
      const ejercicioAgregado = await agregarEjercicioAPI(nuevoEjercicio);
      setEjercicios([...ejercicios, ejercicioAgregado]);
      setNuevoEjercicio({
        pregunta: '',
        palabras_clave: '',
        respuestas_aceptables: '',
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
    setEjercicioEditando({
      ...ejercicio,
      palabras_clave: ejercicio.palabras_clave || '',
      respuestas_aceptables: ejercicio.respuestas_aceptables || ''
    });
  };

  const manejarActualizarEjercicio = useCallback(async (ejercicioActualizado) => {
    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios/${ejercicioActualizado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ejercicioActualizado),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo actualizar el ejercicio');
      }
      const ejercicioActualizadoResponse = await response.json();
      setEjercicios(ejercicios.map(ej => ej.id === ejercicioActualizadoResponse.id ? ejercicioActualizadoResponse : ej));
      setMensajeExito('¡Ejercicio actualizado con éxito!');
      setMensajeError('');
      setEjercicioEditando(null);
    } catch (error) {
      console.error('Error al actualizar ejercicio:', error);
      setMensajeError(`No se pudo actualizar el ejercicio: ${error.message}`);
    }
  }, [ejercicios]);

  const confirmarEliminarEjercicio = (id) => {
    setEjercicioToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const manejarEliminarEjercicio = async () => {
    if (!ejercicioToDelete) return;

    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios/${ejercicioToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo eliminar el ejercicio');
      }
      setEjercicios(ejercicios.filter(ej => ej.id !== ejercicioToDelete));
      setMensajeExito('¡Ejercicio eliminado con éxito!');
      setMensajeError('');
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error);
      setMensajeError(`No se pudo eliminar el ejercicio: ${error.message}`);
    } finally {
      setShowDeleteConfirmation(false);
      setEjercicioToDelete(null);
    }
  };

  const manejarSubirArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el archivo');
      }

      const result = await response.json();
      setMensajeExito(result.message);
      obtenerEjercicios();
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setMensajeError(`Error al subir archivo: ${error.message}`);
    }
  };

  const ejerciciosFiltrados = ejercicios.filter(ejercicio =>
    ejercicio.pregunta.toLowerCase().includes(filtro.toLowerCase()) &&
    (filtroDificultad === '' || ejercicio.dificultad === filtroDificultad) &&
    (filtroCategoria === '' || ejercicio.categoria.toLowerCase().includes(filtroCategoria.toLowerCase()))
  );

  const totalPages = Math.ceil(ejerciciosFiltrados.length / ITEMS_PER_PAGE);
  const paginatedEjercicios = ejerciciosFiltrados.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (!isAuthenticated) {
    return (
      <div className={`admin-login ${darkMode ? 'dark-mode' : ''}`}>
        <h2>Iniciar sesión como administrador</h2>
        {mensajeError && <div className="error-message">{mensajeError}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
          <button type="submit">Iniciar sesión</button>
        </form>
        {showHint && (
          <p className="password-hint">Pista: everyone calls him that "h__ (space) p___"</p>
        )}
      </div>
    );
  }

  return (
    <div className={`admin-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="admin-header">
        <h2>Página de Administración</h2>
        <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
      </div>
      {mensajeError && <div className="error-message">{mensajeError}</div>}
      {mensajeExito && <div className="success-message">{mensajeExito}</div>}
      <div className="admin-section">
        <h3>Agregar Nuevo Ejercicio</h3>
        <div className="form-group">
          <label>Pregunta:</label>
          <textarea
            value={nuevoEjercicio.pregunta}
            onChange={(e) => manejarCambioInput(e, 'pregunta')}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Palabras Clave (separadas por comas):</label>
          <input
            type="text"
            value={nuevoEjercicio.palabras_clave}
            onChange={(e) => manejarCambioInput(e, 'palabras_clave')}
          />
        </div>
        <div className="form-group">
          <label>Respuestas Aceptables (separadas por comas):</label>
          <input
            type="text"
            value={nuevoEjercicio.respuestas_aceptables}
            onChange={(e) => manejarCambioInput(e, 'respuestas_aceptables')}
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
        <button onClick={manejarAgregarEjercicio} className="btn-primary">Agregar Ejercicio</button>
      </div>

      <div className="admin-section">
        <h3>Subir Archivo</h3>
        <p>Puede subir archivos CSV. Asegúrese de que el archivo tenga las siguientes columnas: pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista</p>
        <input type="file" accept=".csv" onChange={manejarSubirArchivo} />
      </div>

      <div className="admin-section">
        <h3>Ejercicios Actuales</h3>
        <div className="filters">
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <select
            value={filtroDificultad}
            onChange={(e) => setFiltroDificultad(e.target.value)}
          >
            <option value="">Todas las dificultades</option>
            <option value="fácil">Fácil</option>
            <option value="medio">Medio</option>
            <option value="difícil">Difícil</option>
          </select>
          <input
            type="text"
            placeholder="Filtrar por categoría..."
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          />
        </div>
        <ul className="ejercicios-lista">
          {paginatedEjercicios.map((ejercicio) => (
            <li key={ejercicio.id} className="ejercicio-item">
              {ejercicioEditando && ejercicioEditando.id === ejercicio.id ? (
                <div className="ejercicio-edit">
                  <textarea
                    value={ejercicioEditando.pregunta}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, pregunta: e.target.value})}
                    placeholder="Pregunta"
                    rows="3"
                  />
                  <input
                    value={ejercicioEditando.palabras_clave}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, palabras_clave: e.target.value})}
                    placeholder="Palabras Clave"
                  />
                  <input
                    value={ejercicioEditando.respuestas_aceptables}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, respuestas_aceptables: e.target.value})}
                    placeholder="Respuestas Aceptables"
                  />
                  <select
                    value={ejercicioEditando.dificultad}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, dificultad: e.target.value})}
                  >
                    <option value="fácil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="difícil">Difícil</option>
                  </select>
                  <input
                    value={ejercicioEditando.categoria}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, categoria: e.target.value})}
                    placeholder="Categoría"
                  />
                  <input
                    value={ejercicioEditando.pista}
                    onChange={(e) => setEjercicioEditando({...ejercicioEditando, pista: e.target.value})}
                    placeholder="Pista"
                  />
                  <div className="button-group">
                    <button onClick={() => manejarActualizarEjercicio(ejercicioEditando)} className="btn-primary">Guardar</button>
                    <button onClick={() => setEjercicioEditando(null)} className="btn-secondary">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="ejercicio-view">
                  <h4>{ejercicio.pregunta}</h4>
                  <p><strong>Palabras Clave:</strong> {ejercicio.palabras_clave || 'N/A'}</p>
                  <p><strong>Respuestas:</strong> {ejercicio.respuestas_aceptables || 'N/A'}</p>
                  <p><strong>Dificultad:</strong> {ejercicio.dificultad}</p>
                  <p><strong>Categoría:</strong> {ejercicio.categoria}</p>
                  <p><strong>Pista:</strong> {ejercicio.pista}</p>
                  <div className="button-group">
                    <button onClick={() => manejarEditarEjercicio(ejercicio)} className="btn-secondary">Editar</button>
                    <button onClick={() => confirmarEliminarEjercicio(ejercicio.id)} className="btn-danger">Eliminar</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Anterior
          </button>
          <span>{currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Siguiente
          </button>
        </div>
      </div>
      {showDeleteConfirmation && (
        <div className="delete-confirmation">
          <p>¿Está seguro de que desea eliminar este ejercicio?</p>
          <button onClick={manejarEliminarEjercicio} className="btn-danger">Sí, eliminar</button>
          <button onClick={() => setShowDeleteConfirmation(false)} className="btn-secondary">Cancelar</button>
        </div>
      )}
    </div>
  );
}

export default AdminPage;