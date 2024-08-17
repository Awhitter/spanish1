import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './AdminPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/exercises`);
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setErrorMessage('Failed to fetch exercises. Please try again.');
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
    const response = await fetch(`${BACKEND_URL}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exercise),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add exercise');
    }
    return await response.json();
  };

  const handleAddExercise = async () => {
    if (newExercise.pregunta.trim() === '' || newExercise.acceptableAnswers.length === 0) {
      setErrorMessage('Please enter both question and at least one acceptable answer.');
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
      setSuccessMessage('Exercise added successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding exercise:', error);
      setErrorMessage(`Failed to add exercise: ${error.message}`);
    }
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
  };

  const handleUpdateExercise = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/exercises/${editingExercise.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingExercise),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update exercise');
      }
      const updatedExercise = await response.json();
      setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
      setEditingExercise(null);
      setSuccessMessage('Exercise updated successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating exercise:', error);
      setErrorMessage(`Failed to update exercise: ${error.message}`);
    }
  };

  const handleDeleteExercise = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/exercises/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete exercise');
      }
      setExercises(exercises.filter(ex => ex.id !== id));
      setSuccessMessage('Exercise deleted successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      setErrorMessage(`Failed to delete exercise: ${error.message}`);
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
      
      let addedCount = 0;
      let errorCount = 0;
      for (const exercise of formattedData) {
        try {
          await addExerciseToAPI(exercise);
          addedCount++;
        } catch (error) {
          console.error('Error adding exercise from file:', error);
          errorCount++;
        }
      }
      fetchExercises();
      setSuccessMessage(`Added ${addedCount} exercises successfully.`);
      if (errorCount > 0) {
        setErrorMessage(`Failed to add ${errorCount} exercises. Check console for details.`);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="admin-page">
      <h2>Admin Page</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <h3>Add New Exercise</h3>
      <div className="form-group">
        <label>Question:</label>
        <input
          type="text"
          value={newExercise.pregunta}
          onChange={(e) => handleInputChange(e, 'pregunta')}
        />
      </div>
      <div className="form-group">
        <label>Keywords (comma-separated):</label>
        <input
          type="text"
          value={newExercise.keywords.join(', ')}
          onChange={(e) => handleInputChange(e, 'keywords')}
        />
      </div>
      <div className="form-group">
        <label>Acceptable Answers (comma-separated):</label>
        <input
          type="text"
          value={newExercise.acceptableAnswers.join(', ')}
          onChange={(e) => handleInputChange(e, 'acceptableAnswers')}
        />
      </div>
      <div className="form-group">
        <label>Difficulty:</label>
        <select
          value={newExercise.difficulty}
          onChange={(e) => handleInputChange(e, 'difficulty')}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="form-group">
        <label>Category:</label>
        <input
          type="text"
          value={newExercise.category}
          onChange={(e) => handleInputChange(e, 'category')}
        />
      </div>
      <div className="form-group">
        <label>Hint:</label>
        <input
          type="text"
          value={newExercise.hint}
          onChange={(e) => handleInputChange(e, 'hint')}
        />
      </div>
      <button onClick={handleAddExercise}>Add Exercise</button>

      <h3>Upload Excel File</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      <h3>Current Exercises</h3>
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            {editingExercise && editingExercise.id === exercise.id ? (
              <>
                <div className="form-group">
                  <label>Question:</label>
                  <input
                    value={editingExercise.pregunta}
                    onChange={(e) => setEditingExercise({...editingExercise, pregunta: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Keywords:</label>
                  <input
                    value={editingExercise.keywords ? editingExercise.keywords.join(', ') : ''}
                    onChange={(e) => setEditingExercise({...editingExercise, keywords: e.target.value.split(',').map(k => k.trim())})}
                  />
                </div>
                <div className="form-group">
                  <label>Acceptable Answers:</label>
                  <input
                    value={editingExercise.acceptable_answers ? editingExercise.acceptable_answers.join(', ') : ''}
                    onChange={(e) => setEditingExercise({...editingExercise, acceptable_answers: e.target.value.split(',').map(a => a.trim())})}
                  />
                </div>
                <div className="form-group">
                  <label>Difficulty:</label>
                  <select
                    value={editingExercise.difficulty}
                    onChange={(e) => setEditingExercise({...editingExercise, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <input
                    value={editingExercise.category}
                    onChange={(e) => setEditingExercise({...editingExercise, category: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Hint:</label>
                  <input
                    value={editingExercise.hint}
                    onChange={(e) => setEditingExercise({...editingExercise, hint: e.target.value})}
                  />
                </div>
                <button onClick={handleUpdateExercise}>Update</button>
              </>
            ) : (
              <>
                <span>
                  <strong>Question:</strong> {exercise.pregunta}<br />
                  <strong>Acceptable Answers:</strong> {exercise.acceptable_answers ? exercise.acceptable_answers.join(', ') : ''}<br />
                  <strong>Difficulty:</strong> {exercise.difficulty}<br />
                  <strong>Category:</strong> {exercise.category}<br />
                  <strong>Hint:</strong> {exercise.hint}
                </span>
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