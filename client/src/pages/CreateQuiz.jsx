import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateQuiz = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(''); // <--- Start Date State
  const [dueDate, setDueDate] = useState('');     // <--- Due Date State
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct: 0 }
  ]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const handleSubmit = async () => {
    if (!title || !startDate || !dueDate) return alert("Please fill title, start date, and due date");
    
    // Validation: Start Date must be before Due Date
    if (new Date(startDate) >= new Date(dueDate)) {
        return alert("Start Date must be earlier than Due Date!");
    }

    try {
      await axios.post('https://edunexus-api-ci68.onrender.com/api/quizzes/create', {
        classId,
        title,
        startDate, // <--- Send Both
        dueDate,
        questions
      });
      alert('Quiz Created!');
      navigate(`/class/${classId}`);
    } catch (err) {
      alert('Error creating quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">📝 Create Quiz</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
                <input 
                placeholder="Quiz Title (e.g., Final Exam)" 
                className="w-full p-3 border rounded text-lg" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                />
            </div>

            {/* START DATE INPUT */}
            <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-500 mb-1">Start Date (Opens at)</label>
                <input 
                  type="datetime-local" 
                  className="p-3 border rounded" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                />
            </div>

            {/* DUE DATE INPUT */}
            <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-500 mb-1">Due Date (Closes at)</label>
                <input 
                  type="datetime-local" 
                  className="p-3 border rounded" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                />
            </div>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-8 p-6 border rounded-lg bg-gray-50 relative">
            <h3 className="font-bold mb-2">Question {qIndex + 1}</h3>
            <input 
              placeholder="Enter Question" 
              className="w-full p-2 border rounded mb-3" 
              value={q.question} 
              onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} 
            />
            
            <div className="grid grid-cols-2 gap-4">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                   <input 
                     type="radio" 
                     name={`correct-${qIndex}`} 
                     checked={q.correct === oIndex} 
                     onChange={() => handleQuestionChange(qIndex, 'correct', oIndex)}
                   />
                   <input 
                     placeholder={`Option ${oIndex + 1}`} 
                     className="w-full p-2 border rounded" 
                     value={opt} 
                     onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} 
                   />
                </div>
              ))}
            </div>
            {questions.length > 1 && (
                <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} className="absolute top-4 right-4 text-red-500 font-bold">Remove</button>
            )}
          </div>
        ))}

        <div className="flex gap-4">
          <button onClick={addQuestion} className="px-6 py-3 bg-gray-200 rounded font-bold hover:bg-gray-300">+ Add Question</button>
          <button onClick={handleSubmit} className="px-6 py-3 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 flex-1">Publish Quiz</button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;