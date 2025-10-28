

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
- Created a **normalizer service** to combine trade data from various brokers into a consistent format for Journalyst.  
- Used a **token management system** that safely stores and refreshes tokens for each user, reducing manual work for long-running sync jobs.  
- All business logic (sync, normalize, token) is separated from routing to improve maintainability and make testing easier.
  
## How to Add a New Broker

 1. Build a new adapter by adding broker-specific data fetching and token management logic to the base `BrokerAdapter` class.
 2. Give the `NormalizerService` a normalization function for the broker's trade data.
 3. Add the broker to the list of approved brokers and use your new adapter to update pertinent services.
 4. If you include the broker's name in API requests, new endpoints or integrations will function automatically.
    
## Assumptions / Simplifications

 - For demonstration, tokens and user state are managed in-memory; for production, they are moved to persistent storage.
 - At the API level, error handling is strong, but there aren't many exceptions for custom business logic.
 - If API keys are not set, brokers use mock data, which allows for development and testing without actual trades.
 - There is no caching or retrying for unsuccessful remote requests.
 - For clarity, only essential endpoints and simple request validation are used.

---
