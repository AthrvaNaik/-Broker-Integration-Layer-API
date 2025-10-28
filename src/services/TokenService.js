const User = require('../models/User');

class TokenService {

  async getBrokerConnection(userId, brokerName) {
    const user = await User.findOne({ userId });
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const connection = user.getBrokerConnection(brokerName);
    
    if (!connection) {
      throw new Error(`No ${brokerName} connection found for user ${userId}`);
    }

    return { user, connection };
  }


  isTokenExpired(tokenExpiry) {
    const now = new Date();
    const expiry = new Date(tokenExpiry);
    
    
    const bufferTime = 5 * 60 * 1000;
    return now >= new Date(expiry.getTime() - bufferTime);
  }


  async refreshToken(userId, brokerName, brokerAdapter) {
    const { user, connection } = await this.getBrokerConnection(userId, brokerName);

    if (!connection.refreshToken) {
      throw new Error(`No refresh token available for ${brokerName}`);
    }

    console.log(`🔄 Refreshing token for user ${userId} on ${brokerName}`);

    
    const newTokens = await brokerAdapter.refreshAccessToken(connection.refreshToken);

    
    connection.accessToken = newTokens.accessToken;
    connection.refreshToken = newTokens.refreshToken || connection.refreshToken;
    connection.tokenExpiry = newTokens.tokenExpiry;

    await user.save();

    console.log(` Token refreshed successfully for user ${userId}`);

    return {
      accessToken: newTokens.accessToken,
      tokenExpiry: newTokens.tokenExpiry
    };
  }


  async getValidToken(userId, brokerName, brokerAdapter) {
    const { user, connection } = await this.getBrokerConnection(userId, brokerName);

    if (this.isTokenExpired(connection.tokenExpiry)) {
      console.log(` Token expired for user ${userId}, refreshing`);
      const refreshed = await this.refreshToken(userId, brokerName, brokerAdapter);
      return refreshed.accessToken;
    }

    console.log(`Using existing valid token for user ${userId}`);
    return connection.accessToken;
  }

 
  async updateLastSync(userId, brokerName) {
    const user = await User.findOne({ userId });
    
    if (user) {
      const connection = user.getBrokerConnection(brokerName);
      if (connection) {
        connection.lastSyncedAt = new Date();
        await user.save();
      }
    }
  }
}

module.exports = new TokenService();