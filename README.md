

# Journalyst Broker Integration Layer

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AthrvaNaik/-Broker-Integration-Layer-API.git
   cd -Broker-Integration-Layer-API.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and set your broker API keys if available; otherwise, the app will use mock data for testing.
    ```bash
    PORT=3000
    NODE_ENV=development
    MONGODB_URI=
    ZERODHA_API_KEY=
    ZERODHA_API_SECRET=
    ALPACA_API_KEY=
    ALPACA_API_SECRET=
    USE_MOCK_DATA=true
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Design Decisions

- Used an **adapter pattern** so each broker is implemented as a separate, reusable module.
- Created a **normalizer service** to unify trade data from many brokers into a consistent format for Journalyst.
- Employed a **token management system** that securely stores and refreshes tokens for each user, minimizing manual intervention for long-running sync jobs.
- All business logic (sync, normalize, token) is split from routing for maintainability and easier testing.

## How to Add a New Broker

1. Create a new adapter by extending the base `BrokerAdapter` class and implementing broker-specific data fetching and token management logic.
2. Add a normalization function for the broker's trade data to the `NormalizerService`.
3. Register the broker in the supported brokers list and update relevant services with your new adapter.
4. New endpoints or integrations will work automatically if you send the broker’s name in API requests.

## Assumptions / Simplifications

- Tokens and user state are handled in-memory for demonstration—move to persistent storage for production.
- Error handling is robust at API level, but custom business logic exceptions are kept minimal.
- Mock data is used for brokers if API keys are not set, enabling development/testing without real trades.
- No caching or retry for failed remote requests.
- Only core endpoints and basic request validation are implemented for clarity.

---
