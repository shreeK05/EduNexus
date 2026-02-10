import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io.connect("https://https://edunexus-api-o8qg.onrender.com");

const LiveProctoring = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState({}); // { socketId: { name: "John", status: "Clean", logs: [] } }

  useEffect(() => {
    // Join the "Room" for this quiz
    socket.emit('join_quiz', quizId);

    // Listen for updates from students
    socket.on('update_dashboard', (data) => {
      setStudents((prev) => {
        const student = prev[data.socketId] || { name: data.studentName, status: 'Active', logs: [] };
        
        // Update Status based on report
        let newStatus = 'Active';
        let newLog = null;

        if (data.status === 'cheating') {
            newStatus = 'Cheating Detected';
            newLog = `${new Date().toLocaleTimeString()} - ${data.reason}`;
        } else if (data.status === 'frozen') {
            newStatus = 'FROZEN';
        }

        return {
          ...prev,
          [data.socketId]: {
            ...student,
            status: newStatus,
            logs: newLog ? [...student.logs, newLog] : student.logs
          }
        };
      });
    });

    return () => socket.off('update_dashboard');
  }, [quizId]);

  const sendAction = (studentSocketId, action) => {
    socket.emit('teacher_action', { studentSocketId, action });
    alert(`Sent ${action} command!`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-red-500">🔴 Live Proctoring Dashboard</h1>
        <button onClick={() => navigate(-1)} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Exit Dashboard</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(students).length === 0 && <p className="text-gray-500">Waiting for students to join...</p>}
        
        {Object.entries(students).map(([socketId, student]) => (
          <div key={socketId} className={`p-6 rounded-xl border-4 shadow-xl ${
            student.status === 'Cheating Detected' ? 'border-red-600 bg-red-900/20' : 
            student.status === 'FROZEN' ? 'border-blue-500 bg-blue-900/20' : 'border-green-500 bg-gray-800'
          }`}>
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-2xl font-bold">{student.name}</h2>
                 <p className={`font-mono font-bold mt-1 ${
                    student.status === 'Cheating Detected' ? 'text-red-400' : 
                    student.status === 'FROZEN' ? 'text-blue-400' : 'text-green-400'
                 }`}>
                    STATUS: {student.status}
                 </p>
               </div>
               <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
            </div>

            {/* Logs Section */}
            <div className="bg-black/50 p-3 rounded h-32 overflow-y-auto mb-4 text-xs font-mono">
                {student.logs.length === 0 && <span className="text-gray-500">No suspicious activity yet.</span>}
                {student.logs.map((log, i) => (
                    <p key={i} className="text-red-300 mb-1">⚠️ {log}</p>
                ))}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                <button 
                  onClick={() => sendAction(socketId, 'warn')}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 rounded font-bold"
                >
                  ⚠️ Warn
                </button>
                <button 
                  onClick={() => sendAction(socketId, 'freeze')}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded font-bold"
                >
                  ❄️ Freeze
                </button>
                <button 
                  onClick={() => sendAction(socketId, 'unfreeze')}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
                >
                  🔓 Unfreeze
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveProctoring;