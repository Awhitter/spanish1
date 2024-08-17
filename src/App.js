import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import EjerciciosEspanol from './components/EjerciciosEspanol';
import AdminPage from './components/AdminPage';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <Link to="/admin">Admin</Link>
        </nav>
        <Routes>
          <Route path="/" element={<EjerciciosEspanol />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
