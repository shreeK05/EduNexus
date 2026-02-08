import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // Default to Student
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { 
        name, email, password, role 
      });
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-bold mb-1">Full Name</label>
            <input 
                type="text" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-bold mb-1">Email</label>
            <input 
                type="email" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="john@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-bold mb-1">Password</label>
            <input 
                type="password" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-bold mb-1">I am a...</label>
            <select 
                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="STUDENT">Student 🎓</option>
                <option value="TEACHER">Teacher 🧑‍🏫</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition shadow-md">
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Already have an account? <span onClick={() => navigate('/login')} className="text-indigo-600 cursor-pointer font-bold hover:underline">Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;