import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { 
  CheckCircle, XCircle, TrendingUp, Users, Brain, 
  Activity, ShieldCheck, Zap, BarChart3, PieChart as PieIcon 
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
      <p className="text-slate-500 font-black uppercase tracking-widest text-sm text-center">Neural Matrix Empty.<br/>No data streams detected.</p>
    </div>
  );

  const { assignments = [], submissions = [], quizzes = [], quizResults = [], totalStudents = 1 } = data;

  const totalExpectedSubmissions = (assignments.length * totalStudents) || 1;
  const totalSubmissionsDone = submissions.length;
  const totalSubmissionsMissing = Math.max(0, totalExpectedSubmissions - totalSubmissionsDone);

  const submissionData = [
    { name: 'Executed', value: totalSubmissionsDone, color: '#10b981' },
    { name: 'Pending', value: totalSubmissionsMissing, color: '#f43f5e' }
  ];

  const allQuizScores = quizResults.map(r => {
    const q = quizzes.find(quiz => quiz._id === r.quizId);
    if (!q || !q.questions.length) return 0;
    return (r.score / q.questions.length) * 100;
  });

  const classTestAvg = allQuizScores.length
    ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
    : 0;

  const assignmentAvg = submissions.length
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / submissions.length)
    : 0;

  const quizAvg = allQuizScores.length
    ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
    : 0;

  const performanceData = [
    { name: 'Submissions', score: assignmentAvg, fill: 'url(#gradientIndigo)' },
    { name: 'Synapses', score: quizAvg, fill: 'url(#gradientAmber)' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          label="Submission Rate"
          value={totalSubmissionsDone}
          total={totalExpectedSubmissions}
          percent={Math.round((totalSubmissionsDone / totalExpectedSubmissions) * 100)}
          icon={<CheckCircle size={24} />}
          color="indigo"
        />
        <StatCard
          label="Pending Syncs"
          value={totalSubmissionsMissing}
          total={totalExpectedSubmissions}
          percent={Math.round((totalSubmissionsMissing / totalExpectedSubmissions) * 100)}
          icon={<Activity size={24} />}
          color="rose"
        />
        <StatCard
          label="Neural Accuracy"
          value={`${classTestAvg}%`}
          subtext="Collective Score"
          icon={<Zap size={24} />}
          color="amber"
        />
      </div>

      {/* --- CHARTS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* PIE CHART */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 rounded-[3rem] border-slate-800/50 flex flex-col group hover:border-indigo-500/30 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black text-white text-lg uppercase tracking-tight flex items-center gap-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <PieIcon size={18} />
              </div>
              Submission Distribution
            </h3>
          </div>

          <div className="flex-1 min-h-[350px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={submissionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {submissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-4">
              <span className="text-5xl font-black text-white">{Math.round((totalSubmissionsDone / totalExpectedSubmissions) * 100) || 0}%</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Efficiency</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {submissionData.map((entry, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.name}</span>
                </div>
                <span className="text-sm font-black text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BAR CHART */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 rounded-[3rem] border-slate-800/50 flex flex-col group hover:border-indigo-500/30 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black text-white text-lg uppercase tracking-tight flex items-center gap-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <BarChart3 size={18} />
              </div>
              Performance Matrix
            </h3>
          </div>

          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} barSize={60} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="gradientIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#4338ca" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="gradientAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#b45309" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', letterSpacing: '0.1em' }}
                  axisLine={false}
                  tickLine={false}
                  dy={20}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="score" 
                  radius={[12, 12, 0, 0]} 
                  animationDuration={2000}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 p-6 bg-slate-900/50 rounded-[2rem] border border-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 animate-pulse">
                <Brain size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Intelligence</p>
                <p className="text-sm font-bold text-white mt-0.5">Average cohort accuracy is operating at {classTestAvg}% efficiency.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

const StatCard = ({ label, value, total, percent, icon, color }) => {
  const colorMap = {
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', bar: 'bg-indigo-500' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', bar: 'bg-rose-500' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'bg-amber-500' }
  };

  const style = colorMap[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 rounded-[2.5rem] border-slate-800/50 relative overflow-hidden group"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-2xl ${style.bg} ${style.text} border ${style.border} group-hover:scale-110 transition-transform duration-500`}>
            {icon}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
            <h4 className="text-4xl font-black text-white tracking-tight">{value}</h4>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">{total ? `Sync ${value}/${total}` : 'Overall Score'}</span>
            <span className={style.text}>{total ? `${percent}%` : 'Collective'}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: total ? `${percent}%` : '100%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full ${style.bar} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
            />
          </div>
        </div>
      </div>

      {/* Decor */}
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 ${style.bg} blur-[60px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500`}></div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label || payload[0].name}</p>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].payload.fill }}></div>
          <p className="text-lg font-black text-white">
            {payload[0].value}
            <span className="text-xs text-slate-500 ml-1">{payload[0].name === 'Executed' || payload[0].name === 'Pending' ? 'Nodes' : '%'}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default AnalyticsTab;