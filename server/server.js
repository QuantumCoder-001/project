const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174'
].filter(Boolean);
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Basic routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running!' });
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API is healthy' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');

        // Import routes after DB connection
        const authRoutes = require('./routes/authRoutes');
        const predictRoutes = require('./routes/predictionRoutes');
        const mlRoutes = require('./routes/mlRoutes');
        const chatRoutes = require('./routes/chatRoutes');

        // Register routes
        app.use('/api/auth', authRoutes);
        app.use('/api/predictions', predictRoutes);
        app.use('/api/ml', mlRoutes);
        app.use('/api/chat', chatRoutes);

        // 404 handler
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: `Route ${req.originalUrl} not found`
            });
        });

        // Start server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });