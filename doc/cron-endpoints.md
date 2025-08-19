# Tomorrow's Winner - Competition API Endpoints Documentation

This document provides comprehensive documentation for all automated competition endpoints used in the Tomorrow's Winner application. The new architecture separates each competition type into its own lifecycle endpoints for better maintainability and flexibility.

## Overview

The application uses competition-specific endpoints to manage the complete lifecycle of each competition type:

### Crypto Competitions

1. **`/api/competition/crypto/new`** - Creates new crypto competition + fetches data
2. **`/api/competition/crypto/close`** - Closes voting for crypto competitions
3. **`/api/competition/crypto/end`** - Calculates crypto competition results

### Stock Competitions

1. **`/api/competition/stocks/new`** - Creates new stocks competition + fetches data
2. **`/api/competition/stocks/close`** - Closes voting for stock competitions
3. **`/api/competition/stocks/end`** - Calculates stock competition results

## Competition Configuration System

Each competition type has a centralized configuration that defines:

- **Rules**: Points, tie handling, winner criteria
- **Timing**: When competitions run (weekdays vs 24/7)
- **Data Sources**: What external APIs to fetch from
- **Phases**: Setup → Voting → Closed → Evaluation → Ended

## Authentication

All cron endpoints require authentication via the `CRON_SECRET` environment variable.

### Authentication Methods

- **Header**: `x-cron-secret: <secret>`
- **Query Parameter**: `?secret=<secret>`

### Response Format

All endpoints return JSON responses in the format:

```json
{
  "ok": true|false,
  "error": "message", // Only on errors
  "context": {}, // Additional error context
  // ... endpoint-specific data
}
```

---

## 1. Crypto Competition Endpoints

### 1.1 Create New Crypto Competition (`/api/competition/crypto/new`)

**Endpoint**: `POST /api/competition/crypto/new`  
**Purpose**: Creates new crypto competition and fetches fresh crypto data  
**Schedule**: Run daily at ~6 PM ET (crypto markets are 24/7)

#### Functionality

- Creates competition for next day's best crypto performer
- Fetches top 100 cryptocurrencies from CoinCap API (fallback: CoinPaprika)
- Updates crypto prices and metadata in database
- Adds crypto options to the competition
- Always runs (crypto markets operate 24/7)

#### Competition Configuration

- **Category**: `crypto`
- **Rules**: 100 points for correct guess, 0 for incorrect, ties allowed
- **Winner Criteria**: Highest percentage change over 24 hours
- **Slug Format**: `crypto-best-YYYY-MM-DD`

#### Database Operations

- **competitions**: Creates new competition record
- **crypto_prices_daily**: Updates daily price snapshots
- **crypto_coins**: Updates cryptocurrency metadata
- **options**: Adds top 100 coins as competition choices

#### Response Example

```json
{
  "ok": true,
  "competition": {
    "id": 123,
    "slug": "crypto-best-2024-01-15",
    "title": "Crypto Best Performer 2024-01-15",
    "timing": {
      "startAt": "2024-01-15T00:00:00-05:00",
      "deadlineAt": "2024-01-14T22:00:00-05:00",
      "evaluationStartAt": "2024-01-15T00:00:00-05:00",
      "evaluationEndAt": "2024-01-15T23:59:59-05:00"
    }
  },
  "optionsAdded": 100,
  "dataFetched": true
}
```

### 1.2 Close Crypto Competition Voting (`/api/competition/crypto/close`)

**Endpoint**: `POST /api/competition/crypto/close`  
**Purpose**: Closes voting for crypto competitions past their deadline  
**Schedule**: Run every hour to catch competitions that should be closed

#### Functionality

- Finds crypto competitions past their deadline
- Marks competitions as closed (sets `closed_at` timestamp)
- Prevents new votes from being submitted
- Provides voting statistics

#### Response Example

```json
{
  "ok": true,
  "closed": 1,
  "competitions": [
    {
      "id": 123,
      "slug": "crypto-best-2024-01-15",
      "title": "Crypto Best Performer 2024-01-15",
      "deadline": "2024-01-14T22:00:00-05:00",
      "totalVotes": 47,
      "closedAt": "2024-01-14T22:01:00-05:00"
    }
  ],
  "timestamp": "2024-01-14T22:01:00-05:00"
}
```

### 1.3 End Crypto Competition (`/api/competition/crypto/end`)

**Endpoint**: `POST /api/competition/crypto/end`  
**Purpose**: Calculates winners and scores for completed crypto competitions  
**Schedule**: Run daily after evaluation period ends

#### Functionality

- Calculates percentage changes for all crypto options
- Determines winners (highest gainers, ties allowed)
- Updates results table with performance data
- Scores user predictions (100 points for correct, 0 for incorrect)
- Marks competition as ended

#### Scoring Logic

1. Compare today's price vs yesterday's price for each crypto
2. Find highest percentage change(s)
3. Handle ties if multiple cryptos have same performance
4. Award points to users who predicted correctly

#### Response Example

```json
{
  "ok": true,
  "ended": 1,
  "competitions": [
    {
      "id": 123,
      "slug": "crypto-best-2024-01-15",
      "title": "Crypto Best Performer 2024-01-15",
      "endedAt": "2024-01-16T00:30:00-05:00",
      "winners": 2,
      "bestPerformance": 0.156,
      "optionsEvaluated": 98,
      "totalGuesses": 47,
      "correctGuesses": 8,
      "accuracy": 17.02
    }
  ],
  "timestamp": "2024-01-16T00:30:00-05:00"
}
```

---

## 2. Stock Competition Endpoints

### 2.1 Create New Stock Competition (`/api/competition/stocks/new`)

**Endpoint**: `POST /api/competition/stocks/new`  
**Purpose**: Creates new stocks competition and fetches fresh stock data  
**Schedule**: Run daily at ~4 PM ET (weekdays only, when markets are open)

#### Functionality

- Creates competition for next day's best S&P 500 performer
- Fetches S&P 500 constituents from DataHub API (with fallbacks)
- Updates stock prices from Stooq API
- Adds stock options to the competition
- Only runs on weekdays (markets closed weekends)

#### Competition Configuration

- **Category**: `finance`
- **Rules**: 100 points for correct guess, 0 for incorrect, ties allowed
- **Winner Criteria**: Highest percentage change during market hours
- **Slug Format**: `sp500-best-YYYY-MM-DD`

#### Data Sources

1. **S&P 500 Constituents** (Priority order):

   - Primary: `https://datahub.io/core/s-and-p-500-companies/r/constituents.json`
   - Fallback 1: `https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.json`
   - Fallback 2: Built-in hardcoded list (`SP500_FALLBACK`)

2. **Stock Prices**:
   - Source: Stooq.com API (`https://stooq.com/q/d/l/?s={symbol}.us&i=d`)
   - Format: CSV data with Date, Close columns
   - Timeout: 10 seconds per request
   - Batch size: 50 stocks per batch

#### Database Operations

- **competitions**: Creates new competition record
- **equity_tickers**: Updates S&P 500 constituent list
- **equity_prices_eod**: Stores end-of-day price data
- **options**: Adds all S&P 500 stocks as competition choices

#### Response Example

```json
{
  "ok": true,
  "competition": {
    "id": 124,
    "slug": "sp500-best-2024-01-15",
    "title": "S&P 500 Best Performer 2024-01-15",
    "timing": {
      "startAt": "2024-01-15T00:00:00-05:00",
      "deadlineAt": "2024-01-14T22:00:00-05:00",
      "evaluationStartAt": "2024-01-15T09:30:00-05:00",
      "evaluationEndAt": "2024-01-15T16:00:00-05:00"
    }
  },
  "optionsAdded": 503,
  "stocksProcessed": 487,
  "dataFetched": true
}
```

### 2.2 Close Stock Competition Voting (`/api/competition/stocks/close`)

**Endpoint**: `POST /api/competition/stocks/close`  
**Purpose**: Closes voting for stock competitions past their deadline  
**Schedule**: Run every hour to catch competitions that should be closed

#### Functionality

- Finds stock competitions past their deadline
- Marks competitions as closed (sets `closed_at` timestamp)
- Prevents new votes from being submitted
- Provides voting statistics

#### Response Example

```json
{
  "ok": true,
  "closed": 1,
  "competitions": [
    {
      "id": 124,
      "slug": "sp500-best-2024-01-15",
      "title": "S&P 500 Best Performer 2024-01-15",
      "deadline": "2024-01-14T22:00:00-05:00",
      "totalVotes": 73,
      "closedAt": "2024-01-14T22:02:00-05:00"
    }
  ],
  "timestamp": "2024-01-14T22:02:00-05:00"
}
```

### 2.3 End Stock Competition (`/api/competition/stocks/end`)

**Endpoint**: `POST /api/competition/stocks/end`  
**Purpose**: Calculates winners and scores for completed stock competitions  
**Schedule**: Run daily after market close and evaluation period ends

#### Functionality

- Calculates percentage changes for all stock options
- Determines winners (highest gainers, ties allowed)
- Updates results table with performance data
- Scores user predictions (100 points for correct, 0 for incorrect)
- Marks competition as ended

#### Scoring Logic

1. Compare today's close vs yesterday's close for each stock
2. Find highest percentage change(s)
3. Handle ties if multiple stocks have same performance
4. Award points to users who predicted correctly

#### Response Example

```json
{
  "ok": true,
  "ended": 1,
  "competitions": [
    {
      "id": 124,
      "slug": "sp500-best-2024-01-15",
      "title": "S&P 500 Best Performer 2024-01-15",
      "endedAt": "2024-01-15T16:30:00-05:00",
      "winners": 1,
      "bestPerformance": 0.087,
      "optionsEvaluated": 487,
      "totalGuesses": 73,
      "correctGuesses": 12,
      "accuracy": 16.44,
      "winningSymbols": ["NVDA"]
    }
  ],
  "timestamp": "2024-01-15T16:30:00-05:00"
}
```

---

## Health Check Endpoint

**Endpoint**: `GET /api/health`  
**Purpose**: Simple health check for monitoring  
**Authentication**: None required

### Response

```json
{
  "ok": true,
  "timestamp": "2024-01-15T21:30:00.000Z"
}
```

---

## Recommended Cron Schedule

### Competition Lifecycle Schedule

```bash
# Create new crypto competitions (6 PM ET = 23:00 UTC in winter)
0 23 * * * curl -X POST -H "x-cron-secret: $CRON_SECRET" https://yourapp.com/api/competition/crypto/new

# Create new stock competitions (4 PM ET = 21:00 UTC in winter, weekdays only)
0 21 * * 1-5 curl -X POST -H "x-cron-secret: $CRON_SECRET" https://yourapp.com/api/competition/stocks/new

# Close competitions every hour (voting deadline enforcement)
0 * * * * curl -X POST -H "x-cron-secret: $CRON_SECRET" https://yourapp.com/api/competition/crypto/close
0 * * * * curl -X POST -H "x-cron-secret: $CRON_SECRET" https://yourapp.com/api/competition/stocks/close

# End crypto competitions (after 24h evaluation, 12:30 AM ET next day)
30 5 * * * curl -X POST -H "x-cron-secret: $CRON_SECRET" https://yourapp.com/api/competition/crypto/end

# End stock competitions (after market close + evaluation, 4:30 PM ET)
30 21 * * 1-5 curl -X POST -H "x-cron-secret: $CRON_SECRET" https://yourapp.com/api/competition/stocks/end
```

## Environment Variables

- `CRON_SECRET`: Secret key for authenticating cron requests
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for admin access

## Error Handling

All endpoints include comprehensive error handling:

- Authentication failures (403)
- Database connection issues (500)
- External API failures with fallbacks
- Rate limiting and timeout protection
- Detailed error logging with context

## Competition Configuration System

The new architecture includes a centralized configuration system (`/lib/competitions.ts`) that defines:

### Competition Types

- **Crypto**: 24/7 markets, top 100 cryptocurrencies, highest % change wins
- **Stocks**: Weekday markets only, S&P 500 constituents, highest % change wins

### Configuration Properties

- **Rules**: Points (100 correct, 0 incorrect), tie handling, winner criteria
- **Timing**: Start/deadline/evaluation periods, timezone handling
- **Data Sources**: External APIs, refresh intervals, fallback sources
- **Phases**: Setup → Voting → Closed → Evaluation → Ended

### Phase Management

Each competition progresses through defined phases with automatic timing:

1. **Setup**: Competition created, data fetched, options added
2. **Voting**: Users can submit predictions until deadline
3. **Closed**: Voting stops, waiting for evaluation period
4. **Evaluation**: Market data collected for scoring
5. **Ended**: Results calculated, scores awarded

### Benefits

- **Reusable**: Same config used in UI and APIs
- **Maintainable**: Single source of truth for competition rules
- **Extensible**: Easy to add new competition types
- **Testable**: Clear separation of concerns

## Database Tables Involved

- **competitions**: Competition definitions and metadata
- **options**: Available choices for each competition
- **guesses**: User predictions
- **results**: Competition outcomes and performance data
- **scores**: User points for each competition
- **crypto_coins**: Cryptocurrency metadata
- **crypto_prices_daily**: Daily crypto price snapshots
- **equity_tickers**: S&P 500 constituent list
- **equity_prices_eod**: End-of-day stock prices

## Monitoring & Logs

- All endpoints log progress and errors to console
- Batch processing includes progress updates
- Failed requests include detailed error context
- Response timing and success rates should be monitored
