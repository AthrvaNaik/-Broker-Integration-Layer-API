const Trade = require('../models/Trade');
const TokenService = require('./TokenService');
const NormalizerService = require('./NormalizerService');
const ZerodhaAdapter = require('../adapters/ZerodhaAdapter');
const AlpacaAdapter = require('../adapters/AlpacaAdapter');

class SyncService {
  constructor() {
    this.adapters = this.initializeAdapters();
  }


  initializeAdapters() {
    return {
      zerodha: new ZerodhaAdapter({
      apiKey: process.env.ZERODHA_API_KEY,
      apiSecret: process.env.ZERODHA_API_SECRET,
      useMockData: process.env.USE_MOCK_DATA === 'true'
    }),
    alpaca: new AlpacaAdapter({
      apiKey: process.env.ALPACA_API_KEY,
      apiSecret: process.env.ALPACA_API_SECRET
    })
    };
  }


  getBrokerAdapter(brokerName) {
    const adapter = this.adapters[brokerName.toLowerCase()];
    
    if (!adapter) {
      throw new Error(`Unsupported broker: ${brokerName}`);
    }

    return adapter;
  }


  async syncTrades(userId, brokerName, options = {}) {
    console.log(`\n🔄 Starting sync for user ${userId} with ${brokerName}...`);

    try {
      
      const adapter = this.getBrokerAdapter(brokerName);
      console.log(`Broker adapter loaded: ${brokerName}`);

    
      const accessToken = await TokenService.getValidToken(userId, brokerName, adapter);
      console.log(`Valid access token obtained`);

      
      console.log(` Fetching trades from ${brokerName}`);
      const rawTrades = await adapter.fetchTrades(accessToken, options);
      console.log(`Fetched ${rawTrades.length} trades from ${brokerName}`);

      if (rawTrades.length === 0) {
        return {
          success: true,
          message: 'No new trades found',
          tradesCount: 0,
          trades: []
        };
      }

      
      console.log(`Normalizing trades`);
      const normalizedTrades = NormalizerService.normalizeTrades(
        rawTrades,
        brokerName,
        userId
      );
      console.log(`✅ Normalized ${normalizedTrades.length} trades`);

      
      console.log(` Saving trades to database`);
      const savedTrades = await this.saveTrades(normalizedTrades);
      console.log(`✅ Saved ${savedTrades.length} new trades (skipped duplicates)`);

     
      await TokenService.updateLastSync(userId, brokerName);

      return {
        success: true,
        message: `Successfully synced ${savedTrades.length} trades`,
        tradesCount: savedTrades.length,
        trades: savedTrades
      };

    } catch (error) {
      console.error(`Sync failed for user ${userId}:`, error.message);
      
      return {
        success: false,
        message: error.message,
        tradesCount: 0,
        trades: []
      };
    }
  }

 
  async saveTrades(normalizedTrades) {
    const savedTrades = [];

    for (const trade of normalizedTrades) {
      try {
        
        NormalizerService.validateNormalizedTrade(trade);

     
        const existingTrade = await Trade.findOne({
          brokerTradeId: trade.brokerTradeId
        });

        if (existingTrade) {
          console.log(`Trade ${trade.brokerTradeId} already exists, skipping`);
          continue;
        }

  
        const newTrade = await Trade.create(trade);
        savedTrades.push(newTrade);

      } catch (error) {
        console.error(`Error saving trade ${trade.brokerTradeId}:`, error.message);
        
      }
    }

    return savedTrades;
  }


  async getUserTrades(userId, filters = {}) {
    const query = { userId };

    
    if (filters.brokerName) {
      query.brokerName = filters.brokerName;
    }

    if (filters.symbol) {
      query.symbol = new RegExp(filters.symbol, 'i');
    }

    if (filters.startDate || filters.endDate) {
      query.tradeTime = {};
      if (filters.startDate) {
        query.tradeTime.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.tradeTime.$lte = new Date(filters.endDate);
      }
    }

    const trades = await Trade.find(query)
      .sort({ tradeTime: -1 })
      .limit(filters.limit || 100);

    return trades;
  }
}

module.exports = new SyncService();