import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './AdminPage.css';

function AdminPage() {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [exercises, setExercises] = useState([]);

  const handleAddExercise = () => {
    if (newQuestion.trim() === '' || newAnswer.trim() === '') {
      alert('Please enter both question and answer.');
      return;
    }
    const newExercise = { pregunta: newQuestion, respuesta: newAnswer };
    setExercises([...exercises, newExercise]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: ['pregunta', 'respuesta'] });
      setExercises([...exercises, ...data]);
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = () => {
    // In a real application, you would send this data to a backend server
    // For now, we'll just log it to the console
    console.log('Exercises to save:', exercises);
    alert('Exercises saved successfully!');
  };

  return (
    <div className="admin-page">
      <h2>Admin Page</h2>
      <h3>Add New Exercise</h3>
      <input
        type="text"
        placeholder="Question"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
      />
      <input
        type="text"
        placeholder="Answer"
        value={newAnswer}
        onChange={(e) => setNewAnswer(e.target.value)}
      />
      <button onClick={handleAddExercise}>Add Exercise</button>

      <h3>Upload Excel File</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      <h3>Current Exercises</h3>
      <ul>
        {exercises.map((exercise, index) => (
          <li key={index}>{exercise.pregunta} - {exercise.respuesta}</li>
        ))}
      </ul>

      <button onClick={handleSave} className="save-button">Save All Exercises</button>
    </div>
  );
}

export default AdminPage;