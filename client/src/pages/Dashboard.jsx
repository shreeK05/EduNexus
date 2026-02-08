// client/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]); 
  const [showModal, setShowModal] = useState(false); 
  const [formData, setFormData] = useState({ name: '', section: '', subject: '', code: '' });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (!storedUser) {
      navigate('/');
    } else {
      setUser(storedUser);
      fetchClasses(storedUser._id);
    }
  }, [navigate]);

  const fetchClasses = async (userId) => {
    try {
      const res = await axios.get(`https://edunexus-api-ci68.onrender.com/api/classes/${userId}`);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token'); // Also clear the token
    navigate('/');
  };

  // --- NEW: Delete Account Function ---
  const handleDeleteAccount = async () => {
    if (window.confirm("⚠️ Are you sure? This cannot be undone!")) {
      try {
        await axios.delete('https://edunexus-api-ci68.onrender.com/api/auth/delete', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.msg || "Error deleting account");
      }
    }
  };
  // ------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user.role === 'TEACHER') {
        await axios.post('https://edunexus-api-ci68.onrender.com/api/classes/create', { ...formData, teacherId: user._id });
        alert('Classroom Created Successfully!');
      } else {
        await axios.post('https://edunexus-api-ci68.onrender.com/api/classes/join', { code: formData.code, studentId: user._id });
        alert('Joined Class Successfully!');
      }
      setShowModal(false);
      fetchClasses(user._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <div className={`w-64 min-h-screen p-6 text-white flex flex-col ${user.role === 'TEACHER' ? 'bg-indigo-900' : 'bg-blue-800'}`}>
        <h1 className="text-3xl font-bold mb-10 tracking-wider">EduNexus 🎓</h1>
        <nav className="flex-1 space-y-4">
          <button className="flex items-center gap-3 w-full text-left py-3 px-4 bg-white/10 rounded-lg transition hover:bg-white/20">
            🏠 Dashboard
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 w-full text-left py-3 px-4 bg-white text-gray-900 font-bold rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            {user.role === 'TEACHER' ? '➕ Create Class' : '🔗 Join Class'}
          </button>
        </nav>
        
        {/* Bottom Actions */}
        <div className="mt-auto space-y-3">
            <button onClick={handleDeleteAccount} className="w-full py-2 bg-red-900/50 hover:bg-red-800 text-red-200 text-sm rounded transition font-semibold">
            ❌ Delete Account
            </button>
            <button onClick={handleLogout} className="w-full py-2 bg-red-500 rounded hover:bg-red-600 transition font-semibold">
            Logout
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome, {user.name.split(' ')[0]}! 👋
          </h2>
          <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
            user.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role} ACCOUNT
          </span>
        </header>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Classrooms</h3>
        {classes.length === 0 ? (
          <p className="text-gray-500">You haven't joined any classes yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div 
                key={cls._id} 
                onClick={() => navigate(`/class/${cls._id}`)} 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{cls.name}</h4>
                    <p className="text-sm text-gray-500">{cls.section}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                    {cls.subject}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <p className="text-xs text-gray-500">Class Code:</p>
                  <p className="text-lg font-mono font-bold text-indigo-600 tracking-widest">{cls.code}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {user.role === 'TEACHER' ? 'Create New Class' : 'Join a Class'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {user.role === 'TEACHER' ? (
                <>
                  <input placeholder="Class Name" className="w-full p-3 border rounded-lg outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  <input placeholder="Section" className="w-full p-3 border rounded-lg outline-none" onChange={(e) => setFormData({...formData, section: e.target.value})} required />
                  <input placeholder="Subject" className="w-full p-3 border rounded-lg outline-none" onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
                </>
              ) : (
                <input placeholder="Enter 6-Character Class Code" className="w-full p-3 border rounded-lg outline-none font-mono text-center uppercase" maxLength={6} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
              )}
              <button type="submit" className={`w-full py-3 rounded-lg text-white font-bold ${user.role === 'TEACHER' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                {user.role === 'TEACHER' ? 'Generate Class Code' : 'Join Class'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;