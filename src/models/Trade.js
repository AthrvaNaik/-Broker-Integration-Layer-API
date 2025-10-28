const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  brokerName: {
    type: String,
    required: true,
    enum: ['zerodha', 'metatrader', 'alpaca']
  },
  brokerTradeId: {
    type: String,
    required: true,
    unique: true
  },
  
  symbol: {
    type: String,
    required: true
  },
  exchange: {
    type: String,
    required: true
  },
  tradeType: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  
  orderType: {
    type: String,
    enum: ['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LOSS_MARKET'],
    default: 'MARKET'
  },
  product: {
    type: String,
    enum: ['INTRADAY', 'DELIVERY', 'MARGIN'],
    default: 'DELIVERY'
  },
  status: {
    type: String,
    enum: ['COMPLETE', 'REJECTED', 'CANCELLED', 'PENDING'],
    default: 'COMPLETE'
  },
  
  tradeTime: {
    type: Date,
    required: true
  },
  
  totalValue: {
    type: Number,
    required: true
  },
  
  rawData: {
    type: mongoose.Schema.Types.Mixed
  },
  syncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

tradeSchema.index({ userId: 1, tradeTime: -1 });
tradeSchema.index({ userId: 1, brokerName: 1 });

module.exports = mongoose.model('Trade', tradeSchema);