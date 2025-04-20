import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaSignOutAlt } from 'react-icons/fa';
import './Generator.css';

function Generator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (response.ok) {
        setImageUrl(data.imageUrl);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="main-content">
      <div className="header">
        <h1 className="title">Imagify AI Image Generator</h1>
        <p className="subtitle">Turn your ideas into stunning visuals</p>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
      <div className="input-section">
        <textarea
          className="prompt-input"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        ></textarea>
        <button
          className="generate-button"
          onClick={generateImage}
          disabled={loading || !prompt}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="output-section">
        {loading ? (
          <div className="loader">
            <div className="spinner"></div>
            <p>Generating your image...</p>
          </div>
        ) : imageUrl ? (
          <div className="image-wrapper">
            <img src={imageUrl} alt="Generated" className="generated-image" />
            <button className="download-button" onClick={handleDownload}>
              <FaDownload /> Download
            </button>
          </div>
        ) : (
          <p className="placeholder">Enter a prompt to generate an image</p>
        )}
      </div>
      <div className="footer">
        Powered by endxkartikey@gmail.com
      </div>
    </div>
  );
}

export default Generator;