const axios = require("axios");
const BrokerAdapter = require("./BrokerAdapter");

class ZerodhaAdapter extends BrokerAdapter {
  constructor(config = {}) {
    super(config);
    this.brokerName = "zerodha";
    this.baseURL = "https://api.kite.trade";

    // Force mock mode if no API keys provided
    this.useMockData =
      !config.apiKey ||
      !config.apiSecret ||
      config.useMockData ||
      process.env.USE_MOCK_DATA === "true";
  }

  async fetchTrades(accessToken, options = {}) {
    // If mock mode is enabled, return mock data
    if (this.useMockData) {
      return this.getMockTrades();
    }

    try {
      const response = await axios.get(`${this.baseURL}/trades`, {
        headers: {
          "X-Kite-Version": "3",
          Authorization: `token ${this.config.apiKey}:${accessToken}`,
        },
      });

      return response.data.data || [];
    } catch (error) {
      throw new Error(`Zerodha API Error: ${error.message}`);
    }
  }


  async refreshAccessToken(refreshToken) {
    if (this.useMockData) {
      return this.getMockTokens();
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/session/refresh_token`,
        {
          api_key: this.config.apiKey,
          refresh_token: refreshToken,
        }
      );

      return {
        accessToken: response.data.data.access_token,
        refreshToken: refreshToken,
        tokenExpiry: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      };
    } catch (error) {
      throw new Error(`Token Refresh Error: ${error.message}`);
    }
  }


  async validateToken(accessToken) {
    if (this.useMockData) {
      return true;
    }

    try {
      await axios.get(`${this.baseURL}/user/profile`, {
        headers: {
          "X-Kite-Version": "3",
          Authorization: `token ${this.config.apiKey}:${accessToken}`,
        },
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
        trade_id: "12345678",
        order_id: "221025000012345",
        exchange_order_id: "1234567890123456",
        tradingsymbol: "RELIANCE",
        exchange: "NSE",
        instrument_token: 738561,
        transaction_type: "BUY",
        product: "CNC",
        quantity: 10,
        average_price: 2456.75,
        trade_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        exchange_timestamp: new Date(
          now.getTime() - 2 * 60 * 60 * 1000
        ).toISOString(),
        order_type: "MARKET",
      },
      {
        trade_id: "12345679",
        order_id: "221025000012346",
        exchange_order_id: "1234567890123457",
        tradingsymbol: "TCS",
        exchange: "NSE",
        instrument_token: 2953217,
        transaction_type: "SELL",
        product: "CNC",
        quantity: 5,
        average_price: 3289.5,
        trade_time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        exchange_timestamp: new Date(
          now.getTime() - 1 * 60 * 60 * 1000
        ).toISOString(),
        order_type: "LIMIT",
      },
      {
        trade_id: "12345680",
        order_id: "221025000012347",
        exchange_order_id: "1234567890123458",
        tradingsymbol: "INFY",
        exchange: "NSE",
        instrument_token: 408065,
        transaction_type: "BUY",
        product: "MIS",
        quantity: 20,
        average_price: 1456.25,
        trade_time: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        exchange_timestamp: new Date(
          now.getTime() - 30 * 60 * 1000
        ).toISOString(),
        order_type: "MARKET",
      },
    ];
  }


  getMockTokens() {
    return {
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now(),
      tokenExpiry: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    };
  }
}

module.exports = ZerodhaAdapter;
