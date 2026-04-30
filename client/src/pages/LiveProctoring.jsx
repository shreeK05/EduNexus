import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, AlertTriangle, Lock, Unlock, 
  Eye, Activity, Users, ArrowLeft, 
  Terminal, ShieldCheck, Zap
} from 'lucide-react';

const socket = io.connect("https://edunexus-api-w6xc.onrender.com");

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
          newLogs.unshift({ time: timestamp, message: data.reason });
        } else if (data.status === 'frozen') {
          newStatus = 'Frozen';
        } else if (data.status === 'active') {
          newStatus = 'Active';
        }

        const newImage = data.status === 'snapshot' ? data.image : (existing.image || null);

        return {
          ...prev,
          [data.socketId]: {
            ...existing,
            name: data.studentName || existing.name,
            status: newStatus,
            logs: newLogs,
            image: newImage
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

  const activeCount = Object.keys(students).length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* --- COMMAND HEADER --- */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-10 w-px bg-slate-800"></div>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-400" />
                <h1 className="text-xl font-bold tracking-tight">Live Proctoring <span className="text-indigo-500 text-sm font-mono ml-2">v4.0_LIVE</span></h1>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-0.5 uppercase">Quiz ID: {quizId}</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex gap-10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white leading-none">{activeCount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Students</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-emerald-400 leading-none">
                  <Activity size={18} className="animate-pulse" />
                  <span className="text-2xl font-bold">CONNECTED</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status</p>
              </div>
            </div>
            <button className="btn-premium px-6 py-2.5 text-sm">
              <Zap size={16} /> Broadcast Alert
            </button>
          </div>
        </div>
      </header>

      {/* --- GRID DISPLAY --- */}
      <main className="max-w-7xl mx-auto p-10">
        <AnimatePresence mode="popLayout">
          {activeCount === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40 text-slate-600"
            >
              <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 animate-pulse">
                <Users size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Awaiting Student Connections</h2>
              <p className="text-slate-500 font-medium">Students will appear here as they connect to the quiz.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(students).map(([socketId, student]) => {
                const isSuspicious = student.status === 'Suspicious';
                const isFrozen = student.status === 'Frozen';

                return (
                  <motion.div 
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={socketId} 
                    className={`
                      relative glass-panel rounded-3xl overflow-hidden border-2 transition-all duration-500
                      ${isSuspicious ? 'border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.15)] ring-4 ring-rose-500/10' : 
                        isFrozen ? 'border-cyan-500/50' : 'border-slate-800/50 hover:border-indigo-500/30'}
                    `}
                  >
                    {/* Visual Warning Pulse */}
                    {isSuspicious && (
                      <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none"></div>
                    )}

                    <div className={`px-5 py-3 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]
                      ${isSuspicious ? 'bg-rose-500 text-white' : isFrozen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-emerald-400'}
                    `}>
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSuspicious ? 'bg-white' : 'bg-emerald-400 animate-pulse'}`}></span>
                        {student.status}
                      </span>
                      {isSuspicious ? <ShieldAlert size={14} /> : <Eye size={14} />}
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg">
                          {student.name[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">{student.name}</h3>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-1">
                            <Terminal size={12} /> {socketId.slice(0, 12)}
                          </div>
                        </div>
                      </div>

                      {/* Live Feed / Snapshot */}
                      <div className="w-full aspect-video bg-slate-950 rounded-2xl mb-8 overflow-hidden border border-slate-800 relative group">
                        {student.image ? (
                          <img 
                            src={student.image} 
                            alt={student.name} 
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <Activity size={24} className="animate-pulse" />
                            <span className="text-[10px] font-bold tracking-widest mt-2 uppercase italic">Feed Initializing...</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-indigo-600/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black tracking-widest text-white">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {student.image ? 'LIVE_SNAP' : 'AWAITING_SIGNAL'}
                        </div>
                      </div>

                      {/* Log Area */}
                      <div className="bg-slate-950/50 rounded-2xl p-4 h-32 overflow-y-auto mb-8 border border-slate-800/50 space-y-2">
                        {student.logs.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <span className="text-[10px] font-bold tracking-widest uppercase">No Alerts</span>
                          </div>
                        ) : (
                          student.logs.map((log, i) => (
                            <motion.div 
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              key={i} 
                              className="text-[11px] flex gap-3 leading-relaxed"
                            >
                              <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                              <span className="text-rose-400 font-medium">DETECTED: {log.message}</span>
                            </motion.div>
                          ))
                        )}
                      </div>

                      {/* Action Matrix */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => sendAction(socketId, 'warn')}
                          className="flex-1 btn-secondary py-3 text-[11px] uppercase tracking-wider font-black border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                        >
                          Send Warning
                        </button>

                        {isFrozen ? (
                          <button
                            onClick={() => sendAction(socketId, 'unfreeze')}
                            className="flex-[1.5] btn-premium from-emerald-600 to-teal-600 py-3 text-[11px] uppercase tracking-wider font-black shadow-emerald-500/20"
                          >
                            <Unlock size={14} /> Resume Quiz
                          </button>
                        ) : (
                          <button
                            onClick={() => sendAction(socketId, 'freeze')}
                            className="flex-[1.5] btn-premium from-rose-600 to-pink-700 py-3 text-[11px] uppercase tracking-wider font-black shadow-rose-500/20"
                          >
                            <Lock size={14} /> Freeze Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default LiveProctoring;