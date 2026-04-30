import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Lock, AlertTriangle, Eye, ShieldCheck, 
  Maximize2, Timer, CheckCircle2, ChevronRight, 
  Info, Cpu, Activity 
} from 'lucide-react';

const API_URL = "http://localhost:10000"; // Local fallback
const socket = io.connect("https://edunexus-api-w6xc.onrender.com");

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [user, setUser] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [detectionLogs, setDetectionLogs] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) setUser(storedUser);

    if (storedUser) {
      socket.on('connect', () => {
        socket.emit('join_quiz', quizId);
        socket.emit('report_status', { quizId, studentName: storedUser.name, status: 'Active', socketId: socket.id });
      });
      // Fallback if already connected
      if (socket.connected) {
        socket.emit('join_quiz', quizId);
        socket.emit('report_status', { quizId, studentName: storedUser.name, status: 'Active', socketId: socket.id });
      }
    }

    socket.on('student_action', (action) => {
      if (action === 'warn') {
        addLog("⚠️ TEACHER WARNING ISSUED");
      } else if (action === 'freeze') {
        setIsFrozen(true);
        socket.emit('report_status', { quizId, studentName: storedUser?.name, status: 'frozen', socketId: socket.id });
      } else if (action === 'unfreeze') {
        setIsFrozen(false);
      }
    });

    const fetchQuiz = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : null;
        const res = await axios.get(`https://edunexus-api-w6xc.onrender.com/api/quizzes/${quizId}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });

        // 🛑 Check if already submitted
        if (res.data.hasSubmitted) {
          alert("You have already submitted this quiz!");
          navigate('/dashboard');
          return;
        }

        if (new Date() > new Date(res.data.dueDate)) {
          navigate('/dashboard');
          return;
        }
        setQuiz(res.data);
        
        // Setup timer
        const end = new Date(res.data.dueDate).getTime();
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const dist = end - now;
          if (dist < 0) {
            clearInterval(interval);
            handleSubmit();
          } else {
            setTimeLeft(dist);
          }
        }, 1000);

        return () => clearInterval(interval);
      } catch (err) { 
        console.error("Failed to load quiz:", err);
        navigate('/dashboard');
      }
    };
    fetchQuiz();

    // 🕵️ NUCLEAR PROCTORING: Tab Switching & Focus Detection
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isFrozen) {
        triggerWarning("Tab Switch Detected");
        addLog("🚩 ALERT: Student left the exam tab");
      }
    };

    const handleBlur = () => {
      if (!isFrozen) {
        triggerWarning("Window Focus Lost");
        addLog("🚩 ALERT: Student switched window");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    const runCoco = async () => {
      try {
        const net = await cocoSsd.load();
        addLog("🛡️ AI Proctoring Engine Online");
        const interval = setInterval(() => { detect(net); }, 3000);
        return () => clearInterval(interval);
      } catch (e) { 
        console.error("AI Load Error:", e);
        addLog("⚠️ AI Warming Up..."); 
      }
    };

    const detect = async (net) => {
      if (videoRef.current && videoRef.current.readyState === 4 && !isFrozen) {
        try {
          const obj = await net.detect(videoRef.current);
          const forbidden = ['cell phone', 'mobile phone', 'book', 'laptop'];
          obj.forEach(prediction => {
            if (forbidden.includes(prediction.class) && prediction.score > 0.6) {
              triggerWarning(`Detected: ${prediction.class}`);
              addLog(`🚩 Security Breach: ${prediction.class}`);
            }
          });
        } catch (err) { console.error("Detection Error:", err); }
      }
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, frameRate: 15 } })
        .then(stream => { 
          if (videoRef.current) videoRef.current.srcObject = stream; 
          // 📸 OPTIMIZED FAST SNAPSHOTS FOR TEACHER (2s frequency)
          const snapInterval = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              const canvas = document.createElement('canvas');
              canvas.width = 240; // Slightly larger for clarity
              canvas.height = 180;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(videoRef.current, 0, 0, 240, 180);
              const snapshot = canvas.toDataURL('image/jpeg', 0.3); // High compression for speed
              socket.emit('report_status', { 
                quizId, 
                studentName: storedUser?.name, 
                status: 'snapshot', 
                image: snapshot,
                socketId: socket.id 
              });
            }
          }, 2000); // Faster frequency for "Live" feel
          return () => clearInterval(snapInterval);
        }).catch(err => {
          addLog("❌ Camera Permission Denied");
          alert("Camera access is REQUIRED for this exam.");
        });
    }
    runCoco();

    return () => { 
      socket.off('student_action');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [quizId, isFrozen]);

  const addLog = (msg) => {
    setDetectionLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const triggerWarning = (reason) => {
    socket.emit('report_status', { quizId, studentName: user?.name, status: 'cheating', reason: reason, socketId: socket.id });
    setWarnings(prev => prev + 1);
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => setIsFullscreen(true));
    }
  };

  const handleSelect = (qIndex, oIndex, type) => {
    if (isFrozen) return;
    const currentSelection = answers[qIndex] || [];
    if (type === 'single') setAnswers({ ...answers, [qIndex]: [oIndex] });
    else {
      if (currentSelection.includes(oIndex)) setAnswers({ ...answers, [qIndex]: currentSelection.filter(i => i !== oIndex) });
      else setAnswers({ ...answers, [qIndex]: [...currentSelection, oIndex] });
    }
  };

  const formatTime = (ms) => {
    if (!ms) return "00:00:00";
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (isFrozen) return;
    if (document.fullscreenElement) document.exitFullscreen();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo ? userInfo.token : null;
      
      // 🚩 Notify teacher student is leaving
      socket.emit('report_status', { quizId, studentName: user?.name, status: 'finished', socketId: socket.id });

      await axios.post('https://edunexus-api-w6xc.onrender.com/api/quizzes/submit', { 
        quizId, studentId: user._id, answers 
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/dashboard');
    } catch (err) { console.error(err); }
  };

  if (!quiz) return (
    <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Cpu className="text-indigo-400" size={48} />
      </motion.div>
      <p className="mt-4 text-indigo-300 font-bold tracking-widest animate-pulse">SETTING UP EXAM SESSION...</p>
    </div>
  );

  if (isFrozen) {
    return (
      <div className="min-h-screen bg-rose-950 flex items-center justify-center text-white text-center p-10">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(244,63,94,0.5)]">
            <Lock size={48} />
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tight">EXAM LOCKED</h1>
          <p className="text-2xl text-rose-300 max-w-xl mx-auto leading-relaxed">
            Unusual activity detected. Your quiz session has been frozen by the proctor. 
            Please stay in your position and wait for instructions.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isFullscreen) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center p-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-xl w-full glass-panel p-12 rounded-[2rem] text-center"
        >
          <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Secure Exam Console</h1>
          <p className="text-slate-400 text-lg mb-10">
            This assessment utilizes AI-driven proctoring. You must enter full-screen mode 
            and enable your camera to proceed.
          </p>

          <div className="space-y-4 mb-10 text-left">
            {[
              "Tab switching is strictly monitored",
              "External materials are prohibited",
              "AI will detect phones and books",
              "Continuous camera feed is required"
            ].map(rule => (
              <div key={rule} className="flex items-center gap-3 text-slate-300 font-medium">
                <CheckCircle2 size={18} className="text-indigo-500" />
                {rule}
              </div>
            ))}
          </div>

          <video ref={videoRef} autoPlay muted className="hidden" />

          <button onClick={enterFullscreen} className="btn-premium w-full py-5 text-xl">
            Start Exam <ChevronRight size={24} />
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-sans">
      
      {/* --- SIDEBAR MISSION CONTROL --- */}
      <aside className="w-80 border-r border-slate-800/50 flex flex-col glass-panel">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">EXAM DASHBOARD</span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 block">Time Remaining</label>
              <div className="text-3xl font-mono font-bold text-indigo-400 flex items-center gap-2">
                <Timer size={24} /> {formatTime(timeLeft)}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 block">System Status</label>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Activity size={18} className="animate-pulse" /> SECURE / ENCRYPTED
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4 block">Proctoring Log</label>
          <div className="space-y-3">
            {detectionLogs.map((log, i) => (
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                key={i} 
                className="text-[11px] font-mono p-2 rounded bg-slate-900 border border-slate-800 text-slate-400"
              >
                [{new Date().toLocaleTimeString()}] {log}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800/50">
          <div className="relative w-full h-44 bg-black rounded-2xl overflow-hidden border-2 border-indigo-500/30 group">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1] opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 pointer-events-none border border-indigo-500/20 mix-blend-overlay"></div>
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-indigo-600/80 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black tracking-widest">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> PROCTOR FEED
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN ASSESSMENT AREA --- */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Header Progress */}
        <header className="h-20 border-b border-slate-800/50 flex items-center px-10 justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-6 flex-1">
            <h1 className="font-bold text-xl truncate max-w-md">{quiz.title}</h1>
            <div className="flex-1 max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">{Math.round(progress)}% COMPLETE</span>
          </div>

          <div className="flex items-center gap-4">
            {warnings > 0 && (
              <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-2 rounded-xl border border-rose-400/20 font-bold animate-bounce">
                <AlertTriangle size={18} /> {warnings} VIOLATIONS
              </div>
            )}
            <button 
              onClick={handleSubmit}
              className="btn-premium py-2 px-6 text-sm"
            >
              Submit Quiz
            </button>
          </div>
        </header>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestion}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="max-w-3xl w-full space-y-10"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-slate-800">Q{currentQuestion + 1}</span>
                <div className="h-px flex-1 bg-slate-800/50"></div>
              </div>

              <h2 className="text-3xl font-medium text-slate-100 leading-tight">
                {quiz.questions[currentQuestion].question}
              </h2>

              <div className="grid gap-4">
                {quiz.questions[currentQuestion].options.map((option, i) => {
                  const isSelected = (answers[currentQuestion] || []).includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(currentQuestion, i, quiz.questions[currentQuestion].type)}
                      className={`
                        group flex items-center gap-6 p-6 rounded-2xl border-2 text-left transition-all duration-300
                        ${isSelected 
                          ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'}
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-colors
                        ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700 text-slate-700 group-hover:border-slate-500'}
                      `}>
                        {isSelected ? <CheckCircle2 size={16} /> : <div className="text-[10px] font-black">{String.fromCharCode(65 + i)}</div>}
                      </div>
                      <span className={`text-xl font-medium ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-10">
                <button 
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(prev => prev - 1)}
                  className="btn-secondary disabled:opacity-20"
                >
                  Previous Question
                </button>
                
                <div className="flex gap-2">
                  {quiz.questions.map((_, i) => (
                    <div 
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentQuestion ? 'w-6 bg-indigo-500' : 'bg-slate-800'}`}
                    />
                  ))}
                </div>

                <button 
                  disabled={currentQuestion === quiz.questions.length - 1}
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  className="btn-premium"
                >
                  Next Question <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Alert */}
        {warnings > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-rose-500 text-white px-6 py-3 rounded-full shadow-2xl animate-pulse">
            <Info size={20} />
            <span className="font-bold tracking-tight">PROCTORING ALERT: UNUSUAL BEHAVIOR LOGGED</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default TakeQuiz;