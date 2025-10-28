
class BrokerAdapter {
  constructor(config = {}) {
    this.config = config;
    this.brokerName = 'base';
  }

  
  async fetchTrades(accessToken, options = {}) {
    throw new Error('fetchTrades() must be implemented by subclass');
  }


  async refreshAccessToken(refreshToken) {
    throw new Error('refreshAccessToken() must be implemented by subclass');
  }

  async validateToken(accessToken) {
    throw new Error('validateToken() must be implemented by subclass');
  }


  getBrokerName() {
    return this.brokerName;
  }
}

module.exports = BrokerAdapter;