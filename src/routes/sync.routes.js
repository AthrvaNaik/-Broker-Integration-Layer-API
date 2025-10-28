const express = require('express');
const router = express.Router();
const SyncService = require('../services/SyncService');
const User = require('../models/User');

/**
 * POST /api/sync
 * Sync trades from broker for a user
 */
router.post('/sync', async (req, res) => {
  try {
    const { userId, brokerName } = req.body;

    // Validate request
    if (!userId || !brokerName) {
      return res.status(400).json({
        success: false,
        message: 'userId and brokerName are required'
      });
    }

    // Execute sync
    const result = await SyncService.syncTrades(userId, brokerName);

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('Sync route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/trades/:userId
 * Get user's trade history
 */
router.get('/trades/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { brokerName, symbol, startDate, endDate, limit } = req.query;

    const filters = {
      brokerName,
      symbol,
      startDate,
      endDate,
      limit: parseInt(limit) || 100
    };

    const trades = await SyncService.getUserTrades(userId, filters);

    res.json({
      success: true,
      count: trades.length,
      trades
    });

  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/user/connect
 * Connect user to a broker (store tokens)
 */
router.post('/user/connect', async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      brokerName,
      accessToken,
      refreshToken,
      tokenExpiry
    } = req.body;

    // Validate required fields
    if (!userId || !name || !email || !brokerName || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find or create user
    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({
        userId,
        name,
        email,
        brokerConnections: []
      });
    }

    // Check if broker connection already exists
    const existingConnection = user.brokerConnections.find(
      conn => conn.brokerName === brokerName
    );

    if (existingConnection) {
      // Update existing connection
      existingConnection.accessToken = accessToken;
      existingConnection.refreshToken = refreshToken || existingConnection.refreshToken;
      existingConnection.tokenExpiry = tokenExpiry || new Date(Date.now() + 6 * 60 * 60 * 1000);
      existingConnection.isActive = true;
    } else {
      // Add new broker connection
      user.brokerConnections.push({
        brokerName,
        accessToken,
        refreshToken: refreshToken || 'mock_refresh_token',
        tokenExpiry: tokenExpiry || new Date(Date.now() + 6 * 60 * 60 * 1000),
        isActive: true
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `Successfully connected to ${brokerName}`,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        brokerConnections: user.brokerConnections.map(conn => ({
          brokerName: conn.brokerName,
          isActive: conn.isActive,
          connectedAt: conn.connectedAt,
          lastSyncedAt: conn.lastSyncedAt
        }))
      }
    });

  } catch (error) {
    console.error('Connect broker error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/user/:userId
 * Get user details and broker connections
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        brokerConnections: user.brokerConnections.map(conn => ({
          brokerName: conn.brokerName,
          isActive: conn.isActive,
          connectedAt: conn.connectedAt,
          lastSyncedAt: conn.lastSyncedAt,
          tokenExpiry: conn.tokenExpiry
        }))
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;