import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Generator from './pages/Generator';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`app-container ${theme}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <Routes>
        <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/generator"
          element={isAuthenticated ? <Generator /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;