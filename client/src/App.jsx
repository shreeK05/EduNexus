import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // <--- NEW IMPORT
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classroom from './pages/Classroom';
import Register from "./pages/Register";
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import LiveProctoring from './pages/LiveProctoring';
import VideoCall from './pages/VideoCall';

function App() {
  return (
    <Router>
      <Routes>
        {/* LANDING PAGE IS NOW DEFAULT */}
        <Route path="/" element={<Home />} />
        
        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} /> {/* Pointing to Login for now if you don't have Register */}

        {/* PROTECTED ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/class/:id" element={<Classroom />} />
        
        {/* QUIZ ROUTES */}
        <Route path="/class/:classId/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz/take/:quizId" element={<TakeQuiz />} />
        <Route path="/class/:quizId/live" element={<LiveProctoring />} />

        {/* VIDEO ROUTE */}
        <Route path="/video/:roomId" element={<VideoCall />} />
      </Routes>
    </Router>
  );
}

export default App;