

class BrokerError extends Error {
  constructor(message, brokerName) {
    super(message);
    this.name = 'BrokerError';
    this.brokerName = brokerName;
  }
}

class TokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TokenError';
  }
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class SyncError extends Error {
  constructor(message, userId, brokerName) {
    super(message);
    this.name = 'SyncError';
    this.userId = userId;
    this.brokerName = brokerName;
  }
}

module.exports = {
  BrokerError,
  TokenError,
  ValidationError,
  SyncError
};