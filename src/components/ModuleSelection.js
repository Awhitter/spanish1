import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ModuleSelection.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function ModuleSelection() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/modulos`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        return response.json();
      })
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching modules:', error);
        setError('Failed to load modules. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading modules...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (modules.length === 0) {
    return <div className="no-modules">No modules available. Please add some exercises first.</div>;
  }

  return (
    <div className="module-selection">
      <h2>Select a Module</h2>
      <div className="module-list">
        {modules.map((module, index) => (
          <Link key={index} to={`/module/${encodeURIComponent(module)}`} className="module-button">
            {module}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ModuleSelection;