import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospitalUser, FaLock } from 'react-icons/fa';
import logo from '../assets/logo.jpeg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.status === 'success') {
        setMessage('✅ ' + data.message);
        const role = data.role?.toUpperCase();

        localStorage.setItem('token', data.token || 'dummy-token');
        localStorage.setItem('role', role);
        localStorage.setItem('email', email);

        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'DOCTOR') navigate('/doctor');
        else if (role === 'STAFF') navigate('/staff');
        else navigate('/');
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (err) {
      setLoading(false);
      setMessage('⚠️ Server error. Please try again later.');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-96">
        <div className="flex flex-col items-center mb-6">
  <img 
    src={logo} 
    alt="HealsightAI Logo" 
    className="w-20 h-20 object-cover rounded-full mb-3 shadow-md"
  />
  <h1 className="text-2xl font-semibold text-gray-800">HealsightAI</h1>
  <p className="text-gray-500 text-sm">AI Hospital Management Login</p>
</div>


        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {message && (
            <p className={`text-center mt-2 ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
