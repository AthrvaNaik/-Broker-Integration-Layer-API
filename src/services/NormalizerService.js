class NormalizerService {

  normalizeTrades(trades, brokerName, userId) {
    const normalizer = this.getBrokerNormalizer(brokerName);

    return trades
      .map((trade) => {
        try {
          return normalizer(trade, userId, brokerName);
        } catch (error) {
          console.error(`Error normalizing trade:`, error.message);
          return null;
        }
      })
      .filter((trade) => trade !== null);
  }

  getBrokerNormalizer(brokerName) {
    const normalizers = {
      zerodha: this.normalizeZerodhaTrade,
      alpaca: this.normalizeAlpacaTrade,
    };

    const normalizer = normalizers[brokerName.toLowerCase()];

    if (!normalizer) {
      throw new Error(`No normalizer found for broker: ${brokerName}`);
    }

    return normalizer;
  }

  normalizeZerodhaTrade(trade, userId, brokerName) {
    // Map Zerodha product codes
    const productMap = {
      CNC: "DELIVERY",
      MIS: "INTRADAY",
      NRML: "MARGIN",
    };

    // Map order types
    const orderTypeMap = {
      MARKET: "MARKET",
      LIMIT: "LIMIT",
      SL: "STOP_LOSS",
      "SL-M": "STOP_LOSS_MARKET",
    };

    return {
      userId: userId,
      brokerName: brokerName,
      brokerTradeId: trade.trade_id,

      // Core fields
      symbol: trade.tradingsymbol,
      exchange: trade.exchange,
      tradeType: trade.transaction_type, // BUY or SELL
      quantity: trade.quantity,
      price: trade.average_price,

      // Additional details
      orderType: orderTypeMap[trade.order_type] || "MARKET",
      product: productMap[trade.product] || "DELIVERY",
      status: "COMPLETE",

      // Timestamps
      tradeTime: new Date(trade.exchange_timestamp || trade.trade_time),

      // Calculations
      totalValue: trade.quantity * trade.average_price,

      // Metadata
      rawData: trade,
      syncedAt: new Date(),
    };
  }

  normalizeAlpacaTrade(trade, userId, brokerName) {
    return {
      userId: userId,
      brokerName: brokerName,
      brokerTradeId: trade.id,

      
      symbol: trade.symbol,
      exchange: "NASDAQ",
      tradeType: trade.side.toUpperCase(),
      quantity: parseFloat(trade.qty),
      price: parseFloat(trade.price),

      
      orderType: "MARKET",
      product: "DELIVERY",
      status: "COMPLETE",

      
      tradeTime: new Date(trade.transaction_time),

      
      totalValue: parseFloat(trade.qty) * parseFloat(trade.price),

      
      rawData: trade,
      syncedAt: new Date(),
    };
  }

  
  validateNormalizedTrade(trade) {
    const requiredFields = [
      "userId",
      "brokerName",
      "brokerTradeId",
      "symbol",
      "exchange",
      "tradeType",
      "quantity",
      "price",
      "tradeTime",
      "totalValue",
    ];

    for (const field of requiredFields) {
      if (!trade[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    
    if (!["BUY", "SELL"].includes(trade.tradeType)) {
      throw new Error(`Invalid trade type: ${trade.tradeType}`);
    }


    if (trade.quantity <= 0 || trade.price <= 0) {
      throw new Error("Quantity and price must be positive numbers");
    }

    return true;
  }
}

module.exports = new NormalizerService();
