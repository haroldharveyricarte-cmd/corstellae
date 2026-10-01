const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Login API Route with 7-Day Cookie
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Master Hardcoded Admin Check
  if (username === 'gabbythecreator' && password === 'gabbytheowner') {
    const user = { username: 'gabbythecreator', nickname: 'Gabby (Creator)', role: 'admin' };

    // Set 7-day HttpOnly cookie
    res.cookie('authToken', 'master_admin_session_token', {
      httpOnly: true,
      secure: false, // Set to true when deploying on Hostinger with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return res.json({ success: true, user });
  }

  // General Student Login
  if (username && password) {
    const user = { username: username, nickname: username, role: 'student' };

    res.cookie('authToken', `student_session_${username}`, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return res.json({ success: true, user });
  }

  return res.status(400).json({ success: false, message: 'Invalid credentials' });
});

// Logout Route
app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));