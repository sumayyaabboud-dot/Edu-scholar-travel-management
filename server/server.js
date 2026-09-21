require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const offerRoutes = require('./routes/offers');
const studentRoutes = require('./routes/students');
const donorRoutes = require('./routes/donor');
const travelRoutes = require('./routes/travel');
const applicationRoutes = require('./routes/applications');
const chatbotRoutes = require('./routes/chatbot');
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));