import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './AdminPage.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function AdminPage() {
  const [exercises, setExercises] = useState([]);
  const [editingExercise, setEditingExercise] = useState(null);
  const [newExercise, setNewExercise] = useState({
    pregunta: '',
    keywords: [],
    acceptableAnswers: [],
    difficulty: 'easy',
    category: '',
    hint: ''
  });

  useEffect(() => {
    fetchExercises();

    socket.on('exercise_added', (newExercise) => {
      setExercises(prevExercises => [...prevExercises, newExercise]);
    });

    return () => {
      socket.off('exercise_added');
    };
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch('http://localhost:5000/exercises');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleInputChange = (e, field) => {
    if (field === 'keywords' || field === 'acceptableAnswers') {
      setNewExercise({
        ...newExercise,
        [field]: e.target.value.split(',').map(item => item.trim())
      });
    } else {
      setNewExercise({
        ...newExercise,
        [field]: e.target.value
      });
    }
  };

  const addExerciseToAPI = async (exercise) => {
    try {
      const response = await fetch('http://localhost:5000/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exercise),
      });
      if (!response.ok) {
        throw new Error('Failed to add exercise');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  };

  const handleAddExercise = async () => {
    if (newExercise.pregunta.trim() === '' || newExercise.acceptableAnswers.length === 0) {
      alert('Please enter both question and at least one acceptable answer.');
      return;
    }
    try {
      const addedExercise = await addExerciseToAPI(newExercise);
      setExercises([...exercises, addedExercise]);
      setNewExercise({
        pregunta: '',
        keywords: [],
        acceptableAnswers: [],
        difficulty: 'easy',
        category: '',
        hint: ''
      });
    } catch (error) {
      alert('Failed to add exercise. Please try again.');
    }
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
  };

  const handleUpdateExercise = async () => {
    try {
      const response = await fetch(`http://localhost:5000/exercises/${editingExercise.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingExercise),
      });
      if (!response.ok) {
        throw new Error('Failed to update exercise');
      }
      const updatedExercise = await response.json();
      setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
      setEditingExercise(null);
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Failed to update exercise. Please try again.');
    }
  };

  const handleDeleteExercise = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/exercises/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete exercise');
      }
      setExercises(exercises.filter(ex => ex.id !== id));
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise. Please try again.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      const formattedData = data.map(item => ({
        pregunta: item.pregunta,
        keywords: item.keywords ? item.keywords.split(',').map(k => k.trim()) : [],
        acceptableAnswers: item.acceptableAnswers ? item.acceptableAnswers.split(',').map(a => a.trim()) : [],
        difficulty: item.difficulty || 'easy',
        category: item.category || '',
        hint: item.hint || ''
      }));
      
      for (const exercise of formattedData) {
        try {
          await addExerciseToAPI(exercise);
        } catch (error) {
          console.error('Error adding exercise from file:', error);
        }
      }
      fetchExercises();
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="admin-page">
      <h2>Admin Page</h2>
      <h3>Add New Exercise</h3>
      <input
        type="text"
        placeholder="Question"
        value={newExercise.pregunta}
        onChange={(e) => handleInputChange(e, 'pregunta')}
      />
      <input
        type="text"
        placeholder="Keywords (comma-separated)"
        value={newExercise.keywords.join(', ')}
        onChange={(e) => handleInputChange(e, 'keywords')}
      />
      <input
        type="text"
        placeholder="Acceptable Answers (comma-separated)"
        value={newExercise.acceptableAnswers.join(', ')}
        onChange={(e) => handleInputChange(e, 'acceptableAnswers')}
      />
      <select
        value={newExercise.difficulty}
        onChange={(e) => handleInputChange(e, 'difficulty')}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <input
        type="text"
        placeholder="Category"
        value={newExercise.category}
        onChange={(e) => handleInputChange(e, 'category')}
      />
      <input
        type="text"
        placeholder="Hint"
        value={newExercise.hint}
        onChange={(e) => handleInputChange(e, 'hint')}
      />
      <button onClick={handleAddExercise}>Add Exercise</button>

      <h3>Upload Excel File</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      <h3>Current Exercises</h3>
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            {editingExercise && editingExercise.id === exercise.id ? (
              <>
                <input
                  value={editingExercise.pregunta}
                  onChange={(e) => setEditingExercise({...editingExercise, pregunta: e.target.value})}
                />
                <input
                  value={editingExercise.keywords.join(', ')}
                  onChange={(e) => setEditingExercise({...editingExercise, keywords: e.target.value.split(',').map(k => k.trim())})}
                />
                <input
                  value={editingExercise.acceptableAnswers.join(', ')}
                  onChange={(e) => setEditingExercise({...editingExercise, acceptableAnswers: e.target.value.split(',').map(a => a.trim())})}
                />
                <select
                  value={editingExercise.difficulty}
                  onChange={(e) => setEditingExercise({...editingExercise, difficulty: e.target.value})}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <input
                  value={editingExercise.category}
                  onChange={(e) => setEditingExercise({...editingExercise, category: e.target.value})}
                />
                <input
                  value={editingExercise.hint}
                  onChange={(e) => setEditingExercise({...editingExercise, hint: e.target.value})}
                />
                <button onClick={handleUpdateExercise}>Update</button>
              </>
            ) : (
              <>
                <span>{exercise.pregunta} - {exercise.acceptableAnswers.join(', ')} - {exercise.difficulty} - {exercise.category} - Hint: {exercise.hint}</span>
                <button onClick={() => handleEditExercise(exercise)}>Edit</button>
                <button onClick={() => handleDeleteExercise(exercise.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPage;