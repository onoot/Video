// index.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { initDatabase } = require('./config/initDatabase');


initDatabase();
console.log('Database initialized successfully');

const authRoutes = require('./routes/auth.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.use('/*path', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});