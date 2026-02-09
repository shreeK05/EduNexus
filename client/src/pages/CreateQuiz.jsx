import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateQuiz = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(''); // Stores local time string (e.g., "2026-02-09T13:30")
  const [dueDate, setDueDate] = useState('');     // Stores local time string
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
    
    const startObj = new Date(startDate);
    const endObj = new Date(dueDate);

    // Validation: Start Date must be before Due Date
    if (startObj >= endObj) {
        return alert("Start Date must be earlier than Due Date!");
    }

    try {
      // --- FIX IS HERE ---
      // Convert the local time (from inputs) to universal ISO string (UTC)
      // This ensures 1:30 PM India Time is sent as "08:00:00.000Z" (UTC), 
      // so the server understands the exact moment regardless of its location.
      const payload = {
        classId,
        title,
        startDate: startObj.toISOString(), 
        dueDate: endObj.toISOString(),
        questions
      };

      await axios.post('https://edunexus-api-ci68.onrender.com/api/quizzes/create', payload);
      alert('Quiz Created Successfully!');
      navigate(`/class/${classId}`);
    } catch (err) {
      console.error(err);
      alert('Error creating quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">📝 Create Quiz</h1>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
            <div>
                <label className="text-sm font-bold text-gray-500 mb-1 block">Quiz Title</label>
                <input 
                placeholder="e.g., Final Exam - Module 1" 
                className="w-full p-3 border rounded text-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* START DATE INPUT */}
                <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-500 mb-1">Start Date (Opens at)</label>
                    <input 
                      type="datetime-local" 
                      className="p-3 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                    />
                </div>

                {/* DUE DATE INPUT */}
                <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-500 mb-1">Due Date (Closes at)</label>
                    <input 
                      type="datetime-local" 
                      className="p-3 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={dueDate} 
                      onChange={e => setDueDate(e.target.value)} 
                    />
                </div>
            </div>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-8 p-6 border rounded-lg bg-gray-50 relative shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                    <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} className="text-red-500 text-sm font-bold hover:text-red-700">Remove Question</button>
                )}
            </div>
            
            <input 
              placeholder="Enter your question here..." 
              className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-indigo-500" 
              value={q.question} 
              onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className={`flex items-center gap-2 p-2 rounded border ${q.correct === oIndex ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                   <input 
                     type="radio" 
                     name={`correct-${qIndex}`} 
                     className="w-4 h-4 text-indigo-600"
                     checked={q.correct === oIndex} 
                     onChange={() => handleQuestionChange(qIndex, 'correct', oIndex)}
                   />
                   <input 
                     placeholder={`Option ${oIndex + 1}`} 
                     className="w-full p-1 bg-transparent outline-none" 
                     value={opt} 
                     onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} 
                   />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-4 pt-4 border-t">
          <button onClick={addQuestion} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition">+ Add Question</button>
          <button onClick={handleSubmit} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex-1 shadow-lg transition transform hover:scale-[1.02]">Publish Quiz 🚀</button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;