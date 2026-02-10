import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import io from 'socket.io-client';

const socket = io.connect("https://edunexus-api-o8qg.onrender.com");

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); 
  const [user, setUser] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false); // <--- NEW: Frozen State
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) setUser(storedUser);

    // 1. Join Socket Room
    if(storedUser) {
        socket.emit('join_quiz', quizId);
        // Tell teacher I am here
        socket.emit('report_status', { 
            quizId, 
            studentName: storedUser.name, 
            status: 'Active', 
            socketId: socket.id 
        });
    }

    // 2. Listen for Teacher Commands
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

    // 3. Fetch Quiz
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`https://https://edunexus-api-o8qg.onrender.com/api/quizzes/single/${quizId}`);
        setQuiz(res.data);
      } catch (err) { alert("Error loading quiz"); }
    };
    fetchQuiz();

    // 4. AI Proctoring
    const runCoco = async () => {
      const net = await cocoSsd.load();
      setInterval(() => { detect(net); }, 2000); // Check every 2s
    };

    const detect = async (net) => {
      if (videoRef.current && videoRef.current.readyState === 4 && !isFrozen) { // Don't check if frozen
        const obj = await net.detect(videoRef.current);
        const forbidden = ['cell phone', 'mobile phone', 'book'];
        
        obj.forEach(prediction => {
            if (forbidden.includes(prediction.class)) {
                triggerWarning(`Detected: ${prediction.class}`);
            }
        });
      }
    };

    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; });
    }
    runCoco();

    return () => { socket.off('student_action'); };
  }, [quizId, isFrozen]); // Re-run if frozen state changes

  const triggerWarning = (reason) => {
    // Alert Teacher
    socket.emit('report_status', { 
        quizId, 
        studentName: user?.name, 
        status: 'cheating', 
        reason: reason,
        socketId: socket.id 
    });

    setWarnings(prev => prev + 1);
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => setIsFullscreen(true));
    }
  };

  const handleSelect = (qIndex, oIndex, type) => {
    if(isFrozen) return; // Block input if frozen
    const currentSelection = answers[qIndex] || [];
    if (type === 'single') {
        setAnswers({ ...answers, [qIndex]: [oIndex] });
    } else {
        if (currentSelection.includes(oIndex)) {
            setAnswers({ ...answers, [qIndex]: currentSelection.filter(i => i !== oIndex) });
        } else {
            setAnswers({ ...answers, [qIndex]: [...currentSelection, oIndex] });
        }
    }
  };

  const handleSubmit = async () => {
    if(isFrozen) return alert("Your test is frozen. Ask teacher to unfreeze.");
    if(document.fullscreenElement) document.exitFullscreen();
    try {
      const res = await axios.post('https://https://edunexus-api-o8qg.onrender.com/api/quizzes/submit', {
        quizId, studentId: user._id, answers
      });
      alert(`Score: ${res.data.score}/${res.data.total}`);
      navigate(-1);
    } catch (err) { alert('Error submitting'); }
  };

  if (!quiz) return <div className="p-10 text-center">Loading...</div>;

  // --- FROZEN SCREEN ---
  if (isFrozen) {
      return (
          <div className="min-h-screen bg-red-900 flex items-center justify-center text-white text-center p-10">
              <div>
                  <h1 className="text-5xl font-bold mb-4">❄️ TEST FROZEN</h1>
                  <p className="text-xl">Your test has been locked by the proctor due to suspicious activity.</p>
                  <p className="mt-4 font-bold text-yellow-400">Please wait for the teacher to unfreeze your test.</p>
              </div>
          </div>
      );
  }

  // --- FULLSCREEN GATE ---
  if (!isFullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-10 bg-gray-800 rounded-xl shadow-2xl">
           <h1 className="text-3xl font-bold mb-4">🔒 Secure Test</h1>
           <video ref={videoRef} autoPlay muted className="hidden" />
           <button onClick={enterFullscreen} className="w-full bg-blue-600 py-3 rounded font-bold">Start Test</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 select-none relative">
      <div className="fixed bottom-4 right-4 w-48 h-36 bg-black border-4 border-red-500 rounded-lg z-50">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-t-4 border-blue-600 flex justify-between">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            {warnings > 0 && <span className="text-red-600 font-bold">Warnings: {warnings}</span>}
        </div>

        <div className="space-y-6 mb-10">
          {quiz.questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-4">{qIndex + 1}. {q.question}</h3>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => (
                    <div key={oIndex} onClick={() => handleSelect(qIndex, oIndex, q.type)} className={`p-3 rounded border cursor-pointer flex gap-3 ${(answers[qIndex]||[]).includes(oIndex) ? 'bg-blue-50 border-blue-500' : ''}`}>
                        <div className={`w-5 h-5 border-2 flex items-center justify-center ${(answers[qIndex]||[]).includes(oIndex) ? 'bg-blue-600 border-blue-600' : ''}`}></div>
                        <span>{option}</span>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-4 rounded font-bold text-lg shadow-lg">Submit Test</button>
      </div>
    </div>
  );
};

export default TakeQuiz;