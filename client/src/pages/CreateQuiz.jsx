import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Plus, Trash2, Calendar, CheckCircle, 
  HelpCircle, Sparkles, Terminal, ShieldCheck, Zap
} from 'lucide-react';

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
      navigate(`/class/${classId}`);
    } catch (err) { alert('Error creating quiz'); } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20 font-sans selection:bg-indigo-500/30">
      
      {/* --- HEADER BAR --- */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-8 w-px bg-slate-800"></div>
            <h1 className="text-xl font-black text-white flex items-center gap-3">
              Quiz Creator <span className="text-indigo-500">.</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={addQuestion} 
              className="btn-secondary px-6 py-2.5 text-xs font-black uppercase tracking-widest"
            >
              <Plus size={16} /> Add Question
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="btn-premium px-8 py-2.5 text-sm shadow-indigo-500/20"
            >
              {loading ? 'Saving...' : <><Save size={18} /> Save Quiz</>}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="space-y-12">
          {/* Quiz Details Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-10 rounded-[3rem] border-slate-800/50"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Quiz Details</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Quiz Title</label>
                <input
                  className="input-premium text-2xl font-black tracking-tight py-6"
                  placeholder="e.g. Midterm Examination"
                  value={title} onChange={e => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-400" /> Start Date & Time
                  </label>
                  <input type="datetime-local" className="input-premium" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                    <Clock size={14} className="text-rose-400" /> Due Date & Time
                  </label>
                  <input type="datetime-local" className="input-premium" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Questions Grid */}
          <div className="space-y-8">
            <AnimatePresence>
              {questions.map((q, qIndex) => (
                <motion.div 
                  key={qIndex}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel p-10 rounded-[3rem] border-slate-800/50 relative group hover:border-indigo-500/30 transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-4">
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black w-12 h-12 flex items-center justify-center rounded-2xl text-xl shadow-xl shadow-indigo-500/5">
                        {qIndex + 1}
                      </span>
                      <select
                        className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                        value={q.type} onChange={e => handleUpdateQuestion(qIndex, 'type', e.target.value)}
                      >
                        <option value="single">Single Choice</option>
                        <option value="multi">Multiple Choice</option>
                      </select>
                    </div>

                    {questions.length > 1 && (
                      <button 
                        onClick={() => removeQuestion(qIndex)} 
                        className="text-slate-600 hover:text-rose-500 transition-all p-3 bg-slate-900/50 rounded-2xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="mb-10">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 mb-2 block">Question Text</label>
                    <textarea
                      className="w-full text-2xl font-black bg-transparent outline-none border-b-2 border-slate-800 focus:border-indigo-500 transition-all placeholder:text-slate-800 py-4 resize-none leading-tight"
                      placeholder="Enter your question here..."
                      rows={1}
                      value={q.question} onChange={e => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {q.options.map((opt, oIndex) => {
                      const isCorrect = q.correct.includes(oIndex);
                      return (
                        <div
                          key={oIndex}
                          onClick={() => toggleCorrectOption(qIndex, oIndex)}
                          className={`
                            flex items-center gap-5 p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300
                            ${isCorrect 
                              ? 'bg-emerald-500/5 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.05)] scale-[1.02]' 
                              : 'bg-slate-950/30 border-slate-800/50 hover:border-indigo-500/30'}
                          `}
                        >
                          <div className={`
                            w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-300
                            ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border-slate-700 text-slate-700'}
                          `}>
                            {isCorrect ? <CheckCircle size={18} /> : <span className="text-[10px] font-black">{String.fromCharCode(65 + oIndex)}</span>}
                          </div>
                          <input
                            className="flex-1 bg-transparent outline-none font-black text-lg text-white placeholder:text-slate-700"
                            placeholder={`Option ${oIndex + 1}`}
                            value={opt} onChange={e => handleUpdateOption(qIndex, oIndex, e.target.value)}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-6"
          >
            <button 
              onClick={addQuestion} 
              className="flex items-center gap-4 px-12 py-6 bg-slate-900/50 border-2 border-dashed border-slate-800 text-slate-500 font-black uppercase tracking-widest rounded-[2rem] hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all w-full justify-center group"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" /> Add Another Question
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;