import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsTab = ({ classId, user }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://https://edunexus-api-o8qg.onrender.com/api/classes/${classId}/analytics`);
        setData(res.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [classId]);

  if (!data) return <div className="p-10 text-center text-gray-500">Loading Analytics...</div>;

  const assignments = data.assignments || [];
  const submissions = data.submissions || [];
  const quizzes = data.quizzes || [];
  const quizResults = data.quizResults || [];

  const assignmentStats = assignments.map(assign => {
    const subs = submissions.filter(s => s.assignmentId === assign._id);
    const avgScore = subs.length ? (subs.reduce((acc, curr) => acc + (curr.grade || 0), 0) / subs.length) : 0;
    return { name: assign.title, average: Math.round(avgScore) };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {user.role === 'TEACHER' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4">📊 Assignment Averages</h3>
            <div className="h-64">
              {assignmentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assignmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-gray-400 mt-20">No assignments created yet.</p>}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center">
             <h3 className="font-bold text-gray-700 mb-4">📝 Total Class Submissions</h3>
             <h1 className="text-6xl font-bold text-indigo-600 mb-2">{submissions.length + quizResults.length}</h1>
             <p className="text-gray-500">Assignments & Quizzes Turned In</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">Analytics are available for Teachers only.</div>
      )}
    </div>
  );
};

export default AnalyticsTab;