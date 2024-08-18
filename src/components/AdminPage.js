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
  const [showModal, setShowModal] = useState(false);

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
        setShowModal(false);
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
    setShowModal(true);
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
      <button onClick={() => setShowModal(true)} className="btn btn-primary">Agregar Ejercicio</button>
      
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingId ? 'Editar Ejercicio' : 'Agregar Ejercicio'}</h3>
            <form onSubmit={handleSubmit} className="exercise-form">
              <textarea
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                placeholder="Pregunta"
                required
                rows="3"
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
              <select
                value={dificultad}
                onChange={(e) => setDificultad(e.target.value)}
                required
              >
                <option value="">Selecciona la dificultad</option>
                <option value="fácil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="difícil">Difícil</option>
              </select>
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
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">{editingId ? 'Actualizar' : 'Agregar'} Ejercicio</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

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