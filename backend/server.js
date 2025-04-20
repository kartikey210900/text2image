import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

// Debug: Check if process.env is available
// eslint-disable-next-line no-undef
if (!process || !process.env) {
  console.error('Error: process.env is not defined. Ensure this is running in a Node.js environment.');
  process.exit(1);
}

// Debug: Log environment variables (remove sensitive data in production)
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('HUGGING_FACE_API_KEY:', process.env.HUGGING_FACE_API_KEY ? 'Set' : 'Not set');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Signup
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// JWT Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Image Generation
app.post('/api/generate', authenticate, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const imageUrl = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: `Image generation failed: ${err.message}` });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));