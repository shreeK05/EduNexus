import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import io from 'socket.io-client';
import { Settings, Lock, AlertTriangle, Eye, ShieldCheck, Maximize2 } from 'lucide-react';

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

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) setUser(storedUser);

    if (storedUser) {
      socket.emit('join_quiz', quizId);
      socket.emit('report_status', { quizId, studentName: storedUser.name, status: 'Active', socketId: socket.id });
    }

    socket.on('student_action', (action) => {
      if (action === 'warn') {
        alert("⚠️ TEACHER WARNING: Stop suspicious activity immediately!");
      } else if (action === 'freeze') {
        setIsFrozen(true);
        socket.emit('report_status', { quizId, studentName: storedUser?.name, status: 'frozen', socketId: socket.id });
        alert("❄️ TEST FROZEN: The teacher has paused your test due to suspicious activity.");
      } else if (action === 'unfreeze') {
        setIsFrozen(false);
        alert("✅ TEST UNFROZEN: You may continue.");
      }
    });

    const fetchQuiz = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : null;
        const res = await axios.get(`https://edunexus-api-w6xc.onrender.com/api/quizzes/single/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });

        if (new Date() > new Date(res.data.dueDate)) {
          alert("⛔ This quiz has expired and is no longer accepting submissions.");
          navigate(-1);
          return;
        }
        setQuiz(res.data);
      } catch (err) { alert("Error loading quiz"); }
    };
    fetchQuiz();

    const runCoco = async () => {
      const net = await cocoSsd.load();
      setInterval(() => { detect(net); }, 2000);
    };

    const detect = async (net) => {
      if (videoRef.current && videoRef.current.readyState === 4 && !isFrozen) {
        const obj = await net.detect(videoRef.current);
        const forbidden = ['cell phone', 'mobile phone', 'book'];
        obj.forEach(prediction => {
          if (forbidden.includes(prediction.class)) triggerWarning(`Detected: ${prediction.class}`);
        });
      }
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; });
    }
    runCoco();

    return () => { socket.off('student_action'); };
  }, [quizId, isFrozen]);

  const triggerWarning = (reason) => {
    socket.emit('report_status', { quizId, studentName: user?.name, status: 'cheating', reason: reason, socketId: socket.id });
    setWarnings(prev => prev + 1);
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().then(() => setIsFullscreen(true));
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

  const handleSubmit = async () => {
    if (isFrozen) return alert("Your test is frozen. Ask teacher to unfreeze.");
    if (document.fullscreenElement) document.exitFullscreen();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo ? userInfo.token : null;
      const res = await axios.post('https://edunexus-api-w6xc.onrender.com/api/quizzes/submit', { quizId, studentId: user._id, answers }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Score: ${res.data.score}/${res.data.total}`);
      navigate(-1);
    } catch (err) { alert('Error submitting'); }
  };

  if (!quiz) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  if (isFrozen) {
    return (
      <div className="min-h-screen bg-rose-900 flex items-center justify-center text-white text-center p-10 animate-pulse">
        <div>
          <Lock size={64} className="mx-auto mb-4 text-rose-300" />
          <h1 className="text-5xl font-bold mb-4">TEST FROZEN</h1>
          <p className="text-xl opacity-90">Suspicious activity detected. Your test is locked.</p>
          <p className="mt-4 font-bold text-yellow-400 bg-black/30 inline-block px-4 py-2 rounded">Please wait for the proctor to resume your session.</p>
        </div>
      </div>
    );
  }

  if (!isFullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <div className="max-w-md w-full text-center p-10 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Secure Test Environment</h1>
          <p className="text-slate-400 mb-8">This quiz requires full-screen mode and webcam access for AI proctoring.</p>

          <video ref={videoRef} autoPlay muted className="hidden" />

          <button onClick={enterFullscreen} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/50 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
            Start Assessment <Maximize2 size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 select-none relative font-sans">

      {/* Webcam Feed */}
      <div className="fixed bottom-6 right-6 w-48 h-36 bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-indigo-600 z-50">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> REC
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex justify-between items-center sticky top-4 z-40">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{quiz.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{quiz.questions.length} Questions • AI Proctoring Active</p>
          </div>
          {warnings > 0 && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-red-100">
              <AlertTriangle size={18} /> {warnings} Warnings
            </div>
          )}
        </header>

        <div className="space-y-8 mb-20">
          {quiz.questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-100 transition">
              <div className="flex gap-4 mb-6">
                <span className="bg-indigo-100 text-indigo-700 font-bold w-10 h-10 flex items-center justify-center rounded-lg shrink-0 text-lg">{qIndex + 1}</span>
                <h3 className="font-bold text-xl text-slate-800 leading-relaxed">{q.question}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 pl-14">
                {q.options.map((option, oIndex) => {
                  const isSelected = (answers[qIndex] || []).includes(oIndex);
                  return (
                    <div
                      key={oIndex}
                      onClick={() => handleSelect(qIndex, oIndex, q.type)}
                      className={`
                           p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4
                           ${isSelected ? 'bg-indigo-50 border-indigo-600 shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-300'}
                        `}
                    >
                      <div className={`
                            w-6 h-6 border-2 flex items-center justify-center transition
                            ${q.type === 'single' ? 'rounded-full' : 'rounded-md'}
                            ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}
                        `}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                      <span className={`font-medium text-lg ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{option}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 flex justify-center z-40 shadow-lg">
          <button onClick={handleSubmit} className="bg-slate-900 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-xl transform hover:-translate-y-1 w-full max-w-md">
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;