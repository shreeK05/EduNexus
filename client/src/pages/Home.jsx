import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, Video, BarChart2, ArrowRight, Sparkles, Brain, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen mesh-gradient selection:bg-indigo-500/30 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight gradient-text">EduNexus</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="nav-link">Features</a>
            <a href="#proctoring" className="nav-link">AI Proctoring</a>
            <div className="h-6 w-px bg-slate-800"></div>
            <button onClick={() => navigate('/login')} className="nav-link hover:text-indigo-400">Log in</button>
            <button 
              onClick={() => navigate('/register')} 
              className="btn-premium px-6 py-2.5 text-sm"
            >
              Get Started <Sparkles size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-8"
          >
            <Zap size={16} className="text-indigo-400 animate-pulse" />
            <span>Next Generation LMS is here</span>
          </motion.div>

          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-extrabold leading-[1.1] tracking-tight mb-8"
          >
            Master Your Future <br />
            <span className="gradient-text">With AI Precision.</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-400 leading-relaxed max-w-2xl mb-12"
          >
            The world's most advanced learning operating system. Secure AI proctoring, 
            seamless collaboration, and data-driven success — all in one elegant platform.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <button 
              onClick={() => navigate('/login?role=STUDENT')} 
              className="btn-premium px-10 py-5 text-lg group"
            >
              Student Portal <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/login?role=TEACHER')} 
              className="btn-secondary px-10 py-5 text-lg"
            >
              Teacher Console <Brain className="text-indigo-400" />
            </button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: <ShieldCheck size={32} />, 
                title: "AI-Gen Sentinel", 
                desc: "Real-time cheating detection using advanced facial analysis and behavior tracking.",
                color: "text-indigo-400"
              },
              { 
                icon: <Video size={32} />, 
                title: "Holographic Rooms", 
                desc: "Zero-latency video communication for immersive classroom experiences.",
                color: "text-pink-400"
              },
              { 
                icon: <BarChart2 size={32} />, 
                title: "Neural Analytics", 
                desc: "Predictive performance modeling to help students excel in their learning journey.",
                color: "text-purple-400"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="glass-card p-10 rounded-3xl group"
              >
                <div className={`${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-24 border-y border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Active Students", value: "50k+" },
            { label: "Quizzes Hosted", value: "1.2M" },
            { label: "Institutions", value: "200+" },
            { label: "Uptime", value: "99.9%" }
          ].map((stat, i) => (
            <div key={stat.label}>
              <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-16 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl border border-indigo-500/30">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EduNexus</span>
          </div>
          
          <div className="flex gap-10 text-slate-500 font-medium text-sm">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Security</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Contact</a>
          </div>

          <div className="text-slate-500 text-sm font-medium">
            &copy; 2026 EduNexus Quantum Labs. Built for Excellence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;