require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const syncRoutes = require('./routes/sync.routes');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});


app.use('/api', syncRoutes);


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Journalyst Broker Sync API is running',
    version: '1.0.0',
    endpoints: {
      sync: 'POST /api/sync',
      getTrades: 'GET /api/trades/:userId',
      connectBroker: 'POST /api/user/connect',
      getUser: 'GET /api/user/:userId'
    }
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});


const startServer = async () => {
  try {
   
    await connectDB();


    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
 
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};


process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();