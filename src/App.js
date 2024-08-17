import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import EjerciciosEspanol from './components/EjerciciosEspanol';
import AdminPage from './components/AdminPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1 className="fancy-title">Ejercicios de Español de Alejandra</h1>
          <nav className="nav-menu">
            <Link to="/" className="nav-link">Inicio</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
          </nav>
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
  );
}

export default App;
