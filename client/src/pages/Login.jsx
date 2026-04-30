import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, AlertTriangle, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('https://edunexus-api-w6xc.onrender.com/api/auth/login', { email, password });
      const user = res.data;

      if (roleParam && user.role !== roleParam) {
        setError(`Access Denied: Log in as a ${roleParam}.`);
        setLoading(false);
        return;
      }

      localStorage.setItem('userInfo', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
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
        <ArrowLeft size={20} /> Back to Orbit
      </motion.button>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-5xl w-full glass-panel rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        {/* Visual Side */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-600 to-violet-700 p-16 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="bg-white/10 w-16 h-16 rounded-2xl backdrop-blur-md mb-12 flex items-center justify-center border border-white/20 shadow-xl">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-5xl font-black mb-6 tracking-tight leading-tight">
              Secure <br />Access.
            </h2>
            <p className="text-indigo-100/70 text-lg font-medium leading-relaxed">
              Login to your {roleParam?.toLowerCase() || 'account'} and continue your journey in the nexus.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-xs font-bold tracking-widest uppercase opacity-50">
            <Sparkles size={14} /> Neural-Link v4.0
          </div>
        </div>

        {/* Form Side */}
        <div className="md:w-7/12 p-16 flex flex-col justify-center bg-slate-900/50">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-3xl font-bold text-white mb-2">Welcome Back</h3>
            <p className="text-slate-400 mb-10 font-medium">Verify your identity to proceed.</p>

            {error && (
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-rose-500/10 text-rose-400 px-5 py-4 rounded-2xl text-sm mb-8 border border-rose-500/20 flex items-center gap-3"
              >
                <AlertTriangle size={18} className="shrink-0" />
                <span className="font-semibold">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Secure Email</label>
                <input
                  type="email"
                  required
                  className="input-premium"
                  placeholder="commander@nexus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Access Cipher</label>
                <input
                  type="password"
                  required
                  className="input-premium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full py-5 text-lg mt-4 shadow-indigo-500/20"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center gap-2">Initiate Sync <Sparkles size={18} /></span>
                )}
              </button>
            </form>

            <p className="mt-12 text-center text-sm text-slate-500 font-medium">
              New to the platform? {' '}
              <button 
                onClick={() => navigate(roleParam ? `/register?role=${roleParam}` : '/register')} 
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
              >
                Create {roleParam?.toLowerCase() || ''} profile
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;