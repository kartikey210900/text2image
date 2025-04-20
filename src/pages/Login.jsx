import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Login.css';

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        navigate('/generator');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="main-content">
      <div className="header">
        <h1 className="title">Imagify Login</h1>
        <p className="subtitle">Access Your Creative Dashboard</p>
      </div>
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            className="prompt-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            className="prompt-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="generate-button">Login</button>
        {error && <p className="error-message">{error}</p>}
        <p className="auth-link">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </form>
    </div>
  );
}

export default Login;