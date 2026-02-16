import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, BookOpen, LogOut, Plus, Search,
  ChevronRight, BarChart2, Users, GraduationCap, BookMarked
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', section: '', subject: '', code: '' });
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0, avgClassSize: 0 });

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
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo ? userInfo.token : null;

      const res = await axios.get(`https://edunexus-api-w6xc.onrender.com/api/classes/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);

      // Calculate REAL stats
      const totalClasses = res.data.length;
      const totalStudents = res.data.reduce((acc, curr) => acc + (curr.students?.length || 0), 0);
      const avgClassSize = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

      setStats({
        totalClasses,
        totalStudents,
        avgClassSize
      });

    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo ? userInfo.token : null;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (user.role === 'TEACHER') {
        await axios.post('https://edunexus-api-w6xc.onrender.com/api/classes/create', { ...formData, teacherId: user._id }, config);
        alert('Classroom Created Successfully!');
      } else {
        await axios.post('https://edunexus-api-w6xc.onrender.com/api/classes/join', { code: formData.code, studentId: user._id }, config);
        alert('Joined Class Successfully!');
      }
      setShowModal(false);
      fetchClasses(user._id);
    } catch (err) { alert(err.response?.data?.message || 'Something went wrong'); }
  };

  if (!user) return null;

  const isTeacher = user.role === 'TEACHER';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10 transition-all shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 h-20">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-200">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">EduNexus</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 mt-2">Main Menu</p>
          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          </nav>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-2">Account</p>
          <nav className="space-y-1">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 font-medium rounded-lg hover:bg-red-50 w-full transition group">
              <LogOut size={20} className="group-hover:scale-110 transition-transform" /> Logout
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              {user.name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-8 transition-all max-w-7xl">

        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 h-12">
          <div className="relative w-96 hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition" size={20} />
            <input
              type="text"
              placeholder="Search classes, students..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition shadow-sm"
            />
          </div>

          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200">
            <Plus size={20} /> {isTeacher ? 'Create Class' : 'Join Class'}
          </button>
        </header>

        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 mt-2 text-lg">{isTeacher ? 'Manage your classrooms and students.' : 'Your enrolled classes and assignments.'}</p>
        </div>

        {/* Real Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title={isTeacher ? "Total Classes" : "Enrolled Classes"}
            value={stats.totalClasses}
            icon={<BookOpen size={24} />}
            color="bg-blue-50 text-blue-600 border-blue-100"
          />
          <StatCard
            title={isTeacher ? "Total Students" : "Classmates"}
            value={stats.totalStudents}
            icon={<Users size={24} />}
            color="bg-indigo-50 text-indigo-600 border-indigo-100"
          />
          <StatCard
            title="Avg. Class Size"
            value={stats.avgClassSize}
            icon={<BarChart2 size={24} />}
            color="bg-emerald-50 text-emerald-600 border-emerald-100"
          />
        </div>

        {/* MY CLASSES SECTION - TOP PRIORITY */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {isTeacher ? <GraduationCap className="text-indigo-600" size={24} /> : <BookMarked className="text-indigo-600" size={24} />}
              <h3 className="font-bold text-slate-800 text-lg">{isTeacher ? 'My Classes' : 'My Enrolled Classes'}</h3>
            </div>
            <span className="text-sm text-slate-500 font-medium">{classes.length} {classes.length === 1 ? 'class' : 'classes'}</span>
          </div>

          {/* TEACHER VIEW - Grid Cards */}
          {isTeacher ? (
            <div className="p-6">
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-400 mb-4">No classes created yet.</p>
                  <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition inline-flex items-center gap-2">
                    <Plus size={18} /> Create Your First Class
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((cls) => (
                    <div
                      key={cls._id}
                      onClick={() => navigate(`/class/${cls._id}`)}
                      className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
                      <div className="relative z-10">
                        <h4 className="font-bold text-xl mb-2">{cls.name}</h4>
                        <p className="text-indigo-100 text-sm mb-4">{cls.subject} • {cls.section}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Users size={16} />
                            <span>{cls.students?.length || 0} students</span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-mono">
                            {cls.code}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* STUDENT VIEW - List Cards */
            <div className="divide-y divide-slate-100">
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <BookMarked size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-400 mb-4">You haven't joined any classes yet.</p>
                  <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition inline-flex items-center gap-2">
                    <Plus size={18} /> Join Your First Class
                  </button>
                </div>
              ) : (
                classes.map((cls) => (
                  <div
                    key={cls._id}
                    onClick={() => navigate(`/class/${cls._id}`)}
                    className="p-6 hover:bg-slate-50 transition cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {cls.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg mb-1">{cls.name}</h4>
                        <p className="text-slate-500 text-sm">{cls.subject} • Section {cls.section}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{cls.students?.length || 0} students</span>
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-mono">{cls.code}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" size={24} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative scale-95 animate-scaleIn border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {isTeacher ? 'Create Class' : 'Join Class'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isTeacher ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Class Name</label>
                    <input className="input-field" placeholder="e.g. Advanced Physics" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                      <input className="input-field" placeholder="Physics" onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Section</label>
                      <input className="input-field" placeholder="Batch A" onChange={(e) => setFormData({ ...formData, section: e.target.value })} required />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Class Code</label>
                  <input
                    placeholder="6-Digit Code"
                    className="input-field text-center font-mono text-lg tracking-[0.2em] uppercase"
                    maxLength={6}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-2 text-center">Ask your teacher for the class code.</p>
                </div>
              )}
              <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 mt-2 transition transform active:scale-95">
                {isTeacher ? 'Create Classroom' : 'Join Classroom'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---
const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition font-medium text-sm mb-1
        ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
    {icon}
    <span>{label}</span>
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5 hover:shadow-md transition ${color.split(' ')[2] || 'border-slate-100'}`}>
    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shrink-0 ${color.split(' ').slice(0, 2).join(' ')}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      <p className="text-sm text-slate-500 font-bold uppercase tracking-wide opacity-80">{title}</p>
    </div>
  </div>
);

export default Dashboard;