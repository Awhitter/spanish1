import React, { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import './AdminPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function AdminPage() {
  const [ejercicios, setEjercicios] = useState([]);
  const [pregunta, setPregunta] = useState('');
  const [palabrasClave, setPalabrasClave] = useState('');
  const [respuestasAceptables, setRespuestasAceptables] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [pista, setPista] = useState('');
  const [modulo, setModulo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
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
        console.error('Error fetching ejercicios');
        setMessage('Error al cargar los ejercicios. Por favor, intente de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error de conexión. Por favor, verifique su conexión a internet e intente de nuevo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ejercicioData = {
      pregunta,
      palabras_clave: palabrasClave,
      respuestas_aceptables: respuestasAceptables,
      dificultad,
      categoria,
      pista,
      modulo
    };

    try {
      const url = editingId
        ? `${BACKEND_URL}/ejercicios/${editingId}`
        : `${BACKEND_URL}/ejercicios`;
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ejercicioData),
      });

      if (response.ok) {
        setMessage(editingId ? 'Ejercicio actualizado con éxito' : 'Ejercicio agregado con éxito');
        clearForm();
        fetchEjercicios();
        setShowEditModal(false);
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
    setEditingId(ejercicio.id);
    setPregunta(ejercicio.pregunta);
    setPalabrasClave(ejercicio.palabras_clave);
    setRespuestasAceptables(ejercicio.respuestas_aceptables);
    setDificultad(ejercicio.dificultad);
    setCategoria(ejercicio.categoria);
    setPista(ejercicio.pista);
    setModulo(ejercicio.modulo);
    setShowEditModal(true);
  };

  const clearForm = () => {
    setEditingId(null);
    setPregunta('');
    setPalabrasClave('');
    setRespuestasAceptables('');
    setDificultad('');
    setCategoria('');
    setPista('');
    setModulo('');
    setShowEditModal(false);
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
        <Player
          src="https://lottie.host/89ac2690-0d2f-4655-90ad-3f7434371de8/wfBnzQud2H.json"
          background="transparent"
          speed={1}
          style={{ width: '200px', height: '200px' }}
          loop
          autoplay
        />
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

  return (
    <div className="admin-page">
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <h2>Administración de Ejercicios</h2>
      
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
        <button onClick={() => setShowEditModal(true)} className="btn btn-primary">Agregar Ejercicio</button>

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
            <h4>Pregunta: {ejercicio.pregunta}</h4>
            <p><strong>Módulo:</strong> {ejercicio.modulo}</p>
            <p><strong>Respuestas:</strong> {ejercicio.respuestas_aceptables}</p>
            <p><strong>Dificultad:</strong> {ejercicio.dificultad}</p>
            <p><strong>Categoría:</strong> {ejercicio.categoria}</p>
            <p><strong>Pista:</strong> {ejercicio.pista}</p>
            <p><strong>Última actualización:</strong> {new Date(ejercicio.updated_at).toLocaleString('es-ES', { timeZone: 'UTC' })}</p>
            <div className="exercise-actions">
              <button onClick={() => handleEdit(ejercicio)} className="btn btn-secondary">Editar</button>
              <button onClick={() => handleDelete(ejercicio.id)} className="btn btn-danger">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingId ? 'Editar Ejercicio' : 'Agregar Ejercicio'}</h3>
            <form onSubmit={handleSubmit} className="exercise-form">
              <div className="form-group">
                <label htmlFor="pregunta">Pregunta:</label>
                <textarea
                  id="pregunta"
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  placeholder="Pregunta"
                  required
                  rows="4"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="palabrasClave">Palabras clave:</label>
                  <input
                    id="palabrasClave"
                    type="text"
                    value={palabrasClave}
                    onChange={(e) => setPalabrasClave(e.target.value)}
                    placeholder="Separadas por comas"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="respuestasAceptables">Respuestas aceptables:</label>
                  <input
                    id="respuestasAceptables"
                    type="text"
                    value={respuestasAceptables}
                    onChange={(e) => setRespuestasAceptables(e.target.value)}
                    placeholder="Separadas por comas"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dificultad">Dificultad:</label>
                  <select
                    id="dificultad"
                    value={dificultad}
                    onChange={(e) => setDificultad(e.target.value)}
                    required
                  >
                    <option value="">Selecciona la dificultad</option>
                    <option value="fácil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="difícil">Difícil</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="categoria">Categoría:</label>
                  <input
                    id="categoria"
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Categoría"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pista">Pista:</label>
                  <input
                    id="pista"
                    type="text"
                    value={pista}
                    onChange={(e) => setPista(e.target.value)}
                    placeholder="Pista"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modulo">Módulo:</label>
                  <input
                    id="modulo"
                    type="text"
                    value={modulo}
                    onChange={(e) => setModulo(e.target.value)}
                    placeholder="Módulo"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">{editingId ? 'Actualizar' : 'Agregar'} Ejercicio</button>
                <button type="button" onClick={clearForm} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;