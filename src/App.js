import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import EjerciciosEspanol from './components/EjerciciosEspanol';
import AdminPage from './components/AdminPage';

export const DarkModeContext = React.createContext();

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <Router>
        <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
          <header className="App-header">
            <h1 className="fancy-title">Ejercicios de Español de Alejandra</h1>
            <nav className="nav-menu">
              <Link to="/" className="nav-link">Inicio</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </nav>
            <button onClick={toggleDarkMode} className="toggle-dark-mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </header>
          <main className="App-main">
            <Routes>
              <Route path="/" element={<EjerciciosEspanol />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <footer className="App-footer">
            <p>© 2023 Ejercicios de Español de Alejandra. Todos los derechos reservados.</p>
          </footer>
        </div>
      </Router>
    </DarkModeContext.Provider>
  );
}

export default App;
