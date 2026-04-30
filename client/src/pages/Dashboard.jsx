import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AnalyticsTab from '../components/AnalyticsTab';
import {
  LayoutDashboard, BookOpen, LogOut, Plus, Search,
  ChevronRight, BarChart2, Users, GraduationCap, 
  BookMarked, Bell, Settings, Sparkles, Terminal, Trash2
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', section: '', subject: '', code: '' });
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0, avgClassSize: 0 });
  const [activeTab, setActiveTab] = useState('overview');

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

      const totalClasses = res.data.length;
      const totalStudents = res.data.reduce((acc, curr) => acc + (curr.students?.length || 0), 0);
      const avgClassSize = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

      setStats({ totalClasses, totalStudents, avgClassSize });
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
      } else {
        await axios.post('https://edunexus-api-w6xc.onrender.com/api/classes/join', { code: formData.code, studentId: user._id }, config);
      }
      setShowModal(false);
      fetchClasses(user._id);
    } catch (err) { alert(err.response?.data?.message || 'Something went wrong'); }
  };

  if (!user) return null;
  const isTeacher = user.role === 'TEACHER';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-2xl border-r border-slate-800/50 hidden lg:flex flex-col fixed h-full z-50">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
            <BookOpen size={24} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">EduNexus</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Command Center</p>
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label={isTeacher ? "Students" : "Classmates"} 
            active={activeTab === 'people'} 
            onClick={() => setActiveTab('people')} 
          />
          <NavItem 
            icon={<BarChart2 size={20} />} 
            label="Analytics" 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
          />
          <NavItem 
            icon={<Bell size={20} />} 
            label="Notifications" 
            badge="3" 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
          />
        </nav>

        <div className="px-4 pb-8 space-y-2">
          <div className="h-px bg-slate-800/50 mx-4 mb-6"></div>
          <NavItem icon={<Settings size={20} />} label="Settings" />
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3.5 text-rose-400 font-bold rounded-2xl hover:bg-rose-500/10 w-full transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 lg:ml-72 min-h-screen relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto p-8 lg:p-12 relative z-10">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-indigo-400 font-bold text-sm mb-2"
              >
                <Terminal size={16} /> 
                <span className="tracking-widest uppercase text-[10px]">Access Level: {user.role}</span>
              </motion.div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Welcome, {user.name.split(' ')[0]} <span className="text-indigo-500">.</span>
              </h1>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Neural Network..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all text-sm"
                />
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="btn-premium px-6 py-3 text-sm whitespace-nowrap shadow-indigo-500/20"
              >
                <Plus size={18} /> {isTeacher ? 'Deploy Class' : 'Link Class'}
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard label={isTeacher ? "Total Classes" : "Enrolled"} value={stats.totalClasses} icon={<BookOpen />} color="indigo" />
            <StatCard label="Total Nodes" value={stats.totalStudents} icon={<Users />} color="purple" />
            <StatCard label="Network Load" value={`${stats.avgClassSize}%`} icon={<BarChart2 />} color="emerald" />
          </div>

          {/* Main Display Area */}
          {activeTab === 'overview' && (
            <section className="glass-panel rounded-[2.5rem] border-slate-800/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <GraduationCap size={20} className="text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg tracking-tight">Active Learning Modules</h3>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                  {classes.length} SYNCED
                </span>
              </div>

              <div className="p-8">
                {classes.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 animate-pulse">
                      <Sparkles size={32} className="text-slate-700" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">No Active Links Detected</h4>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">Initialize your first learning module to begin data synchronization.</p>
                    <button onClick={() => setShowModal(true)} className="btn-secondary px-8 py-3 rounded-2xl">
                      Get Started
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {classes.map((cls, i) => (
                      <motion.div
                        key={cls._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(`/class/${cls._id}`)}
                        className="group relative p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                            {cls.name[0]}
                          </div>
                          <div className="bg-slate-950/50 px-3 py-1 rounded-full text-[10px] font-mono text-indigo-400 border border-indigo-500/20">
                            {cls.code}
                          </div>
                        </div>

                        <h4 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{cls.name}</h4>
                        <p className="text-slate-500 text-sm font-medium mb-6">{cls.subject} • {cls.section}</p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <Users size={14} className="text-indigo-500" />
                            {cls.students?.length || 0} Nodes
                          </div>
                          <div className="p-2 bg-slate-800/50 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'people' && (
            <section className="glass-panel rounded-[2.5rem] border-slate-800/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-800/50 bg-slate-900/30">
                <h3 className="font-bold text-white text-lg tracking-tight">Connected Entities</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classes.flatMap(c => c.students || []).filter((v, i, a) => a.findIndex(t => t._id === v._id) === i).map((student, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 group hover:border-indigo-500/30 transition-all">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 font-black group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        {student.name ? student.name[0] : '?'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{student.name}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{student.email}</p>
                      </div>
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <p className="col-span-full text-center py-20 text-slate-500 font-bold uppercase tracking-widest text-xs">No entities detected in the network.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fadeIn">
              {classes.length > 0 ? (
                <AnalyticsTab classId={classes[0]._id} />
              ) : (
                <div className="text-center py-32 glass-panel rounded-[3rem] border-slate-800/50">
                  <BarChart2 size={48} className="mx-auto mb-6 text-slate-800" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Intelligence data requires an active module.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <section className="glass-panel rounded-[2.5rem] border-slate-800/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-800/50 bg-slate-900/30">
                <h3 className="font-bold text-white text-lg tracking-tight">Network Feed</h3>
              </div>
              <div className="p-12 text-center">
                <Bell size={48} className="mx-auto mb-6 text-slate-800" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No priority transmissions detected.</p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl w-full max-w-lg relative z-10"
            >
              <h2 className="text-3xl font-black text-white mb-2">{isTeacher ? 'Create Module' : 'Link Module'}</h2>
              <p className="text-slate-500 mb-8 font-medium">Initialize a new learning cluster in the network.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isTeacher ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Module Name</label>
                      <input className="input-premium" placeholder="e.g. Advanced Quantum Computing" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Domain</label>
                        <input className="input-premium" placeholder="Science" onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Cluster ID</label>
                        <input className="input-premium" placeholder="Batch-X" onChange={(e) => setFormData({ ...formData, section: e.target.value })} required />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Neural Access Code</label>
                    <input
                      placeholder="XXXXXX"
                      className="input-premium text-center font-mono text-2xl tracking-[0.5em] uppercase"
                      maxLength={6}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                )}
                <button type="submit" className="btn-premium w-full py-5 text-lg shadow-indigo-500/20 mt-4">
                  Confirm Initialization
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ icon, label, active, badge, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group duration-300
    ${active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
    <div className="flex items-center gap-4">
      <span className={`${active ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'}`}>{icon}</span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
    {badge && <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20"
  };
  return (
    <div className={`p-8 rounded-[2rem] bg-gradient-to-br border ${colors[color]} relative overflow-hidden group`}>
      <div className="relative z-10 flex flex-col gap-1">
        <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{label}</span>
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
        {icon && <div className="scale-[2.5]">{icon}</div>}
      </div>
    </div>
  );
};

export default Dashboard;