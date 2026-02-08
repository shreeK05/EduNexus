import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnalyticsTab from '../components/AnalyticsTab'; 

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

  // --- INITIAL LOAD ---
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
        const [classRes, assignRes, announceRes, quizRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/classes/details/${id}`),
            axios.get(`http://localhost:5000/api/assignments/${id}`),
            axios.get(`http://localhost:5000/api/announcements/${id}`),
            axios.get(`http://localhost:5000/api/quizzes/${id}`) 
        ]);

        setClassroom(classRes.data);
        setAssignments(assignRes.data);
        setAnnouncements(announceRes.data);
        setQuizzes(quizRes.data);
      } catch (err) { console.error(err); }
    };

    fetchData();
  }, [id, navigate]);

  // --- HANDLERS ---
  const handleStartClass = async () => {
      if (user.role !== 'TEACHER') return;
      try {
          await axios.put(`http://localhost:5000/api/classes/${id}/live`, { isLive: true });
          window.open(`/video/${id}`, '_blank');
          setClassroom(prev => ({ ...prev, isLive: true }));
      } catch (err) { alert("Error starting class"); }
  };

  const handleJoinClass = async () => {
      try {
          const res = await axios.get(`http://localhost:5000/api/classes/details/${id}`);
          if (res.data.isLive) {
              window.open(`/video/${id}`, '_blank');
          } else {
              alert("🚫 The teacher has not started the live class yet.");
          }
      } catch (err) { alert("Error checking class status"); }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementContent.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/announcements/create', {
        classId: id, senderId: user._id, content: announcementContent
      });
      setAnnouncementContent(''); 
      const res = await axios.get(`http://localhost:5000/api/announcements/${id}`);
      setAnnouncements(res.data);
    } catch (err) { alert('Failed to post announcement'); }
  };

  const handleFileChange = (e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] });

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('classId', id);
    formData.append('title', newAssignment.title);
    formData.append('description', newAssignment.description);
    formData.append('dueDate', newAssignment.dueDate);
    if (newAssignment.file) formData.append('file', newAssignment.file);

    try {
      await axios.post('http://localhost:5000/api/assignments/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Assignment Created!');
      setShowCreateModal(false);
      const res = await axios.get(`http://localhost:5000/api/assignments/${id}`);
      setAssignments(res.data);
    } catch (err) { alert('Failed to create assignment'); }
  };

  const handleViewSubmissions = async (assignmentId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/assignments/${assignmentId}/submissions`);
      setSubmissionsList(res.data);
      setShowSubmissionsModal(true);
    } catch (err) { alert('Error fetching submissions'); }
  };

  const handleGradeChange = (subId, field, value) => {
    setGrades({ ...grades, [subId]: { ...grades[subId], [field]: value } });
  };

  const submitGrade = async (submissionId) => {
    const data = grades[submissionId];
    if (!data || !data.score) return alert("Please enter a score");
    try {
      await axios.put(`http://localhost:5000/api/assignments/grade/${submissionId}`, { grade: data.score, feedback: data.feedback });
      alert("Graded Successfully!");
      setSubmissionsList(prev => prev.map(sub => sub._id === submissionId ? { ...sub, status: 'Graded', grade: data.score } : sub));
    } catch (err) { alert("Error saving grade"); }
  };

  const handleStudentFileChange = (e) => setSubmissionFile(e.target.files[0]);

  const submitWork = async (assignmentId) => {
    if (!submissionFile) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('studentId', user._id);
    formData.append('file', submissionFile);
    try {
      await axios.post('http://localhost:5000/api/assignments/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Work Submitted Successfully!');
      setSubmissionFile(null);
    } catch (err) { alert(err.response?.data?.message || 'Error submitting work'); }
  };

  if (!classroom || !user) return <div className="p-10 text-center">Loading Classroom...</div>;

  const tabs = user.role === 'TEACHER' 
    ? ['stream', 'classwork', 'people', 'analytics']
    : ['stream', 'classwork', 'people'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <div className="bg-indigo-600 text-white p-8 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="text-indigo-200 hover:text-white mb-4 flex items-center gap-2">← Back to Dashboard</button>
            <h1 className="text-4xl font-bold">{classroom.name}</h1>
            <p className="text-xl mt-2 opacity-90">{classroom.section} • {classroom.subject}</p>
            <p className="mt-4 text-sm bg-indigo-800 inline-block px-3 py-1 rounded">Class Code: <span className="font-mono font-bold">{classroom.code}</span></p>
          </div>
          <div>
             {user.role === 'TEACHER' ? (
                 <button onClick={handleStartClass} className="bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-red-600 transition flex items-center gap-2 transform hover:scale-105">📹 Start Live Class</button>
             ) : (
                 <button onClick={handleJoinClass} className={`${classroom.isLive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white px-6 py-3 rounded-full font-bold shadow-lg transition flex items-center gap-2 transform hover:scale-105`}>
                   {classroom.isLive ? '👋 Join Live Class' : '⏳ Waiting for Teacher...'}
                 </button>
             )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex space-x-8 px-4">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-2 border-b-2 font-medium capitalize transition ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        
        {/* STREAM */}
        {activeTab === 'stream' && (
          <div className="space-y-6">
            {user.role === 'TEACHER' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h3 className="font-bold text-gray-700 mb-4">📢 Announce something</h3>
                <form onSubmit={handlePostAnnouncement}>
                  <textarea className="w-full p-4 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition" rows="3" placeholder="Share updates..." value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)}></textarea>
                  <div className="text-right mt-3"><button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">Post</button></div>
                </form>
              </div>
            )}
            <div className="space-y-4">
              {announcements.length === 0 ? <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300"><p className="text-gray-500">No announcements yet.</p></div> : announcements.map((post) => (
                  <div key={post._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">{post.senderId?.name[0]}</div>
                      <div><p className="font-bold text-gray-800">{post.senderId?.name}</p><p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p></div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* CLASSWORK */}
        {activeTab === 'classwork' && (
          <div>
            {user.role === 'TEACHER' && (
              <div className="flex gap-4 mb-6">
                <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-indigo-700 transition flex items-center gap-2">+ Create Assignment</button>
                <button onClick={() => navigate(`/class/${id}/create-quiz`)} className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-purple-700 transition flex items-center gap-2">📝 Create Quiz</button>
              </div>
            )}

            {/* QUIZZES LIST WITH TIME LOGIC */}
            <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Quizzes</h3>
                {quizzes.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 border border-dashed rounded-lg">No quizzes available.</div>
                ) : (
                    <div className="space-y-4">
                        {quizzes.map((quiz) => {
                            // --- TIME LOGIC ---
                            const now = new Date();
                            const startTime = quiz.startDate ? new Date(quiz.startDate) : new Date(0); // Default to past if missing
                            const dueTime = quiz.dueDate ? new Date(quiz.dueDate) : new Date(8640000000000000); // Default to future if missing
                            
                            const isScheduled = now < startTime;
                            const isExpired = now > dueTime;
                            const isActive = !isScheduled && !isExpired;
                            
                            return (
                                <div key={quiz._id} className={`bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center transition ${isExpired ? 'border-red-200 bg-red-50' : (isScheduled ? 'border-gray-200 bg-gray-50' : 'border-l-4 border-l-purple-500 hover:shadow-md')}`}>
                                    <div>
                                        <h4 className={`font-bold text-lg ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>{quiz.title}</h4>
                                        <p className="text-sm text-gray-500">{quiz.questions.length} Questions</p>
                                        
                                        <div className="flex gap-4 mt-2 text-xs">
                                            <p className={`${isScheduled ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                                                Start: {startTime.toLocaleString()}
                                            </p>
                                            <p className={`${isExpired ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                End: {dueTime.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* STUDENT ACTIONS */}
                                    {user.role === 'STUDENT' && (
                                        isExpired ? (
                                            <span className="px-6 py-2 rounded-full font-bold text-white bg-red-400 cursor-not-allowed">
                                                ⛔ Expired
                                            </span>
                                        ) : isScheduled ? (
                                             <span className="px-6 py-2 rounded-full font-bold text-white bg-gray-400 cursor-not-allowed">
                                                ⏳ Scheduled
                                            </span>
                                        ) : (
                                            <button onClick={() => navigate(`/quiz/take/${quiz._id}`)} className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-purple-700 transition">Start Quiz 📝</button>
                                        )
                                    )}

                                    {/* TEACHER ACTIONS */}
                                    {user.role === 'TEACHER' && (
                                        <button onClick={() => navigate(`/class/${quiz._id}/live`)} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-red-700 transition ml-4">🔴 Live Monitor</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ASSIGNMENTS LIST */}
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Assignments</h3>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 border border-dashed rounded-lg">No assignments posted.</div>
              ) : (
                  assignments.map((assign) => (
                    <div key={assign._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">📄</div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{assign.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{assign.description}</p>
                            {assign.fileUrl && <a href={assign.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-blue-600 font-semibold hover:underline">📎 View Attachment</a>}
                            
                            {user.role === 'STUDENT' && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                  <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={handleStudentFileChange} />
                                  <button onClick={() => submitWork(assign._id)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700">Turn In</button>
                                </div>
                              </div>
                            )}
                            {user.role === 'TEACHER' && (
                              <div className="mt-4"><button onClick={() => handleViewSubmissions(assign._id)} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200 transition">View Submissions ➔</button></div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-400 uppercase">Due Date</span>
                          <p className="text-sm font-semibold text-red-500">{new Date(assign.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* PEOPLE */}
        {activeTab === 'people' && (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
             <div className="p-4 border-b bg-gray-50 font-bold text-indigo-700">Teacher: {classroom.teacherId?.name}</div>
             <div className="p-4 border-b bg-gray-50 font-bold text-blue-700">Students ({classroom.students.length})</div>
             {classroom.students.map((student) => (
               <div key={student._id} className="p-4 border-b flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold">{student.name[0]}</div><span>{student.name}</span></div>
             ))}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && user.role === 'TEACHER' && (
          <AnalyticsTab classId={id} user={user} />
        )}
      </div>

      {/* MODALS (Create Assignment & Submissions) - Hidden for brevity but should be here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg relative">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 font-bold text-xl">&times;</button>
            <h2 className="text-2xl font-bold mb-6">Create Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <input placeholder="Title" className="w-full p-2 border rounded" onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})} required />
              <textarea placeholder="Instructions" className="w-full p-2 border rounded" rows="3" onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}></textarea>
              <input type="date" className="w-full p-2 border rounded" onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})} required />
              <input type="file" className="w-full p-2 border rounded bg-gray-50" onChange={handleFileChange} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Post Assignment</button>
            </form>
          </div>
        </div>
      )}

      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowSubmissionsModal(false)} className="absolute top-4 right-4 text-gray-400 font-bold text-xl">&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Submissions</h2>
            {submissionsList.length === 0 ? <p className="text-gray-500">No students have submitted work.</p> : (
              <div className="space-y-4">
                {submissionsList.map((sub) => (
                  <div key={sub._id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="mb-4 md:mb-0">
                      <p className="font-bold text-lg text-gray-800">{sub.studentId?.name}</p>
                      <p className="text-sm text-gray-500">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                      <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline text-sm block mt-1">📄 View Their File</a>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 items-end">
                      {sub.status === 'Graded' ? (
                        <div className="text-right mr-4"><p className="text-green-600 font-bold text-xl">{sub.grade} / 100</p><p className="text-xs text-gray-500">{sub.feedback || "No feedback"}</p></div>
                      ) : (
                        <>
                          <input type="number" placeholder="Marks" className="w-24 p-2 border rounded text-center" onChange={(e) => handleGradeChange(sub._id, 'score', e.target.value)} />
                          <input type="text" placeholder="Feedback" className="w-48 p-2 border rounded" onChange={(e) => handleGradeChange(sub._id, 'feedback', e.target.value)} />
                          <button onClick={() => submitGrade(sub._id)} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700">Save</button>
                        </>
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