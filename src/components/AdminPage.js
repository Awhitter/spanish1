import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchEjercicios();
  }, []);

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

  return (
    <div className="admin-page">
      <h2>Administración de Ejercicios</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="exercise-form">
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Pregunta"
          required
        />
        <input
          type="text"
          value={palabrasClave}
          onChange={(e) => setPalabrasClave(e.target.value)}
          placeholder="Palabras clave (separadas por comas)"
        />
        <input
          type="text"
          value={respuestasAceptables}
          onChange={(e) => setRespuestasAceptables(e.target.value)}
          placeholder="Respuestas aceptables (separadas por comas)"
          required
        />
        <input
          type="text"
          value={dificultad}
          onChange={(e) => setDificultad(e.target.value)}
          placeholder="Dificultad"
        />
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoría"
        />
        <input
          type="text"
          value={pista}
          onChange={(e) => setPista(e.target.value)}
          placeholder="Pista"
        />
        <input
          type="text"
          value={modulo}
          onChange={(e) => setModulo(e.target.value)}
          placeholder="Módulo"
          required
        />
        <button type="submit">{editingId ? 'Actualizar' : 'Agregar'} Ejercicio</button>
        {editingId && (
          <button type="button" onClick={clearForm}>Cancelar Edición</button>
        )}
      </form>

      <form onSubmit={handleFileUpload} className="file-upload-form">
        <input type="file" onChange={handleFileChange} accept=".csv" />
        <button type="submit">Subir CSV</button>
      </form>

      <div className="exercise-list">
        <h3>Ejercicios Existentes</h3>
        {ejercicios.map((ejercicio) => (
          <div key={ejercicio.id} className="exercise-item">
            <p><strong>Pregunta:</strong> {ejercicio.pregunta}</p>
            <p><strong>Módulo:</strong> {ejercicio.modulo}</p>
            <p><strong>Respuestas:</strong> {ejercicio.respuestas_aceptables}</p>
            <button onClick={() => handleEdit(ejercicio)}>Editar</button>
            <button onClick={() => handleDelete(ejercicio.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;