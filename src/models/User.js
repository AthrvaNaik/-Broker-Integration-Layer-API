const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  brokerConnections: [{
    brokerName: {
      type: String,
      required: true,
      enum: ['zerodha', 'metatrader', 'alpaca']
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String
    },
    tokenExpiry: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastSyncedAt: {
      type: Date
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});


userSchema.methods.getBrokerConnection = function(brokerName) {
  return this.brokerConnections.find(
    conn => conn.brokerName === brokerName && conn.isActive
  );
};


userSchema.methods.isTokenExpired = function(brokerName) {
  const connection = this.getBrokerConnection(brokerName);
  if (!connection) return true;
  return new Date() >= new Date(connection.tokenExpiry);
};

module.exports = mongoose.model('User', userSchema);