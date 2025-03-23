const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/meditation-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  meditationHistory: [{ 
    duration: Number, 
    date: { type: Date, default: Date.now } 
  }]
});

const User = mongoose.model('User', userSchema);

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  };
  
  // Add authentication to app route
  app.get('/app', (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login');
    }
    next();
  });

// Routes
app.post('/api/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      const user = new User({
        username,
        email,
        password: hashedPassword
      });
      
      await user.save();
      
      // Return success without setting token
      res.status(201).json({ message: 'Signup successful. Please login.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user by username or email
      const user = await User.findOne({
        $or: [
          { username: username },
          { email: username }  // Allow login with email too
        ]
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Create JWT
      const token = jwt.sign(
        { 
          id: user._id, 
          username: user.username 
        }, 
        JWT_SECRET, 
        { expiresIn: '1d' }
      );
      
      // Set cookie
      res.cookie('token', token, { 
        httpOnly: true, 
        maxAge: 86400000, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

app.get('/api/meditation/history', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ history: user.meditationHistory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Add this after other routes
app.post('/api/meditation', authenticate, async (req, res) => {
    try {
      const { duration } = req.body;
      
      if (!duration || typeof duration !== 'number') {
        return res.status(400).json({ message: 'Invalid duration' });
      }
  
      // Find user and update meditation history
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { 
          $push: { 
            meditationHistory: {
              duration: duration,
              date: new Date()
            }
          }
        },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log('Meditation session recorded:', {
        userId: req.user.id,
        duration: duration,
        date: new Date()
      });
  
      res.status(200).json({ 
        message: 'Session recorded successfully',
        session: user.meditationHistory[user.meditationHistory.length - 1]
      });
    } catch (error) {
      console.error('Meditation record error:', error);
      res.status(500).json({ message: 'Error recording session' });
    }
  });
// Serve HTML files
// Update the root route to check for authentication
app.get('/', (req, res) => {
    const token = req.cookies.token;
    if (token) {
      // If user has valid token, redirect to app
      try {
        jwt.verify(token, JWT_SECRET);
        return res.redirect('/app');
      } catch (error) {
        // Invalid token, clear it
        res.clearCookie('token');
      }
    }
    // No token or invalid token, show landing page
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Add logout route
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  });