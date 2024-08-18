import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import EjerciciosEspanol from './EjerciciosEspanol';
import { DarkModeContext } from '../App';
import useExerciseManagement from '../hooks/useExerciseManagement';

// Mock the useExerciseManagement hook
jest.mock('../hooks/useExerciseManagement');

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ moduleId: 'Test Module' }),
  useNavigate: () => jest.fn(),
}));

describe('EjerciciosEspanol', () => {
  const mockExerciseManagement = {
    ejercicioActual: {
      pregunta: 'Test question',
      dificultad: 'fácil',
      pista: 'Test hint',
    },
    respuestaUsuario: '',
    setRespuestaUsuario: jest.fn(),
    verificarRespuesta: jest.fn(),
    siguienteEjercicio: jest.fn(),
    manejarSaltar: jest.fn(),
    manejarMostrarPista: jest.fn(),
    reiniciarQuiz: jest.fn(),
    obtenerEjerciciosPorModulo: jest.fn(),
    ejercicios: [],
    retroalimentacion: '',
    estadisticas: { correctas: 0, incorrectas: 0, saltadas: 0 },
    mostrarPista: false,
    error: null,
  };

  beforeEach(() => {
    useExerciseManagement.mockReturnValue(mockExerciseManagement);
  });

  it('renders the component with exercise question', () => {
    render(
      <DarkModeContext.Provider value={{ darkMode: false }}>
        <Router>
          <EjerciciosEspanol />
        </Router>
      </DarkModeContext.Provider>
    );

    expect(screen.getByText('Test Module')).toBeInTheDocument();
    expect(screen.getByText('Test question')).toBeInTheDocument();
  });

  it('handles user input and submission', () => {
    render(
      <DarkModeContext.Provider value={{ darkMode: false }}>
        <Router>
          <EjerciciosEspanol />
        </Router>
      </DarkModeContext.Provider>
    );

    const input = screen.getByPlaceholderText('Tu respuesta');
    fireEvent.change(input, { target: { value: 'test answer' } });
    expect(mockExerciseManagement.setRespuestaUsuario).toHaveBeenCalledWith('test answer');

    const submitButton = screen.getByText('Verificar');
    fireEvent.click(submitButton);
    expect(mockExerciseManagement.verificarRespuesta).toHaveBeenCalled();
  });

  it('displays hint when button is clicked', () => {
    useExerciseManagement.mockReturnValue({
      ...mockExerciseManagement,
      mostrarPista: true,
    });

    render(
      <DarkModeContext.Provider value={{ darkMode: false }}>
        <Router>
          <EjerciciosEspanol />
        </Router>
      </DarkModeContext.Provider>
    );

    const hintButton = screen.getByText('Pista');
    fireEvent.click(hintButton);
    expect(mockExerciseManagement.manejarMostrarPista).toHaveBeenCalled();
    expect(screen.getByText('Test hint')).toBeInTheDocument();
  });

  // Add more tests as needed for other functionalities
});