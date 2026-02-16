import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, ArrowLeft } from 'lucide-react';

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
      await axios.post('https://edunexus-api-d69c.onrender.com/api/auth/register', { name, email, password, role });
      alert('Registration Successful! Please Login.');
      navigate(`/login?role=${role}`); // Redirect to login with correct role
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">

      {/* Back Button */}
      <button onClick={() => navigate('/')} className="fixed top-6 left-6 text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-bold transition">
        <ArrowLeft size={20} /> Home
      </button>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex overflow-hidden border border-slate-100">

        {/* Left Side: Visual */}
        <div className="hidden md:flex md:w-5/12 bg-slate-900 p-12 text-white flex-col justify-between relative">
          <div className="z-10">
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">Join <br />EduNexus.</h1>
            <p className="text-slate-400 text-lg">Start your journey with the most advanced AI learning platform.</p>
          </div>
          <div className="z-10 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
              <span>Free for students</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
              <span>AI Proctoring included</span>
            </div>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                <UserPlus size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
              <p className="text-slate-500 mt-2">Enter your personal details to create account</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                    placeholder="e.g. John Doe"
                    value={name} onChange={(e) => setName(e.target.value)} required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">I am a...</label>
                  <select
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none appearance-none"
                    value={role} onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="STUDENT">Student 🎓</option>
                    <option value="TEACHER">Teacher 🧑‍🏫</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                  placeholder="john@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <input
                  type="password"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                />
                <p className="text-xs text-gray-400">Must be at least 8 characters.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account? <span onClick={() => navigate(roleParam ? `/login?role=${roleParam}` : '/login')} className="text-indigo-600 font-bold cursor-pointer hover:underline">Log in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;