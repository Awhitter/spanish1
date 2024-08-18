import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import EjerciciosEspanol from './components/EjerciciosEspanol';
import AdminPage from './components/AdminPage';

export const DarkModeContext = createContext();

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prevMode => !prevMode);

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
            <button onClick={toggleDarkMode} className="toggle-dark-mode" aria-label="Toggle dark mode">
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
            <p>© {new Date().getFullYear()} Ejercicios de Español de Alejandra. Todos los derechos reservados.</p>
          </footer>
        </div>
      </Router>
    </DarkModeContext.Provider>
  );
}

export default App;
