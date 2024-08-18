import React, { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import './AdminPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function AdminPage() {
  const [ejercicios, setEjercicios] = useState([]);
  const [editingExercise, setEditingExercise] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEjercicios();
    }
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.body.classList.toggle('dark-mode', savedDarkMode);
  }, [isAuthenticated]);

  const fetchEjercicios = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios`);
      if (response.ok) {
        const data = await response.json();
        setEjercicios(data);
      } else {
        console.error('Error al cargar los ejercicios');
        setMessage('Error al cargar los ejercicios. Por favor, intente de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error de conexión. Por favor, verifique su conexión a internet e intente de nuevo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingExercise.id
        ? `${BACKEND_URL}/ejercicios/${editingExercise.id}`
        : `${BACKEND_URL}/ejercicios`;
      const method = editingExercise.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingExercise),
      });

      if (response.ok) {
        setMessage(editingExercise.id ? 'Ejercicio actualizado con éxito' : 'Ejercicio agregado con éxito');
        setEditingExercise(null);
        fetchEjercicios();
      } else {
        const errorData = await response.json();
        setMessage(`Error al procesar el ejercicio: ${errorData.message || 'Intente de nuevo'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al procesar el ejercicio. Por favor, verifique su conexión e intente de nuevo.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este ejercicio?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/ejercicios/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage('Ejercicio eliminado con éxito');
          fetchEjercicios();
        } else {
          const errorData = await response.json();
          setMessage(`Error al eliminar el ejercicio: ${errorData.message || 'Intente de nuevo'}`);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('Error al eliminar el ejercicio. Por favor, verifique su conexión e intente de nuevo.');
      }
    }
  };

  const handleEdit = (ejercicio) => {
    setEditingExercise({ ...ejercicio });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingExercise(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, seleccione un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`CSV procesado. ${result.addedCount} ejercicios agregados, ${result.errorCount} ejercicios inválidos.`);
        fetchEjercicios();
      } else {
        const errorData = await response.json();
        setMessage(`Error al procesar el archivo CSV: ${errorData.message || 'Intente de nuevo'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al procesar el archivo CSV. Por favor, verifique su conexión e intente de nuevo.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'hoje papa') {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Contraseña incorrecta');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <h2>Iniciar sesión de administrador</h2>
        <div className="lottie-container">
          <Player
            src="https://lottie.host/89ac2690-0d2f-4655-90ad-3f7434371de8/wfBnzQud2H.json"
            background="transparent"
            speed={1}
            style={{ width: '200px', height: '200px' }}
            loop
            autoplay
          />
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
          <button type="submit">Iniciar sesión</button>
        </form>
        <p className="hint">Pista: everyone calls alec the "h___ (space) p____"</p>
        {message && <p className="error-message">{message}</p>}
      </div>
    );
  }

  if (editingExercise) {
    return (
      <div className="admin-page edit-page">
        <div className="edit-header">
          <h2>{editingExercise.id ? 'Editar Ejercicio' : 'Agregar Ejercicio'}</h2>
          <div className="edit-actions">
            <button onClick={handleSubmit} className="btn btn-primary">Guardar</button>
            <button onClick={() => setEditingExercise(null)} className="btn btn-secondary">Cancelar</button>
          </div>
        </div>
        <div className="edit-content">
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="pregunta">Pregunta:</label>
              <textarea
                id="pregunta"
                name="pregunta"
                value={editingExercise.pregunta}
                onChange={handleInputChange}
                rows="6"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="palabras_clave">Palabras clave:</label>
                <input
                  id="palabras_clave"
                  name="palabras_clave"
                  type="text"
                  value={editingExercise.palabras_clave}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="respuestas_aceptables">Respuestas aceptables:</label>
                <input
                  id="respuestas_aceptables"
                  name="respuestas_aceptables"
                  type="text"
                  value={editingExercise.respuestas_aceptables}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dificultad">Dificultad:</label>
                <select
                  id="dificultad"
                  name="dificultad"
                  value={editingExercise.dificultad}
                  onChange={handleInputChange}
                >
                  <option value="fácil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="categoria">Categoría:</label>
                <input
                  id="categoria"
                  name="categoria"
                  type="text"
                  value={editingExercise.categoria}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="pista">Pista:</label>
              <input
                id="pista"
                name="pista"
                type="text"
                value={editingExercise.pista}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="modulo">Módulo:</label>
              <input
                id="modulo"
                name="modulo"
                type="text"
                value={editingExercise.modulo}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="edit-preview">
            <h3>Vista previa</h3>
            <div className="preview-content">
              <h4>{editingExercise.pregunta}</h4>
              <p><strong>Pista:</strong> {editingExercise.pista}</p>
              <p><strong>Dificultad:</strong> {editingExercise.dificultad}</p>
              <p><strong>Categoría:</strong> {editingExercise.categoria}</p>
              <p><strong>Módulo:</strong> {editingExercise.modulo}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Administración de Ejercicios</h2>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      <div className="admin-instructions">
        <h3>Instrucciones para administradores:</h3>
        <ol>
          <li>Para agregar un nuevo ejercicio, haga clic en "Agregar Ejercicio" y complete el formulario.</li>
          <li>Para editar un ejercicio existente, haga clic en "Editar" junto al ejercicio que desea modificar.</li>
          <li>Para eliminar un ejercicio, haga clic en "Eliminar" junto al ejercicio que desea quitar. Se le pedirá confirmación.</li>
          <li>Para cargar múltiples ejercicios a la vez, use la función de carga CSV. Asegúrese de que su archivo CSV tenga las siguientes columnas: pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista, modulo.</li>
          <li>Utilice el modo oscuro para una mejor visibilidad en entornos con poca luz.</li>
        </ol>
      </div>

      {message && <p className="message">{message}</p>}
      <div className="admin-content">
        <button onClick={() => setEditingExercise({})} className="btn btn-primary">Agregar Ejercicio</button>

        <div className="csv-upload">
          <h3>Subir archivo CSV</h3>
          <p>El archivo CSV debe tener las siguientes columnas: pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista, modulo</p>
          <form onSubmit={handleFileUpload} className="file-upload-form">
            <input type="file" onChange={handleFileChange} accept=".csv" />
            <button type="submit" className="btn btn-primary">Subir CSV</button>
          </form>
        </div>
      </div>

      <div className="exercise-list">
        <h3>Ejercicios Existentes</h3>
        {ejercicios.map((ejercicio) => (
          <div key={ejercicio.id} className="exercise-item">
            <h4>{ejercicio.pregunta}</h4>
            <p><strong>Módulo:</strong> {ejercicio.modulo}</p>
            <p><strong>Respuestas:</strong> {ejercicio.respuestas_aceptables}</p>
            <p><strong>Dificultad:</strong> {ejercicio.dificultad}</p>
            <p><strong>Categoría:</strong> {ejercicio.categoria}</p>
            <p><strong>Pista:</strong> {ejercicio.pista}</p>
            <p><strong>Última actualización:</strong> {new Date(ejercicio.updated_at).toLocaleString('es-ES', { timeZone: 'UTC' })}</p>
            <div className="exercise-actions">
              <button onClick={() => handleEdit(ejercicio)} className="btn btn-secondary btn-edit">Editar</button>
              <button onClick={() => handleDelete(ejercicio.id)} className="btn btn-danger">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;