import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './AdminPage.css';

function AdminPage() {
  const [exercises, setExercises] = useState([]);
  const [editingExercise, setEditingExercise] = useState(null);
  const [newExercise, setNewExercise] = useState({
    id: '',
    pregunta: '',
    keywords: [],
    acceptableAnswers: [],
    difficulty: 'easy',
    category: '',
    hint: ''
  });

  useEffect(() => {
    // Load exercises from local storage on component mount
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
      setExercises(JSON.parse(savedExercises));
    } else {
      // If no exercises in local storage, load from json file
      import('../data/ejercicios.json').then(data => {
        setExercises(data.default);
        localStorage.setItem('exercises', JSON.stringify(data.default));
      });
    }
  }, []);

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

  const handleAddExercise = () => {
    if (newExercise.pregunta.trim() === '' || newExercise.acceptableAnswers.length === 0) {
      alert('Please enter both question and at least one acceptable answer.');
      return;
    }
    const exerciseToAdd = {
      ...newExercise,
      id: Date.now().toString()
    };
    const updatedExercises = [...exercises, exerciseToAdd];
    setExercises(updatedExercises);
    localStorage.setItem('exercises', JSON.stringify(updatedExercises));
    setNewExercise({
      id: '',
      pregunta: '',
      keywords: [],
      acceptableAnswers: [],
      difficulty: 'easy',
      category: '',
      hint: ''
    });
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
  };

  const handleUpdateExercise = () => {
    const updatedExercises = exercises.map(ex => ex.id === editingExercise.id ? editingExercise : ex);
    setExercises(updatedExercises);
    localStorage.setItem('exercises', JSON.stringify(updatedExercises));
    setEditingExercise(null);
  };

  const handleDeleteExercise = (id) => {
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    setExercises(updatedExercises);
    localStorage.setItem('exercises', JSON.stringify(updatedExercises));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      const formattedData = data.map(item => ({
        id: Date.now().toString(),
        pregunta: item.pregunta,
        keywords: item.keywords ? item.keywords.split(',').map(k => k.trim()) : [],
        acceptableAnswers: item.acceptableAnswers ? item.acceptableAnswers.split(',').map(a => a.trim()) : [],
        difficulty: item.difficulty || 'easy',
        category: item.category || '',
        hint: item.hint || ''
      }));
      const updatedExercises = [...exercises, ...formattedData];
      setExercises(updatedExercises);
      localStorage.setItem('exercises', JSON.stringify(updatedExercises));
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