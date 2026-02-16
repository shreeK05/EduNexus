import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';

const AnalyticsTab = ({ classId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : null;

        // Parallel fetching for optimized loading
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
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!data) return <div className="text-center p-10 text-slate-500">No data available.</div>;

  const { assignments = [], submissions = [], quizzes = [], quizResults = [], totalStudents = 1 } = data;

  // --- 1. CALCULATIONS ---

  // A. Assignment Submission Status
  // Total expected submissions = (Total Assignments) * (Total Students)
  const totalExpectedSubmissions = (assignments.length * totalStudents) || 1;
  const totalSubmissionsDone = submissions.length;
  const totalSubmissionsMissing = Math.max(0, totalExpectedSubmissions - totalSubmissionsDone);

  const submissionData = [
    { name: 'Submitted', value: totalSubmissionsDone, color: '#10b981' }, // Emerald
    { name: 'Missing', value: totalSubmissionsMissing, color: '#ef4444' } // Red
  ];

  // B. Class Test Average Score
  // Combine all quiz scores and average them
  const allQuizScores = quizResults.map(r => {
    const q = quizzes.find(quiz => quiz._id === r.quizId);
    if (!q || !q.questions.length) return 0;
    return (r.score / q.questions.length) * 100;
  });

  const classTestAvg = allQuizScores.length
    ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
    : 0;

  // C. Assignments vs Quizzes Performance (Bar Chart)
  // Group by "Assignment" vs "Quiz"
  const assignmentAvg = submissions.length
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / submissions.length)
    : 0;

  const quizAvg = allQuizScores.length
    ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
    : 0;

  const performanceData = [
    { name: 'Assignments', score: assignmentAvg, fill: '#6366f1' },
    { name: 'Quizzes', score: quizAvg, fill: '#f59e0b' }
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 space-y-8">

      {/* --- ROW 1: KEY METRICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Assignments Submitted"
          value={totalSubmissionsDone}
          subtext={`/${totalExpectedSubmissions} Expected`}
          icon={<CheckCircle size={24} />}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
        />
        <StatCard
          label="Assignments Missing"
          value={totalSubmissionsMissing}
          subtext="Pending student work"
          icon={<XCircle size={24} />}
          color="text-red-500 bg-red-50 border-red-100"
        />
        <StatCard
          label="Test Class Average"
          value={`${classTestAvg}%`}
          subtext="Across all quizzes"
          icon={<TrendingUp size={24} />}
          color="text-indigo-600 bg-indigo-50 border-indigo-100"
        />
      </div>

      {/* --- ROW 2: CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 1. SUBMISSION STATUS (PIE CHART) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Users size={20} className="text-slate-400" /> Submission Status
          </h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={submissionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {submissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Total Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
              <p className="text-3xl font-extrabold text-slate-800">{Math.round((totalSubmissionsDone / totalExpectedSubmissions) * 100) || 0}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rate</p>
            </div>
          </div>
        </div>

        {/* 2. SCORERS PERFORMANCE (BAR CHART) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-slate-400" /> Average Scores
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 14, fontWeight: 'bold', fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} name="Avg Score (0-100)">
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

const StatCard = ({ label, value, subtext, icon, color }) => (
  <div className={`p-6 rounded-2xl border shadow-sm flex items-start justify-between ${color.replace('text-', 'border-').replace('bg-', 'hover:shadow-md transition ')} bg-white border-slate-200 group`}>
    <div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1 opacity-80">{label}</p>
      <h4 className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</h4>
      <p className="text-xs font-bold mt-2 opacity-60 flex items-center gap-1">
        {subtext}
      </p>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-sm group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  </div>
);

export default AnalyticsTab;