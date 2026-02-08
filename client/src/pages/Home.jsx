import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, Video, BarChart2, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">EduNexus</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">About</a>
            <div className="h-4 w-px bg-slate-200"></div>
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition">Log in</button>
            <button onClick={() => navigate('/register')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Get Started</button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <div className="md:w-1/2 space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            New: AI Proctoring 2.0
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Smart Learning.</span>
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
            Empower your institution with AI-driven insights, secure proctored exams, and seamless live classrooms. All in one platform.
          </p>
          
          {/* UPDATED BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button onClick={() => navigate('/login')} className="btn-primary flex items-center justify-center gap-2">
              Student Login <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-lg font-semibold text-slate-700 border border-slate-200 hover:bg-white hover:border-slate-300 transition bg-transparent">
              Teacher Login
            </button>
          </div>
        </div>
        
        {/* Abstract Hero Visual */}
        <div className="md:w-1/2 relative animate-fade-in-up animate-delay-200">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-2xl animate-pulse"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
             <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <img 
               src="https://img.freepik.com/free-vector/online-learning-isometric-concept_1284-17947.jpg" 
               alt="Dashboard Preview" 
               className="w-full h-auto object-cover opacity-90"
             />
          </div>
        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to teach.</h2>
            <p className="text-slate-500">Replace your scattered tools with one cohesive operating system for education.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform text-indigo-600">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Proctoring</h3>
              <p className="text-slate-500 leading-relaxed">
                Detects tab switching, multiple faces, and suspicious objects automatically using browser-based TensorFlow models.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform text-violet-600">
                <Video size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">HD Live Classes</h3>
              <p className="text-slate-500 leading-relaxed">
                Crystal clear video conferencing built directly into the browser. No downloads required for students or teachers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform text-blue-600">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Analytics</h3>
              <p className="text-slate-500 leading-relaxed">
                Track attendance, engagement, and quiz performance with beautiful, real-time data visualizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded">
              <BookOpen size={16} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">EduNexus</span>
          </div>
          <div className="text-sm">
            &copy; 2026 EduNexus Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium">
             <a href="#" className="hover:text-white transition">Privacy</a>
             <a href="#" className="hover:text-white transition">Terms</a>
             <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;