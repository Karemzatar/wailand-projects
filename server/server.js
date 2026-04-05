const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const emailRoutes = require('./routes/emailRoutes');
const authRoutes = require('./routes/authRoutes');
const { sanitizeInput, rateLimit } = require('./middleware/validation');
const { 
    securityHeaders, 
    requestLogger, 
    advancedSanitization,
    advancedRateLimit 
} = require('./middleware/security');

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5124',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(securityHeaders);
app.use(requestLogger);
app.use(advancedSanitization);

// Global rate limiting
app.use(advancedRateLimit(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes per IP

// Used by routes to decide whether to hit MongoDB or fall back to mock data.
app.locals.mongoReady = false;

// Database connection
// In a real scenario we use process.env.MONGO_URI, but to ensure this runs seamlessly for the user
// we'll try to connect but won't crash if it fails, allowing mock data fallback or using an in-memory DB if needed.
// Actually, I'll use a local mock JSON database as per user's earlier context where they had data.json in similar projects,
// but the prompt says "MongoDB". I'll use mongoose but handle connection nicely.
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wailand', {
    // Mongoose v6+ no longer uses these options (they cause warnings/errors on newer versions).
}).then(() => console.log('MongoDB Connected'))
  .then(() => {
    app.locals.mongoReady = true;
  })
  .catch(err => {
    console.log('MongoDB Connection Error: ', err.message);
  });

const path = require('path');

app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/auth', authRoutes);

// Serve vanilla static frontend
app.use(express.static(path.join(__dirname, '../frontend')));


const PORT = process.env.PORT || 5123;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
