import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AnalyticsTab from '../components/AnalyticsTab';
import {
  ArrowLeft, Video, Trash2, Plus, FileText, Calendar, Users, BarChart2,
  MessageSquare, MoreVertical, X, Check, Download, AlertCircle, Clock, 
  Send, Share2, Copy, Zap, GraduationCap, ShieldCheck, Terminal, ChevronRight, Activity
} from 'lucide-react';

const Classroom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [classroom, setClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('stream');
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', file: null });
  const [submissionFile, setSubmissionFile] = useState(null);
  const [announcementContent, setAnnouncementContent] = useState('');
  const [submissionsList, setSubmissionsList] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) setUser(storedUser);
    else navigate('/');

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        const [classRes, assignRes, announceRes, quizRes] = await Promise.all([
          axios.get(`https://edunexus-api-w6xc.onrender.com/api/classes/details/${id}`, config),
          axios.get(`https://edunexus-api-w6xc.onrender.com/api/assignments/${id}`, config),
          axios.get(`https://edunexus-api-w6xc.onrender.com/api/announcements/${id}`, config),
          axios.get(`https://edunexus-api-w6xc.onrender.com/api/quizzes/class/${id}`, config)
        ]);
        setClassroom(classRes.data);
        setAssignments(assignRes.data);
        setAnnouncements(announceRes.data);
        setQuizzes(quizRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [id, navigate]);

  const getAuthHeader = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
  };

  const handleStartClass = async () => {
    if (user.role !== 'TEACHER') return;
    try {
      await axios.put(`https://edunexus-api-w6xc.onrender.com/api/classes/${id}/live`, { isLive: true }, getAuthHeader());
      window.open(`/video/${id}`, '_blank');
      setClassroom(prev => ({ ...prev, isLive: true }));
    } catch (err) { alert("Error starting class"); }
  };

  const handleJoinClass = async () => {
    try {
      const res = await axios.get(`https://edunexus-api-w6xc.onrender.com/api/classes/details/${id}`, getAuthHeader());
      if (res.data.isLive) navigate(`/video/${id}`);
      else alert("🚫 The teacher has not started the live class yet.");
    } catch (err) { alert("Error checking class status"); }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementContent.trim()) return;
    try {
      await axios.post('https://edunexus-api-w6xc.onrender.com/api/announcements/create', {
        classId: id, senderId: user._id, content: announcementContent
      }, getAuthHeader());
      setAnnouncementContent('');
      const res = await axios.get(`https://edunexus-api-w6xc.onrender.com/api/announcements/${id}`, getAuthHeader());
      setAnnouncements(res.data);
    } catch (err) { alert('Failed to post'); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(classroom.code);
    alert('Access code copied to neural link.');
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('classId', id);
    formData.append('title', newAssignment.title);
    formData.append('description', newAssignment.description);
    formData.append('dueDate', newAssignment.dueDate);
    if (newAssignment.file) formData.append('file', newAssignment.file);

    try {
      await axios.post('https://edunexus-api-w6xc.onrender.com/api/assignments/create', formData, {
        headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
      });
      setShowCreateModal(false);
      const res = await axios.get(`https://edunexus-api-w6xc.onrender.com/api/assignments/${id}`, getAuthHeader());
      setAssignments(res.data);
    } catch (err) { alert('Failed to deploy directive'); }
  };

  const submitWork = async (assignmentId) => {
    if (!submissionFile) return alert('Select a payload to uplink.');
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('studentId', user._id);
    formData.append('file', submissionFile);

    try {
      await axios.post('https://edunexus-api-w6xc.onrender.com/api/assignments/submit', formData, {
        headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
      });
      alert('Payload uplinked successfully.');
      setSubmissionFile(null);
    } catch (err) { alert('Uplink failed'); }
  };

  const handleViewSubmissions = async (assignmentId) => {
    try {
      const res = await axios.get(`https://edunexus-api-w6xc.onrender.com/api/assignments/submissions/${assignmentId}`, getAuthHeader());
      setSubmissionsList(res.data);
      setShowSubmissionsModal(true);
    } catch (err) { alert('Failed to inspect submissions'); }
  };

  const submitGrade = async (submissionId) => {
    const data = grades[submissionId];
    if (!data?.score) return alert('Input score for authorize.');
    try {
      await axios.put(`https://edunexus-api-w6xc.onrender.com/api/assignments/grade/${submissionId}`, {
        grade: data.score, feedback: data.feedback
      }, getAuthHeader());
      alert('Grade authorized.');
      // Refresh list
      const currentSub = submissionsList.find(s => s._id === submissionId);
      if (currentSub) handleViewSubmissions(currentSub.assignmentId);
    } catch (err) { alert('Grade authorization failed'); }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Terminate this assessment module?")) return;
    try {
      await axios.delete(`https://edunexus-api-w6xc.onrender.com/api/quizzes/${quizId}`, getAuthHeader());
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
    } catch (err) { alert('Termination failed'); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this broadcast?")) return;
    try {
      await axios.delete(`https://edunexus-api-w6xc.onrender.com/api/announcements/${id}`, getAuthHeader());
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch (err) { alert('Failed to delete announcement'); }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Sever link with this entity?")) return;
    try {
      await axios.delete(`https://edunexus-api-w6xc.onrender.com/api/classes/${id}/students/${studentId}`, getAuthHeader());
      setClassroom(prev => ({ ...prev, students: prev.students.filter(s => s._id !== studentId) }));
    } catch (err) { alert('Link severance failed'); }
  };

  if (!classroom || !user) return <div className="h-screen bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div></div>;

  const tabs = [
    { id: 'stream', label: 'Broadcast', icon: <Zap size={18} /> },
    { id: 'classwork', label: 'Modules', icon: <Terminal size={18} /> },
    { id: 'people', label: 'Entities', icon: <Users size={18} /> },
    ...(user.role === 'TEACHER' ? [{ id: 'analytics', label: 'Intelligence', icon: <BarChart2 size={18} /> }] : [])
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* --- COMMAND BAR --- */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                {classroom.name}
                <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 tracking-widest uppercase">
                  {classroom.section}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user.role === 'TEACHER' ? (
              <button 
                onClick={handleStartClass} 
                className="btn-premium px-6 py-2.5 text-sm shadow-indigo-500/20"
              >
                <Video size={18} /> Establish Live Link
              </button>
            ) : (
              <button 
                onClick={handleJoinClass} 
                disabled={!classroom.isLive} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300
                  ${classroom.isLive ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}
                `}
              >
                <Video size={18} /> {classroom.isLive ? 'JOIN LIVE UPLINK' : 'AWAITING LINK...'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-2 py-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all
                ${activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'}
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-10 animate-fadeIn">
        
        {/* --- BROADCAST TAB --- */}
        {activeTab === 'stream' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-8 rounded-[2rem] border-slate-800/50"
              >
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Access</p>
                <div 
                  onClick={copyCode}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-3xl font-black text-indigo-400 tracking-widest font-mono group-hover:text-indigo-300 transition-colors">
                    {classroom.code}
                  </span>
                  <Copy size={20} className="text-slate-600 group-hover:text-indigo-400 transition-all" />
                </div>
                <p className="text-[10px] text-slate-600 mt-4 font-bold uppercase">Share this code with entities.</p>
              </motion.div>

              <div className="glass-panel p-8 rounded-[2rem] border-slate-800/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Metadata</p>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-600 block uppercase font-bold mb-1">Domain</span>
                    <p className="font-bold text-white tracking-tight">{classroom.subject}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block uppercase font-bold mb-1">Sub-Cluster</span>
                    <p className="font-bold text-white tracking-tight">{classroom.section}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              {/* Announcement Input */}
              {user.role === 'TEACHER' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-[2rem] border-slate-800 focus-within:border-indigo-500/50 transition-all"
                >
                  <form onSubmit={handlePostAnnouncement}>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
                        {user.name[0]}
                      </div>
                      <div className="flex-1">
                        <textarea
                          className="w-full bg-transparent outline-none text-white placeholder:text-slate-600 resize-none pt-3 text-lg font-medium"
                          placeholder="Broadcast a directive to the cluster..."
                          rows={2}
                          value={announcementContent}
                          onChange={(e) => setAnnouncementContent(e.target.value)}
                        ></textarea>
                        {announcementContent.trim() && (
                          <div className="flex justify-end mt-4 pt-4 border-t border-slate-800/50">
                            <button type="submit" className="btn-premium px-8 py-2 text-sm shadow-indigo-500/10">
                              Release Directive <Send size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Announcements Feed */}
              <div className="space-y-6">
                <AnimatePresence>
                  {announcements.length === 0 ? (
                    <div className="text-center py-20 glass-panel rounded-[2rem] border-dashed border-slate-800 opacity-50">
                      <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Awaiting Network Broadcasts</p>
                    </div>
                  ) : (
                    announcements.map((post, i) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={post._id} 
                        className="glass-panel p-8 rounded-[2rem] border-slate-800/50 hover:border-slate-700 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 font-black border border-slate-700">
                              {post.senderId?.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-white tracking-tight">{post.senderId?.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          {user.role === 'TEACHER' && (
                            <button 
                              onClick={() => handleDeleteAnnouncement(post._id)}
                              className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-lg font-medium pl-16">
                          {post.content}
                        </p>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* --- MODULES TAB (CLASSWORK) --- */}
        {activeTab === 'classwork' && (
          <div className="max-w-5xl mx-auto space-y-12">
            {user.role === 'TEACHER' && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 p-10 rounded-[3rem] shadow-2xl shadow-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Module Deployment</h3>
                  <p className="text-indigo-100/70 font-medium">Inject new assessment modules or directives into the cluster.</p>
                </div>
                <div className="flex gap-4 relative z-10 w-full md:w-auto">
                  <button onClick={() => setShowCreateModal(true)} className="flex-1 btn-secondary bg-white text-indigo-600 px-8 py-4 text-sm font-black uppercase tracking-widest shadow-xl">
                    <Plus size={18} /> Assignment
                  </button>
                  <button onClick={() => navigate(`/class/${id}/create-quiz`)} className="flex-1 bg-black/20 hover:bg-black/30 border border-white/20 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all">
                    <FileText size={18} /> Neural Quiz
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              </motion.div>
            )}

            {/* Quizzes Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Assessment Modules</h3>
              </div>
              
              <div className="grid gap-6">
                {quizzes.length === 0 ? (
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs py-10 text-center border border-dashed border-slate-800 rounded-[2rem]">No active assessments detected.</p>
                ) : (
                  quizzes.map(quiz => {
                    const now = new Date();
                    const startTime = new Date(quiz.startDate || 0);
                    const dueTime = new Date(quiz.dueDate || 8640000000000000);
                    const isScheduled = now < startTime;
                    const isExpired = now > dueTime;

                    return (
                      <motion.div 
                        key={quiz._id} 
                        className={`glass-panel p-8 rounded-[2.5rem] border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8 transition-all duration-300 hover:border-indigo-500/30 ${isExpired ? 'opacity-60 grayscale' : ''}`}
                      >
                        <div className="flex gap-6 items-center flex-1 w-full">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${isExpired ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            <Zap size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-white flex items-center gap-3">
                              {quiz.title}
                              {isExpired && <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full uppercase font-black tracking-widest border border-slate-700">Offline</span>}
                              {isScheduled && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full uppercase font-black tracking-widest border border-amber-500/20">Queued</span>}
                            </h4>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">
                              Due: {dueTime.toLocaleDateString()} • {quiz.questions?.length || 0} Synaptic Nodes
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                          {user.role === 'TEACHER' ? (
                            <div className="flex items-center gap-3 w-full">
                              <button onClick={() => navigate(`/class/${quiz._id}/live`)} className="flex-1 btn-premium from-rose-600 to-pink-700 px-6 py-3 text-xs uppercase tracking-widest font-black shadow-rose-500/20">
                                <Activity size={16} /> Live Monitor
                              </button>
                              <button onClick={() => handleDeleteQuiz(quiz._id)} className="p-3 bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 rounded-xl transition-all">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ) : (
                            !isScheduled && !isExpired ? (
                              <button onClick={() => navigate(`/quiz/take/${quiz._id}`)} className="w-full btn-premium px-10 py-4 text-sm uppercase tracking-[0.2em] font-black shadow-indigo-500/20">
                                Start Session
                              </button>
                            ) : (
                              <div className="px-10 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600">Locked</div>
                            )
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Assignments Section */}
            <div className="space-y-6 pt-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Terminal size={20} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">OperationalDirectives</h3>
              </div>
              
              <div className="grid gap-6">
                {assignments.length === 0 ? (
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs py-10 text-center border border-dashed border-slate-800 rounded-[2rem]">No operational directives found.</p>
                ) : (
                  assignments.map(assign => (
                    <motion.div 
                      key={assign._id} 
                      className="glass-panel p-10 rounded-[3rem] border-slate-800/50 hover:border-indigo-500/30 transition-all duration-500"
                    >
                      <div className="flex flex-col lg:flex-row justify-between gap-10">
                        <div className="flex-1">
                          <div className="flex items-start gap-8">
                            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/5">
                              <FileText size={32} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-2xl font-black text-white tracking-tight mb-3">{assign.title}</h4>
                              <p className="text-slate-400 font-medium leading-relaxed mb-8">{assign.description}</p>
                              
                              {assign.fileUrl && (
                                <a 
                                  href={assign.fileUrl} 
                                  target="_blank" 
                                  className="inline-flex items-center gap-3 text-xs text-indigo-400 font-black uppercase tracking-widest bg-indigo-500/5 border border-indigo-500/10 px-5 py-3 rounded-2xl hover:bg-indigo-500/10 transition-all"
                                >
                                  <Download size={16} /> Directive.pdf
                                </a>
                              )}

                              {user.role === 'STUDENT' && (
                                <div className="mt-10 p-6 bg-slate-950/50 rounded-[2rem] border border-slate-800/50">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Upload</p>
                                  <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <input 
                                      type="file" 
                                      className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-800 file:text-white hover:file:bg-slate-700 transition-all" 
                                      onChange={(e) => setSubmissionFile(e.target.files[0])} 
                                    />
                                    <button 
                                      onClick={() => submitWork(assign._id)} 
                                      className="btn-premium px-10 py-2.5 text-xs font-black shadow-indigo-500/10 whitespace-nowrap"
                                    >
                                      UPLINK
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end justify-between min-w-[200px]">
                          <div className="flex flex-col lg:items-end">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Expiry Date</span>
                            <span className="text-lg font-black text-rose-400 tracking-tight">{new Date(assign.dueDate).toLocaleDateString()}</span>
                          </div>
                          
                          {user.role === 'TEACHER' && (
                            <button 
                              onClick={() => handleViewSubmissions(assign._id)} 
                              className="w-full btn-secondary py-4 text-xs font-black uppercase tracking-widest border-slate-800 hover:bg-slate-800/50"
                            >
                              Inspect Submissions <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- ENTITIES TAB (PEOPLE) --- */}
        {activeTab === 'people' && (
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="glass-panel overflow-hidden rounded-[2.5rem] border-slate-800/50">
              <div className="px-8 py-6 bg-slate-900/30 border-b border-slate-800/50">
                <h3 className="font-black text-indigo-400 uppercase tracking-widest text-sm">Cluster Overseer</h3>
              </div>
              <div className="p-10 flex items-center gap-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                  {classroom.teacherId?.name[0]}
                </div>
                <div>
                  <p className="text-3xl font-black text-white tracking-tight">{classroom.teacherId?.name}</p>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">{classroom.teacherId?.email}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel overflow-hidden rounded-[2.5rem] border-slate-800/50">
              <div className="px-8 py-6 bg-slate-900/30 border-b border-slate-800/50 flex justify-between items-center">
                <h3 className="font-black text-white uppercase tracking-widest text-sm">Connected Entities</h3>
                <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black border border-indigo-500/20">
                  {classroom.students?.length || 0} NODES
                </span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {classroom.students?.map((student) => (
                  <div key={student._id} className="p-6 px-10 flex justify-between items-center hover:bg-slate-900/40 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 font-black border border-slate-800 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-all">
                        {student.name[0]}
                      </div>
                      <span className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">{student.name}</span>
                    </div>
                    {user.role === 'TEACHER' && (
                      <button onClick={() => handleRemoveStudent(student._id)} className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- INTELLIGENCE TAB (ANALYTICS) --- */}
        {activeTab === 'analytics' && user.role === 'TEACHER' && (
          <AnalyticsTab classId={id} user={user} />
        )}
      </main>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl w-full max-w-2xl relative z-10">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Deploy Directive</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={28} /></button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Title</label>
                  <input className="input-premium" placeholder="Assignment Title" onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Instructions</label>
                  <textarea className="input-premium resize-none" rows="4" placeholder="Detailed directive instructions..." onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Deadline</label>
                    <input type="date" className="input-premium" onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Data Asset</label>
                    <input type="file" className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-800 file:text-white hover:file:bg-slate-700 transition-all" onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })} />
                  </div>
                </div>
                <button type="submit" className="btn-premium w-full py-5 text-lg shadow-indigo-500/20 mt-4">Confirm Deployment</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSubmissionsModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSubmissionsModal(false)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl w-full max-w-5xl relative z-10 max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-10 shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Entity Inspection</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">Reviewing synaptic data submissions from the cluster.</p>
                </div>
                <button onClick={() => setShowSubmissionsModal(false)} className="p-3 hover:bg-slate-800 rounded-full transition-colors"><X size={32} /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6">
                {submissionsList.length === 0 ? (
                  <div className="text-center py-32 border border-dashed border-slate-800 rounded-[3rem]">
                    <FileText size={64} className="mx-auto mb-6 text-slate-800" />
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No active data streams detected</p>
                  </div>
                ) : (
                  submissionsList.map((sub) => (
                    <motion.div key={sub._id} className="glass-panel p-10 rounded-[3rem] border-slate-800/50 flex flex-col lg:flex-row justify-between gap-10 hover:border-slate-700 transition-all">
                      <div className="flex-1">
                        <h4 className="text-2xl font-black text-white tracking-tight mb-2">{sub.studentId?.name}</h4>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Received: {new Date(sub.submittedAt).toLocaleDateString()} • {new Date(sub.submittedAt).toLocaleTimeString()}</p>
                        <a href={sub.fileUrl} target="_blank" className="btn-secondary px-8 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-3 w-fit">
                          <FileText size={18} /> View Payload
                        </a>
                      </div>

                      <div className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-slate-800 lg:w-1/2">
                        {sub.status === 'Graded' ? (
                          <div className="flex justify-between items-center h-full">
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Sync Quality</p>
                              <p className="text-5xl font-black text-emerald-500 tracking-tighter">{sub.grade}<span className="text-lg text-slate-600">/100</span></p>
                            </div>
                            <div className="text-right max-w-[200px]">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Feedback</p>
                              <p className="text-sm text-slate-300 font-medium italic leading-relaxed">"{sub.feedback || "Nominal data match."}"</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-6">
                              <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Score</label>
                                <input type="number" placeholder="0" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl outline-none focus:border-indigo-500 font-black text-3xl text-center" onChange={(e) => setGrades({ ...grades, [sub._id]: { ...grades[sub._id], score: e.target.value } })} />
                              </div>
                              <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Direct Feedback</label>
                                <input type="text" placeholder="Neural log feedback..." className="input-premium" onChange={(e) => setGrades({ ...grades, [sub._id]: { ...grades[sub._id], feedback: e.target.value } })} />
                              </div>
                            </div>
                            <button onClick={() => submitGrade(sub._id)} className="btn-premium w-full py-4 text-sm font-black shadow-indigo-500/10 uppercase tracking-widest">Authorize Grade</button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Classroom;