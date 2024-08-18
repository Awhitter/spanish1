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

  useEffect(() => {
    if (isAuthenticated) {
      fetchEjercicios();
    }
  }, [isAuthenticated]);

  const fetchEjercicios = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios`);
      if (response.ok) {
        const data = await response.json();
        setEjercicios(data);
      } else {
        console.error('Error fetching ejercicios');
      }
    } catch (error) {
      console.error('Error:', error);
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
      } else {
        setMessage('Error al procesar el ejercicio');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al procesar el ejercicio');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/ejercicios/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Ejercicio eliminado con éxito');
        fetchEjercicios();
      } else {
        setMessage('Error al eliminar el ejercicio');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al eliminar el ejercicio');
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
        setMessage('Error al procesar el archivo CSV');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al procesar el archivo CSV');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'hoje papa') {
      setIsAuthenticated(true);
    } else {
      setMessage('Contraseña incorrecta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <h2>Iniciar sesión de administrador</h2>
        <Player
          autoplay
          loop
          src="https://lottie.host/89ac2690-0d2f-4655-90ad-3f7434371de8/wfBnzQud2H.json"
          style={{ height: '200px', width: '200px' }}
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
      <h2>Administración de Ejercicios</h2>
      
      <div className="admin-instructions">
        <h3>Instrucciones para administradores:</h3>
        <ol>
          <li>Para agregar un nuevo ejercicio, complete el formulario y haga clic en "Agregar Ejercicio".</li>
          <li>Para editar un ejercicio existente, haga clic en "Editar" junto al ejercicio, realice los cambios y haga clic en "Actualizar Ejercicio".</li>
          <li>Para eliminar un ejercicio, haga clic en "Eliminar" junto al ejercicio que desea quitar.</li>
          <li>Para cargar múltiples ejercicios a la vez, use la función de carga CSV. Asegúrese de que su archivo CSV tenga las siguientes columnas: pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista, modulo.</li>
        </ol>
      </div>

      {message && <p className="message">{message}</p>}
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
        <button type="submit" className="btn btn-primary">{editingId ? 'Actualizar' : 'Agregar'} Ejercicio</button>
        {editingId && (
          <button type="button" onClick={clearForm} className="btn btn-secondary">Cancelar Edición</button>
        )}
      </form>

      <div className="csv-upload">
        <h3>Subir archivo CSV</h3>
        <p>El archivo CSV debe tener las siguientes columnas: pregunta, palabras_clave, respuestas_aceptables, dificultad, categoria, pista, modulo</p>
        <form onSubmit={handleFileUpload} className="file-upload-form">
          <input type="file" onChange={handleFileChange} accept=".csv" />
          <button type="submit" className="btn btn-primary">Subir CSV</button>
        </form>
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
            <p><strong>Última actualización:</strong> {new Date(ejercicio.updated_at).toLocaleString()}</p>
            <div className="exercise-actions">
              <button onClick={() => handleEdit(ejercicio)} className="btn btn-secondary">Editar</button>
              <button onClick={() => handleDelete(ejercicio.id)} className="btn btn-danger">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;