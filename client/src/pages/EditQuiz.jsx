import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

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
                const res = await axios.get(`https://edunexus-api-d69c.onrender.com/api/quizzes/${quizId}`, config);

                // Check if quiz has already started
                const now = new Date();
                const startTime = new Date(res.data.startDate);

                if (now >= startTime) {
                    alert('⚠️ Quiz has already started! You cannot edit it now.');
                    navigate(`/class/${classId}`);
                    return;
                }

                setQuiz(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Failed to load quiz');
                navigate(`/class/${classId}`);
            }
        };
        fetchQuiz();
    }, [quizId, classId, navigate]);

    const handleSave = async () => {
        if (!quiz.title.trim()) return alert('Please enter a quiz title');
        if (quiz.questions.length === 0) return alert('Please add at least one question');

        // Validate all questions
        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            if (!q.question.trim()) return alert(`Question ${i + 1} is empty`);
            if (q.options.some(opt => !opt.trim())) return alert(`Question ${i + 1} has empty options`);
            if (!q.correct || q.correct.length === 0) return alert(`Question ${i + 1} has no correct answer selected`);
        }

        setSaving(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            await axios.put(`https://edunexus-api-d69c.onrender.com/api/quizzes/${quizId}`, quiz, config);
            alert('✅ Quiz updated successfully!');
            navigate(`/class/${classId}`);
        } catch (err) {
            console.error(err);
            alert('Failed to update quiz');
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
        if (!window.confirm('Delete this question?')) return;
        const updated = quiz.questions.filter((_, i) => i !== index);
        setQuiz({ ...quiz, questions: updated });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!quiz) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(`/class/${classId}`)} className="p-2 hover:bg-slate-100 rounded-full transition">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Edit Quiz</h1>
                                <p className="text-sm text-slate-500">Make changes before the quiz starts</p>
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50">
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Warning Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="font-bold text-amber-900">Editing Mode</p>
                        <p className="text-sm text-amber-700">You can only edit this quiz before it starts. Once the quiz begins, no changes will be allowed.</p>
                    </div>
                </div>

                {/* Quiz Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="font-bold text-lg mb-4">Quiz Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title</label>
                            <input
                                type="text"
                                value={quiz.title}
                                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter quiz title"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setQuiz({ ...quiz, startDate: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Due Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-slate-800">Question {qIndex + 1}</h3>
                                <button onClick={() => deleteQuestion(qIndex)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Question Text</label>
                                    <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter your question"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Answer Type</label>
                                    <select
                                        value={q.type}
                                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="single">Single Choice</option>
                                        <option value="multi">Multiple Choice</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Options (Click to mark as correct)</label>
                                    <div className="space-y-2">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-3">
                                                <input
                                                    type={q.type === 'single' ? 'radio' : 'checkbox'}
                                                    checked={q.correct.includes(optIndex)}
                                                    onChange={() => toggleCorrect(qIndex, optIndex)}
                                                    className="w-5 h-5 text-indigo-600"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                    className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder={`Option ${optIndex + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={addQuestion} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2 font-bold">
                        <Plus size={20} /> Add Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditQuiz;
