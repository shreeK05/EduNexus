import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { ShieldAlert, AlertTriangle, Play, Pause, Lock, Unlock, Eye, Activity } from 'lucide-react';

const socket = io.connect("https://edunexus-api-d69c.onrender.com");

const LiveProctoring = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState({});

  useEffect(() => {
    socket.emit('join_quiz', quizId);

    const handleUpdate = (data) => {
      setStudents((prev) => {
        const existing = prev[data.socketId] || {
          name: data.studentName || "Unknown Student",
          status: 'Active',
          logs: []
        };

        let newStatus = existing.status;
        let newLogs = [...existing.logs];

        if (data.status === 'cheating') {
          newStatus = 'Suspicious';
          const timestamp = new Date().toLocaleTimeString();
          newLogs.unshift({ time: timestamp, message: data.reason }); // Add new logs to top
        } else if (data.status === 'frozen') {
          newStatus = 'Frozen';
        } else if (data.status === 'active') {
          newStatus = 'Active';
        }

        return {
          ...prev,
          [data.socketId]: {
            ...existing,
            name: data.studentName || existing.name,
            status: newStatus,
            logs: newLogs
          }
        };
      });
    };

    socket.on('update_dashboard', handleUpdate);

    return () => {
      socket.off('update_dashboard', handleUpdate);
      socket.emit('leave_quiz', quizId);
    };
  }, [quizId]);

  const sendAction = (targetSocketId, action) => {
    socket.emit('teacher_action', { studentSocketId: targetSocketId, action });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 text-red-500 p-2 rounded-lg animate-pulse">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Live Proctoring Dashboard</h1>
              <p className="text-xs text-slate-400 font-mono">SESSION ID: {quizId}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{Object.keys(students).length}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Students</p>
            </div>
            <button onClick={() => navigate(-1)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm border border-slate-600">
              Exit Session
            </button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto p-6">
        {Object.keys(students).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-50">
            <Eye size={64} className="mb-4" />
            <h2 className="text-2xl font-bold">Waiting for students to join...</h2>
            <p>Ask students to start the quiz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(students).map(([socketId, student]) => {
              const isSuspicious = student.status === 'Suspicious';
              const isFrozen = student.status === 'Frozen';

              return (
                <div key={socketId} className={`
                                    relative bg-slate-800 rounded-xl overflow-hidden shadow-xl border-2 transition-all duration-300
                                    ${isSuspicious ? 'border-red-500 shadow-red-500/20' : isFrozen ? 'border-cyan-500 shadow-cyan-500/20' : 'border-slate-700 hover:border-slate-600'}
                                `}>
                  {/* Status Bar */}
                  <div className={`px-4 py-2 flex justify-between items-center text-xs font-bold uppercase tracking-wider
                                        ${isSuspicious ? 'bg-red-500 text-white' : isFrozen ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-emerald-400'}
                                    `}>
                    <span>{student.status}</span>
                    {isSuspicious && <ShieldAlert size={16} />}
                    {isFrozen && <Lock size={16} />}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold text-slate-300 border border-slate-600">
                        {student.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{student.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">ID: {socketId.slice(0, 8)}...</p>
                      </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-black/40 rounded-lg p-3 h-32 overflow-y-auto custom-scrollbar mb-6 border border-slate-700/50">
                      {student.logs.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center mt-10">No suspicious activity detected.</p>
                      ) : (
                        student.logs.map((log, i) => (
                          <div key={i} className="text-xs mb-2 flex gap-2">
                            <span className="text-slate-500 font-mono shrink-0">[{log.time}]</span>
                            <span className="text-red-400 font-medium">{log.message}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => sendAction(socketId, 'warn')}
                        className="flex flex-col items-center justify-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 py-2 rounded-lg transition border border-amber-500/20"
                        title="Send Warning"
                      >
                        <AlertTriangle size={18} />
                        <span className="text-[10px] font-bold uppercase">Warn</span>
                      </button>

                      {isFrozen ? (
                        <button
                          onClick={() => sendAction(socketId, 'unfreeze')}
                          className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-2 rounded-lg transition border border-emerald-500/20 col-span-2"
                          title="Unfreeze Test"
                        >
                          <Unlock size={18} />
                          <span className="text-[10px] font-bold uppercase">Unfreeze Student</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => sendAction(socketId, 'freeze')}
                          className="flex flex-col items-center justify-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 py-2 rounded-lg transition border border-cyan-500/20 col-span-2"
                          title="Freeze Test"
                        >
                          <Lock size={18} />
                          <span className="text-[10px] font-bold uppercase">Freeze Test</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveProctoring;