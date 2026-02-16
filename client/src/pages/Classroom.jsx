import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnalyticsTab from '../components/AnalyticsTab';
import {
  ArrowLeft, Video, Trash2, Plus, FileText, Calendar, Users, BarChart2,
  MessageSquare, MoreVertical, X, Check, Download, AlertCircle, Clock, Send, Share2, Copy
} from 'lucide-react';

const Classroom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE VARIABLES ---
  const [classroom, setClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('stream');
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);

  // Forms & Data
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', file: null });
  const [submissionFile, setSubmissionFile] = useState(null);
  const [announcementContent, setAnnouncementContent] = useState('');
  const [submissionsList, setSubmissionsList] = useState([]);
  const [grades, setGrades] = useState({});

  // --- DATA FETCHING ---
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        const [classRes, assignRes, announceRes, quizRes] = await Promise.all([
          axios.get(`http://localhost:10000/api/classes/details/${id}`, config),
          axios.get(`http://localhost:10000/api/assignments/${id}`, config),
          axios.get(`http://localhost:10000/api/announcements/${id}`, config),
          axios.get(`http://localhost:10000/api/quizzes/class/${id}`, config)
        ]);

        console.log('📚 Assignments fetched:', assignRes.data);
        console.log('🎯 Quizzes fetched:', quizRes.data);
        console.log('🔴 Class isLive status:', classRes.data.isLive);

        setClassroom(classRes.data);
        setAssignments(assignRes.data);
        setAnnouncements(announceRes.data);
        setQuizzes(quizRes.data);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
      }
    };

    fetchData();
  }, [id, navigate]);

  const getAuthHeader = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
  };

  // --- ACTIONS ---
  const handleStartClass = async () => {
    if (user.role !== 'TEACHER') return;
    try {
      await axios.put(`http://localhost:10000/api/classes/${id}/live`, { isLive: true }, getAuthHeader());
      window.open(`/video/${id}`, '_blank');
      setClassroom(prev => ({ ...prev, isLive: true }));
    } catch (err) { alert("Error starting class"); }
  };

  const handleJoinClass = async () => {
    try {
      const res = await axios.get(`http://localhost:10000/api/classes/details/${id}`, getAuthHeader());
      console.log('🔴 Live Class Check - isLive:', res.data.isLive);

      if (res.data.isLive) {
        console.log('✅ Class is LIVE - Navigating to video room');
        navigate(`/video/${id}`);
      } else {
        console.log('❌ Class is NOT live - Blocking access');
        alert("🚫 The teacher has not started the live class yet. Please wait.");
      }
    } catch (err) {
      console.error('❌ Error checking class status:', err);
      alert("Error checking class status");
    }
  };

  const handleDeleteClass = async () => {
    if (window.confirm("⚠️ Are you sure? This will permanently delete the classroom and all its data.")) {
      try {
        await axios.delete(`http://localhost:10000/api/classes/${id}`, getAuthHeader());
        alert("Classroom deleted successfully.");
        navigate('/dashboard');
      } catch (err) {
        alert(err.response?.data?.msg || "Error deleting class");
      }
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementContent.trim()) return;
    try {
      await axios.post('http://localhost:10000/api/announcements/create', {
        classId: id, senderId: user._id, content: announcementContent
      }, getAuthHeader());
      setAnnouncementContent('');
      const res = await axios.get(`http://localhost:10000/api/announcements/${id}`, getAuthHeader());
      setAnnouncements(res.data);
    } catch (err) { alert('Failed to post announcement'); }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`http://localhost:10000/api/quizzes/${quizId}`, getAuthHeader());
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
      alert("Quiz deleted successfully");
    } catch (err) { alert("Failed to delete quiz"); }
  };

  const handleDeleteAnnouncement = async (announceId) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`http://localhost:10000/api/announcements/${announceId}`, getAuthHeader());
      setAnnouncements(prev => prev.filter(a => a._id !== announceId));
      alert("Announcement deleted");
    } catch (err) { alert("Failed to delete announcement"); }
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
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo?.token}`
        }
      };

      await axios.post('http://localhost:10000/api/assignments/create', formData, config);
      alert('Assignment Created!');
      setShowCreateModal(false);
      const res = await axios.get(`http://localhost:10000/api/assignments/${id}`, getAuthHeader());
      setAssignments(res.data);
    } catch (err) { alert('Failed to create assignment'); }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    try {
      await axios.delete(`http://localhost:10000/api/classes/${id}/students/${studentId}`, getAuthHeader());
      setClassroom(prev => ({
        ...prev,
        students: prev.students.filter(s => s._id !== studentId)
      }));
      alert("Student removed successfully");
    } catch (err) { alert("Failed to remove student"); }
  };

  const submitWork = async (assignmentId) => {
    if (!submissionFile) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('studentId', user._id);
    formData.append('file', submissionFile);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo?.token}` } };
      await axios.post('http://localhost:10000/api/assignments/submit', formData, config);
      alert('Work Submitted Successfully!');
      setSubmissionFile(null);
    } catch (err) { alert(err.response?.data?.message || 'Error submitting work'); }
  };

  const handleViewSubmissions = async (assignmentId) => {
    try {
      const res = await axios.get(`http://localhost:10000/api/assignments/${assignmentId}/submissions`, getAuthHeader());
      setSubmissionsList(res.data);
      setShowSubmissionsModal(true);
    } catch (err) { alert('Error fetching submissions'); }
  };

  const submitGrade = async (submissionId) => {
    const data = grades[submissionId];
    if (!data || !data.score) return alert("Please enter a score");
    try {
      await axios.put(`http://localhost:10000/api/assignments/grade/${submissionId}`, { grade: data.score, feedback: data.feedback }, getAuthHeader());
      alert("Graded Successfully!");
      setSubmissionsList(prev => prev.map(sub => sub._id === submissionId ? { ...sub, status: 'Graded', grade: data.score } : sub));
    } catch (err) { alert("Error saving grade"); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(classroom.code);
    alert('Class code copied to clipboard!');
  };


  if (!classroom || !user) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const tabs = [
    { id: 'stream', label: 'Stream', icon: <MessageSquare size={18} /> },
    { id: 'classwork', label: 'Classwork', icon: <FileText size={18} /> },
    { id: 'people', label: 'People', icon: <Users size={18} /> },
    ...(user.role === 'TEACHER' ? [{ id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* --- CLASS HEADER --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {classroom.name}
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">{classroom.section}</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user.role === 'TEACHER' ? (
                <>
                  <button onClick={handleStartClass} className="btn-primary flex items-center gap-2 py-2 px-4 shadow-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition">
                    <Video size={18} /> Start Live
                  </button>
                  <button onClick={handleDeleteClass} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition" title="Delete Class">
                    <Trash2 size={18} />
                  </button>
                </>
              ) : (
                <button onClick={handleJoinClass} disabled={!classroom.isLive} className={`flex items-center gap-2 py-2 px-4 rounded-lg font-bold transition text-sm ${classroom.isLive ? 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  <Video size={18} /> {classroom.isLive ? 'Join Live' : 'Waiting...'}
                </button>
              )}
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex gap-6 mt-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-2 py-3 text-sm font-bold border-b-[3px] transition-colors ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">

        {/* --- 1. STREAM TAB --- */}
        {activeTab === 'stream' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Banner & Class Code (Left Sidebar) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Class Code Card */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Code</h3>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1 transition" onClick={copyCode} title="Click to copy">
                  <span className="text-2xl font-bold text-indigo-600 tracking-wider font-mono">{classroom.code}</span>
                  <Copy size={16} className="text-slate-300" />
                </div>
              </div>

              {/* Subject Details */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</h3>
                <p className="font-bold text-slate-800">{classroom.subject}</p>
                <p className="text-sm text-slate-500 mt-1">{classroom.section}</p>
              </div>
            </div>

            {/* Stream Feed (Right Side) */}
            <div className="lg:col-span-3 space-y-6">

              {/* Hero Banner Area */}
              <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md overflow-hidden flex items-end p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-20 -translate-y-20 blur-3xl"></div>
                <div className="relative z-10 text-white">
                  <h2 className="text-3xl font-extrabold">{classroom.name}</h2>
                  <p className="opacity-90 font-medium">{classroom.subject} • {classroom.section}</p>
                </div>
              </div>

              {/* Announcement Input */}
              {user.role === 'TEACHER' && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-shadow focus-within:shadow-md">
                  <form onSubmit={handlePostAnnouncement}>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                        {user.name[0]}
                      </div>
                      <div className="flex-1">
                        <textarea
                          className="w-full mt-2 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 resize-none"
                          placeholder="Announce something to your class..."
                          rows={2}
                          value={announcementContent}
                          onChange={(e) => setAnnouncementContent(e.target.value)}
                        ></textarea>
                        {announcementContent.trim() && (
                          <div className="flex justify-end mt-2 pt-2 border-t border-slate-50">
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2 text-sm">
                              Post <Send size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Posts List */}
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">No announcements yet.</p>
                  </div>
                ) : (
                  announcements.map((post) => (
                    <div key={post._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-100 transition group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {post.senderId?.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{post.senderId?.name}</p>
                            <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {user.role === 'TEACHER' && (
                          <button onClick={() => handleDeleteAnnouncement(post._id)} className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition rounded-full hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed pl-[3.25rem]">{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 2. CLASSWORK TAB --- */}
        {activeTab === 'classwork' && (
          <div className="max-w-6xl mx-auto space-y-8">
            {user.role === 'TEACHER' && (
              <div className="flex justify-between items-center bg-indigo-600 p-6 rounded-xl shadow-lg shadow-indigo-200 text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg">Create Content</h3>
                  <p className="text-indigo-100 text-sm opacity-90">Add new assignments or quizzes for your students.</p>
                </div>
                <div className="flex gap-3 relative z-10">
                  <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-50 transition shadow-sm text-sm">
                    <Plus size={16} /> Assignment
                  </button>
                  <button onClick={() => navigate(`/class/${id}/create-quiz`)} className="flex items-center gap-2 bg-indigo-500 text-white border border-indigo-400 px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-400 transition text-sm">
                    <FileText size={16} /> Quiz
                  </button>
                </div>

                {/* Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
              </div>
            )}

            {/* Quizzes Section */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <Share2 className="text-indigo-600" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Quizzes & Exams</h3>
              </div>
              <div className="space-y-4">
                {quizzes.length === 0 ? <p className="text-slate-400 text-sm italic pl-2">No quizzes scheduled.</p> : quizzes.map(quiz => {
                  const now = new Date();
                  const startTime = new Date(quiz.startDate || 0);
                  const dueTime = new Date(quiz.dueDate || 8640000000000000);
                  const isScheduled = now < startTime;
                  const isExpired = now > dueTime;

                  return (
                    <div key={quiz._id} className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition hover:shadow-md ${isExpired ? 'border-slate-200 opacity-75' : 'border-indigo-100 hover:border-indigo-300'}`}>
                      <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-lg ${isExpired ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            {quiz.title}
                            {isExpired && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase font-bold tracking-wide">Ended</span>}
                            {isScheduled && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase font-bold tracking-wide">Scheduled</span>}
                          </h4>
                          <p className="text-sm text-slate-500">Due {dueTime.toLocaleDateString()} • {quiz.questions.length} Questions</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {user.role === 'TEACHER' ? (
                          <>
                            {isScheduled && <button onClick={() => navigate(`/class/${id}/edit-quiz/${quiz._id}`)} className="text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition flex items-center gap-2"><FileText size={16} /> View/Edit</button>}
                            {!isExpired && <button onClick={() => navigate(`/class/${quiz._id}/live`)} className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition flex items-center gap-2"><AlertCircle size={16} /> Live Monitor</button>}
                            <button onClick={() => handleDeleteQuiz(quiz._id)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                          </>
                        ) : (
                          !isScheduled && !isExpired ? (
                            <button onClick={() => navigate(`/quiz/take/${quiz._id}`)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Start Quiz</button>
                          ) : (
                            <button disabled className="bg-slate-100 text-slate-400 px-6 py-2.5 rounded-lg font-bold text-sm cursor-not-allowed">Locked</button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assignments Section */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 pt-4">
                <FileText className="text-indigo-600" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Assignments</h3>
              </div>
              <div className="space-y-4">
                {assignments.length === 0 ? <p className="text-slate-400 text-sm italic pl-2">No assignments posted.</p> : assignments.map(assign => (
                  <div key={assign._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition group hover:shadow-md">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">{assign.title}</h4>
                            <p className="text-slate-600 mt-2 text-sm leading-relaxed">{assign.description}</p>
                            {assign.fileUrl && (
                              <a href={assign.fileUrl} target="_blank" className="inline-flex items-center gap-2 mt-3 text-sm text-indigo-600 font-medium hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                <Download size={14} /> Download Attachment
                              </a>
                            )}
                          </div>
                        </div>

                        {user.role === 'STUDENT' && (
                          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-3 pl-[3.5rem]">
                            <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" onChange={(e) => setSubmissionFile(e.target.files[0])} />
                            <button onClick={() => submitWork(assign._id)} className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition whitespace-nowrap">Turn In</button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[140px]">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase tracking-widest">DUE {new Date(assign.dueDate).toLocaleDateString()}</span>
                        {user.role === 'TEACHER' && (
                          <button onClick={() => handleViewSubmissions(assign._id)} className="w-full text-sm bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm">
                            Review <ArrowLeft size={14} className="rotate-180" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 3. PEOPLE TAB --- */}
        {activeTab === 'people' && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Teachers Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-indigo-600 text-lg">Teacher</h3>
              </div>
              <div className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-200">
                  {classroom.teacherId?.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">{classroom.teacherId?.name}</p>
                  <p className="text-sm text-slate-500">{classroom.teacherId?.email}</p>
                </div>
              </div>
            </div>

            {/* Students Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-lg">Classmates</h3>
                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{classroom.students.length} Students</span>
              </div>
              <div className="divide-y divide-slate-50">
                {classroom.students.map((student) => (
                  <div key={student._id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200">
                        {student.name[0]}
                      </div>
                      <span className="font-medium text-slate-700">{student.name}</span>
                    </div>
                    {user.role === 'TEACHER' && (
                      <button onClick={() => handleRemoveStudent(student._id)} className="p-2 text-slate-400 hover:text-red-600 transition rounded-full hover:bg-red-50" title="Remove Student">
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {classroom.students.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-20" />
                    <p>No students have joined this class yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 4. ANALYTICS TAB --- */}
        {activeTab === 'analytics' && user.role === 'TEACHER' && (
          <AnalyticsTab classId={id} user={user} />
        )}
      </div>

      {/* MODALS */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg relative animate-scaleIn border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Plus className="text-indigo-600" /> Create Assignment</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input className="input-field" placeholder="Assignment Title" onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Instructions</label>
                <textarea className="input-field resize-none p-3" rows="3" placeholder="Detailed instructions..." onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                <input type="date" className="input-field" onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Attachment (Optional)</label>
                <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-2">Create Assignment</button>
            </form>
          </div>
        </div>
      )}

      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto animate-scaleIn border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Submissions</h2>
                <p className="text-slate-500 text-sm">Reviewing student work</p>
              </div>
              <button onClick={() => setShowSubmissionsModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            {submissionsList.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">No submissions found for this assignment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissionsList.map((sub) => (
                  <div key={sub._id} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col lg:flex-row justify-between gap-6 hover:border-indigo-200 transition">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{sub.studentId?.name}</h4>
                      <p className="text-sm text-slate-500 mb-2">Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</p>
                      <a href={sub.fileUrl} target="_blank" className="text-indigo-600 font-bold hover:underline text-sm inline-flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded mt-1"><FileText size={14} /> View Work</a>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 lg:w-1/2">
                      {sub.status === 'Graded' ? (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</p>
                            <p className="text-2xl font-bold text-green-600">{sub.grade}<span className="text-sm text-slate-400">/100</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feedback</p>
                            <p className="text-sm text-slate-700 max-w-[200px] truncate">{sub.feedback || "Good job!"}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="w-24">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Score</label>
                              <input type="number" placeholder="0-100" className="w-full p-2 border rounded-lg outline-none focus:border-indigo-500 font-bold text-center" onChange={(e) => setGrades({ ...grades, [sub._id]: { ...grades[sub._id], score: e.target.value } })} />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Feedback</label>
                              <input type="text" placeholder="Write feedback..." className="w-full p-2 border rounded-lg outline-none focus:border-indigo-500" onChange={(e) => setGrades({ ...grades, [sub._id]: { ...grades[sub._id], feedback: e.target.value } })} />
                            </div>
                          </div>
                          <button onClick={() => submitGrade(sub._id)} className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-900 transition">Save Grade</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Classroom;