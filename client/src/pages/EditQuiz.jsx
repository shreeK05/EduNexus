import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Trash2, Save, AlertCircle, 
  Terminal, Calendar, Clock, CheckCircle, Zap,
  Activity, ShieldAlert
} from 'lucide-react';

const EditQuiz = () => {
    const { classId, quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                const res = await axios.get(`https://edunexus-api-w6xc.onrender.com/api/quizzes/${quizId}`, config);

                const now = new Date();
                const startTime = new Date(res.data.startDate);

                if (now >= startTime) {
                    navigate(`/class/${classId}`);
                    return;
                }

                setQuiz(res.data);
                setLoading(false);
            } catch (err) {
                navigate(`/class/${classId}`);
            }
        };
        fetchQuiz();
    }, [quizId, classId, navigate]);

    const handleSave = async () => {
        if (!quiz.title.trim()) return;
        if (quiz.questions.length === 0) return;

        setSaving(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            await axios.put(`https://edunexus-api-w6xc.onrender.com/api/quizzes/${quizId}`, quiz, config);
            navigate(`/class/${classId}`);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...quiz.questions];
        updated[index][field] = value;
        setQuiz({ ...quiz, questions: updated });
    };

    const updateOption = (qIndex, optIndex, value) => {
        const updated = [...quiz.questions];
        updated[qIndex].options[optIndex] = value;
        setQuiz({ ...quiz, questions: updated });
    };

    const toggleCorrect = (qIndex, optIndex) => {
        const updated = [...quiz.questions];
        const question = updated[qIndex];

        if (question.type === 'single') {
            question.correct = [optIndex];
        } else {
            const idx = question.correct.indexOf(optIndex);
            if (idx > -1) {
                question.correct.splice(idx, 1);
            } else {
                question.correct.push(optIndex);
            }
        }
        setQuiz({ ...quiz, questions: updated });
    };

    const addQuestion = () => {
        setQuiz({
            ...quiz,
            questions: [
                ...quiz.questions,
                { question: '', options: ['', '', '', ''], correct: [], type: 'single' }
            ]
        });
    };

    const deleteQuestion = (index) => {
        const updated = quiz.questions.filter((_, i) => i !== index);
        setQuiz({ ...quiz, questions: updated });
    };

    if (loading) return (
      <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-indigo-500 animate-pulse" size={24} />
          </div>
        </div>
        <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Syncing Synapse</p>
      </div>
    );

    if (!quiz) return null;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 pb-20 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button 
                          onClick={() => navigate(`/class/${classId}`)} 
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div>
                            <h1 className="text-xl font-black text-white flex items-center gap-3">
                                Synaptic Refiner <span className="text-indigo-500">.</span>
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Module ID: {quizId.slice(-8)}</p>
                        </div>
                    </div>
                    <button 
                      onClick={handleSave} 
                      disabled={saving} 
                      className="btn-premium px-8 py-2.5 text-sm shadow-indigo-500/20"
                    >
                        {saving ? 'Synchronizing...' : <><Save size={18} /> Update Payload</>}
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-12 relative">
                {/* Background Accents */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

                {/* Warning Banner */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 mb-12 flex items-start gap-4 backdrop-blur-sm"
                >
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                        <p className="font-black text-white uppercase tracking-tight">Active Refinement Protocol</p>
                        <p className="text-sm text-slate-400 mt-1">Changes are only permissible before the initial synchronization (Start Date). Deploy updates cautiously.</p>
                    </div>
                </motion.div>

                {/* Quiz Details */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-10 rounded-[3rem] border-slate-800/50 mb-12"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                          <Terminal size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Core Matrix</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Module Title</label>
                            <input
                                type="text"
                                value={quiz.title}
                                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                className="input-premium text-2xl font-black tracking-tight py-6"
                                placeholder="Enter module identifier"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                                  <Calendar size={14} className="text-indigo-400" /> Start Synchronization
                                </label>
                                <input
                                    type="datetime-local"
                                    value={quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setQuiz({ ...quiz, startDate: e.target.value })}
                                    className="input-premium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                                  <Clock size={14} className="text-rose-400" /> Synchronization End
                                </label>
                                <input
                                    type="datetime-local"
                                    value={quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
                                    className="input-premium"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Questions Grid */}
                <div className="space-y-8">
                    <AnimatePresence>
                        {quiz.questions.map((q, qIndex) => (
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
                                          value={q.type}
                                          onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                          className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                                      >
                                          <option value="single">Single Logic Stream</option>
                                          <option value="multi">Parallel Logic Streams</option>
                                      </select>
                                    </div>
                                    <button 
                                      onClick={() => deleteQuestion(qIndex)} 
                                      className="text-slate-600 hover:text-rose-500 transition-all p-3 bg-slate-900/50 rounded-2xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 mb-2 block">Question Invariant</label>
                                        <textarea
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                            className="w-full text-2xl font-black bg-transparent outline-none border-b-2 border-slate-800 focus:border-indigo-500 transition-all placeholder:text-slate-800 py-4 resize-none leading-tight"
                                            placeholder="Input neural query..."
                                            rows={1}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {q.options.map((opt, optIndex) => {
                                          const isCorrect = q.correct.includes(optIndex);
                                          return (
                                              <div 
                                                key={optIndex} 
                                                onClick={() => toggleCorrect(qIndex, optIndex)}
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
                                                    {isCorrect ? <CheckCircle size={18} /> : <span className="text-[10px] font-black">{String.fromCharCode(65 + optIndex)}</span>}
                                                  </div>
                                                  <input
                                                      type="text"
                                                      value={opt}
                                                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                      className="flex-1 bg-transparent outline-none font-black text-lg text-white placeholder:text-slate-700"
                                                      placeholder={`Node Data ${optIndex + 1}`}
                                                      onClick={(e) => e.stopPropagation()}
                                                  />
                                              </div>
                                          );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center pt-6"
                    >
                      <button 
                        onClick={addQuestion} 
                        className="flex items-center gap-4 px-12 py-6 bg-slate-900/50 border-2 border-dashed border-slate-800 text-slate-500 font-black uppercase tracking-widest rounded-[2rem] hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all w-full justify-center group"
                      >
                        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" /> Initialize New Synaptic Node
                      </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default EditQuiz;

