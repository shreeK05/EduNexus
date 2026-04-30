import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { 
  CheckCircle, XCircle, TrendingUp, Users, Brain, 
  Activity, ShieldCheck, Zap, BarChart3, PieChart as PieIcon,
  Trophy, Clock, ChevronRight, Star, Target
} from 'lucide-react';

const AnalyticsTab = ({ classId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : null;

        const [analyticsRes, classRes] = await Promise.all([
          axios.get(`https://edunexus-api-w6xc.onrender.com/api/classes/${classId}/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`https://edunexus-api-w6xc.onrender.com/api/classes/details/${classId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setData({ ...analyticsRes.data, totalStudents: classRes.data.students.length });
      } catch (err) { console.error(err); } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="text-indigo-400 animate-pulse" size={24} />
        </div>
      </div>
      <p className="text-indigo-400/60 font-black uppercase tracking-[0.3em] text-[10px]">Processing Intelligence...</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-[3rem] border-slate-800/50">
      <ShieldCheck size={48} className="text-slate-700 mb-4" />
      <p className="text-slate-500 font-black uppercase tracking-widest text-sm text-center">Analytics Data Empty.<br/>No activity detected.</p>
    </div>
  );

  const { assignments = [], submissions = [], quizzes = [], quizResults = [], totalStudents = 1 } = data;

  // --- DERIVED ANALYTICS ---
  const totalExpectedSubmissions = (assignments.length * totalStudents) || 1;
  const totalSubmissionsDone = submissions.length;
  const totalSubmissionsMissing = Math.max(0, totalExpectedSubmissions - totalSubmissionsDone);

  const submissionRate = Math.round((totalSubmissionsDone / totalExpectedSubmissions) * 100);

  // Student Rankings (Leaderboard)
  const studentScores = {};
  quizResults.forEach(res => {
    const studentId = res.studentId?._id;
    const studentName = res.studentId?.name;
    if (!studentId) return;

    if (!studentScores[studentId]) studentScores[studentId] = { name: studentName, total: 0, count: 0 };
    
    const quiz = quizzes.find(q => q._id === res.quizId);
    if (quiz) {
      const percentage = (res.score / quiz.questions.length) * 100;
      studentScores[studentId].total += percentage;
      studentScores[studentId].count += 1;
    }
  });

  const leaderboard = Object.values(studentScores)
    .map(s => ({ name: s.name, avg: Math.round(s.total / s.count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  // Quiz Breakdown
  const quizBreakdown = quizzes.map(q => {
    const results = quizResults.filter(r => r.quizId === q._id);
    const avg = results.length 
      ? Math.round(results.reduce((acc, curr) => acc + (curr.score / q.questions.length) * 100, 0) / results.length)
      : 0;
    return { name: q.title.length > 10 ? q.title.slice(0, 10) + "..." : q.title, score: avg };
  }).slice(0, 6);

  const submissionData = [
    { name: 'Submitted', value: totalSubmissionsDone, color: '#10b981' },
    { name: 'Pending', value: totalSubmissionsMissing, color: '#f43f5e' }
  ];

  const classAvg = quizBreakdown.length 
    ? Math.round(quizBreakdown.reduce((a, b) => a + b.score, 0) / quizBreakdown.length)
    : 0;

  // Recent Activity Feed
  const recentActions = [
    ...submissions.map(s => ({ type: 'submission', name: s.studentId?.name, task: 'Assignment', time: s.submittedAt })),
    ...quizResults.map(r => ({ type: 'quiz', name: r.studentId?.name, task: 'Quiz', time: r.createdAt }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-fadeIn">
      
      {/* --- CORE STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          label="Submission Sync"
          value={submissionRate}
          total="100%"
          suffix="%"
          icon={<CheckCircle size={24} />}
          color="indigo"
          desc={`${totalSubmissionsDone} payloads uploaded`}
        />
        <StatCard
          label="Class Knowledge"
          value={classAvg}
          total="100%"
          suffix="%"
          icon={<Brain size={24} />}
          color="amber"
          desc="Average across all quizzes"
        />
        <StatCard
          label="Student Reach"
          value={totalStudents}
          icon={<Users size={24} />}
          color="rose"
          desc="Enrolled in neural cluster"
        />
      </div>

      {/* --- MAIN ANALYTICS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEADERBOARD (High Score Matrix) */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] border-slate-800/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Trophy size={18} />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">High Score Matrix</h3>
            </div>
            
            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <p className="text-center py-10 text-slate-600 font-bold uppercase tracking-widest text-[10px]">No scores recorded.</p>
              ) : (
                leaderboard.map((student, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black 
                        ${i === 0 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-800 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <span className="font-bold text-slate-200 group-hover:text-white">{student.name}</span>
                    </div>
                    <span className="text-amber-400 font-black font-mono">{student.avg}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] border-slate-800/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Clock size={18} />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Activity</h3>
            </div>
            <div className="space-y-6">
              {recentActions.map((action, i) => (
                <div key={i} className="flex gap-4 items-start relative">
                  {i !== recentActions.length - 1 && <div className="absolute left-4 top-10 bottom-0 w-px bg-slate-800"></div>}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 
                    ${action.type === 'quiz' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {action.type === 'quiz' ? <Zap size={14} /> : <FileText size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      <span className="text-white">{action.name}</span> finished {action.task}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-black">{new Date(action.time).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHARTS (Intelligence Matrix) */}
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-panel p-10 rounded-[3rem] border-slate-800/50">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-white text-lg uppercase tracking-tight flex items-center gap-4">
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                  <BarChart3 size={18} />
                </div>
                Quiz Performance Analysis
              </h3>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizBreakdown} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#881337" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                    dy={15}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="url(#barGrad)" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-[2.5rem] border-slate-800/50 flex flex-col items-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Submission Distribution</p>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={submissionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {submissionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-white">{submissionRate}%</span>
                </div>
              </div>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Done</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 p-8 rounded-[2.5rem] flex flex-col justify-center relative overflow-hidden">
               <div className="relative z-10">
                  <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/30 w-fit mb-6">
                    <Brain size={24} className="animate-pulse" />
                  </div>
                  <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">AI Insights</h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    {submissionRate > 80 ? "Attendance and participation are optimal." : "High volume of pending work detected."} 
                    The class is currently operating at <span className="text-indigo-400 font-bold">{classAvg}% accuracy</span>. 
                    Recommended: {classAvg < 50 ? "Schedule a review session." : "Proceed to advanced topics."}
                  </p>
               </div>
               <div className="absolute -right-10 -bottom-10 opacity-5">
                  <Activity size={200} />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, total, percent, suffix = "", icon, color, desc }) => {
  const colorMap = {
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', bar: 'bg-indigo-500' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', bar: 'bg-rose-500' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500' }
  };
  const style = colorMap[color];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[2.5rem] border-slate-800/50 group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${style.bg} ${style.text} group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <h4 className="text-4xl font-black text-white">{value}{suffix}</h4>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} whileInView={{ width: total ? '100%' : '100%' }} className={`h-full ${style.bar}`} />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{desc}</p>
      </div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{payload[0].name || "Score"}</p>
        <p className="text-xl font-black text-white">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const FileText = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

export default AnalyticsTab;