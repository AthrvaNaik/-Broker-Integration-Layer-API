const axios = require('axios');
const BrokerAdapter = require('./BrokerAdapter');

class AlpacaAdapter extends BrokerAdapter {
  constructor(config = {}) {
    super(config);
    this.brokerName = 'alpaca';
    this.baseURL = 'https://paper-api.alpaca.markets';
    
    // Real API / Mock API
    this.useMockData = !config.apiKey || !config.apiSecret;
  }

  async fetchTrades(accessToken, options = {}) {
    if (this.useMockData) {
      return this.getMockTrades();
    }

    try {
      const response = await axios.get(`${this.baseURL}/v2/account/activities/FILL`, {
        headers: {
          'APCA-API-KEY-ID': this.config.apiKey,
          'APCA-API-SECRET-KEY': this.config.apiSecret
        },
        params: {
          page_size: 100,
          direction: 'desc'
        }
      });

      return response.data || [];
    } catch (error) {
      throw new Error(`Alpaca API Error: ${error.message}`);
    }
  }

  async refreshAccessToken(refreshToken) {
    if (this.useMockData) {
      return this.getMockTokens();
    }

    return {
      accessToken: this.config.apiKey,
      refreshToken: this.config.apiSecret,
      tokenExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
  }

  async validateToken(accessToken) {
    if (this.useMockData) {
      return true;
    }

    try {
      await axios.get(`${this.baseURL}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': this.config.apiKey,
          'APCA-API-SECRET-KEY': this.config.apiSecret
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  getMockTrades() {
    const now = new Date();
    return [
      {
        id: "20221025123456789::abc123",
        activity_type: "FILL",
        transaction_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        type: "fill",
        price: "152.75",
        qty: "10",
        side: "buy",
        symbol: "AAPL",
        order_id: "61e69015-8549-4bfd-b9c3-01e75843f47d"
      },
      {
        id: "20221025123456790::def456",
        activity_type: "FILL",
        transaction_time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        type: "fill",
        price: "395.50",
        qty: "5",
        side: "sell",
        symbol: "TSLA",
        order_id: "71e69015-8549-4bfd-b9c3-01e75843f47e"
      },
      {
        id: "20221025123456791::ghi789",
        activity_type: "FILL",
        transaction_time: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        type: "fill",
        price: "3250.25",
        qty: "2",
        side: "buy",
        symbol: "AMZN",
        order_id: "81e69015-8549-4bfd-b9c3-01e75843f47f"
      }
    ];
  }

  getMockTokens() {
    return {
      accessToken: 'mock_alpaca_key_' + Date.now(),
      refreshToken: 'mock_alpaca_secret_' + Date.now(),
      tokenExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
  }
}

module.exports = AlpacaAdapter;