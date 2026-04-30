import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, ArrowLeft, ShieldCheck, Sparkles, User, Mail, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roleParam || 'STUDENT');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://edunexus-api-w6xc.onrender.com/api/auth/register', { name, email, password, role });
      navigate(`/login?role=${role}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 selection:bg-indigo-500/30">
      
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')} 
        className="fixed top-10 left-10 nav-link text-white flex items-center gap-2 font-bold"
      >
        <ArrowLeft size={20} /> Abort Mission
      </motion.button>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-6xl w-full glass-panel rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        {/* Left Side: Visual */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-indigo-700 to-violet-900 p-16 text-white flex flex-col justify-between relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">Join the <br />Nexus.</h1>
            <p className="text-indigo-100/70 text-lg font-medium">Create your neural profile and start your journey with AI precision.</p>
          </div>

          <div className="relative z-10 space-y-6">
            {[
              { icon: <ShieldCheck className="text-emerald-400" />, text: "Free for students forever" },
              { icon: <Sparkles className="text-amber-400" />, text: "AI Proctoring Sentinel" },
              { icon: <User className="text-indigo-300" />, text: "Verified Teacher Console" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-sm font-bold tracking-wide">
                <div className="p-2 bg-white/10 rounded-lg border border-white/10">{item.icon}</div>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-16 bg-slate-900/50">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">Initialize Profile</h2>
              <p className="text-slate-400 font-medium">Step into the future of learning.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="text"
                      className="input-premium pl-12"
                      placeholder="John Doe"
                      value={name} onChange={(e) => setName(e.target.value)} required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Entity Role</label>
                  <select
                    className="input-premium appearance-none"
                    value={role} onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Terminal</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="email"
                    className="input-premium pl-12"
                    placeholder="john@nexus.edu"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Access Cipher</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="password"
                    className="input-premium pl-12"
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full py-5 text-xl mt-4 shadow-indigo-500/20"
              >
                {loading ? 'SYNCING DATA...' : (
                  <span className="flex items-center gap-2">Establish Link <ChevronRight size={20} /></span>
                )}
              </button>
            </form>

            <p className="mt-12 text-center text-sm text-slate-500 font-medium">
              Already have a profile? {' '}
              <button 
                onClick={() => navigate(roleParam ? `/login?role=${roleParam}` : '/login')} 
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;