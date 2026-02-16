import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Plus, Trash2, Calendar, CheckCircle, HelpCircle } from 'lucide-react';

const CreateQuiz = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct: [], type: 'single' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const toggleCorrectOption = (qIndex, oIndex) => {
    const updated = [...questions];
    const q = updated[qIndex];

    if (q.type === 'single') {
      q.correct = [oIndex];
    } else {
      if (q.correct.includes(oIndex)) q.correct = q.correct.filter(i => i !== oIndex);
      else q.correct.push(oIndex);
    }
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: [], type: 'single' }]);
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!title || !startDate || !dueDate) return alert("Please fill all details!");
    const startObj = new Date(startDate);
    const endObj = new Date(dueDate);

    if (startObj >= endObj) return alert("Start Date must be earlier than Due Date!");

    setLoading(true);
    try {
      const payload = {
        classId,
        title,
        startDate: startObj.toISOString(),
        dueDate: endObj.toISOString(),
        questions
      };

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.post('https://edunexus-api-w6xc.onrender.com/api/quizzes/create', payload, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      alert('Quiz Published Successfully! 🚀');
      navigate(`/class/${classId}`);
    } catch (err) { alert('Error creating quiz'); } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Create New Quiz</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">
              <Plus size={18} /> Add Question
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50">
              {loading ? 'Publishing...' : <><Save size={18} /> Publish Quiz</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Quiz Details Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><FileTextIcon /> Basic Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title</label>
              <input
                className="input-field text-lg font-medium"
                placeholder="e.g. Mid-Term Examination"
                value={title} onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Calendar size={16} /> Starts At</label>
                <input type="datetime-local" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Calendar size={16} /> Ends At</label>
                <input type="datetime-local" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative group transition hover:border-indigo-200">

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-100 text-indigo-700 font-bold w-8 h-8 flex items-center justify-center rounded-lg">{qIndex + 1}</span>
                  <select
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={q.type} onChange={e => handleUpdateQuestion(qIndex, 'type', e.target.value)}
                  >
                    <option value="single">Single Choice</option>
                    <option value="multi">Multiple Choice</option>
                  </select>
                </div>

                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qIndex)} className="text-slate-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="mb-6">
                <input
                  className="w-full text-lg font-medium border-b-2 border-slate-100 pb-2 outline-none focus:border-indigo-500 bg-transparent transition placeholder:text-slate-300"
                  placeholder="Type your question here..."
                  value={q.question} onChange={e => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, oIndex) => {
                  const isCorrect = q.correct.includes(oIndex);
                  return (
                    <div
                      key={oIndex}
                      onClick={() => toggleCorrectOption(qIndex, oIndex)}
                      className={`
                                          flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                                          ${isCorrect ? 'bg-green-50 border-green-500 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-200'}
                                      `}
                    >
                      <div className={`
                                          w-6 h-6 rounded flex items-center justify-center border-2 transition
                                          ${isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300'}
                                          ${q.type === 'single' ? 'rounded-full' : 'rounded-md'}
                                      `}>
                        {isCorrect && <CheckCircle size={14} />}
                      </div>
                      <input
                        className="flex-1 bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt} onChange={e => handleUpdateOption(qIndex, oIndex, e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button onClick={addQuestion} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition w-full justify-center">
            <Plus size={20} /> Add New Question
          </button>
        </div>

      </div>
    </div>
  );
};

const FileTextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
);

export default CreateQuiz;