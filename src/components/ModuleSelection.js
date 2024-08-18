import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ModuleSelection.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function ModuleSelection() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    fetch(`${BACKEND_URL}/modulos`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar los módulos');
        }
        return response.json();
      })
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching modules:', error);
        setError('No se pudieron cargar los módulos. Por favor, inténtelo de nuevo más tarde.');
        setLoading(false);
      });

    // Fetch welcome message
    fetch(`${BACKEND_URL}/welcome-message`)
      .then(response => response.json())
      .then(data => setWelcomeMessage(data.message))
      .catch(error => console.error('Error fetching welcome message:', error));
  }, []);

  if (loading) {
    return <div className="loading">Cargando módulos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (modules.length === 0) {
    return <div className="no-modules">No hay módulos disponibles. Por favor, agregue algunos ejercicios primero.</div>;
  }

  return (
    <div className="module-selection">
      <h2>¡Bienvenidos!</h2>
      <p className="welcome-message">{welcomeMessage}</p>
      <div className="module-list">
        {modules.map((module, index) => (
          <Link key={index} to={`/module/${encodeURIComponent(module.name)}`} className="module-button">
            <h3>{module.name}</h3>
            <p>Ejercicios: {module.count}</p>
            <p>Última actualización: {new Date(module.lastUpdated).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ModuleSelection;