# Cron Jobs Configuration

This document explains the automated cron jobs that manage the daily competition lifecycle on Tomorrow's Winner.

## Overview

The application uses Vercel's built-in cron job functionality to automatically manage competitions throughout the trading day. All times are in **Eastern Time (ET)** to align with US market hours.

## Cron Job Schedule

### Morning (9:00 AM ET) - Competition Creation

**Schedule:** `0 9 * * 1-5` (Weekdays only)

- **Crypto Competitions**: `/api/competition/crypto/new`
- **Stock Competitions**: `/api/competition/stocks/new`

**What happens:**

- Creates new daily competitions for crypto and stocks
- Fetches current market data and available options
- Sets up competition with proper deadlines
- Users can start making predictions

### Afternoon (3:00 PM ET) - Competition Closing

**Schedule:** `0 15 * * 1-5` (Weekdays only)

- **Crypto Competitions**: `/api/competition/crypto/close`
- **Stock Competitions**: `/api/competition/stocks/close`

**What happens:**

- Closes voting for all active competitions
- Prevents new predictions from being submitted
- Maintains existing user predictions
- Prepares for end-of-day evaluation

### Evening (5:00 PM ET) - Competition Ending & Scoring

**Schedule:** `0 17 * * 1-5` (Weekdays only)

- **Crypto Competitions**: `/api/competition/crypto/end`
- **Stock Competitions**: `/api/competition/stocks/end`

**What happens:**

- Calculates final results based on market performance
- Assigns scores using the ranking-based system
- Updates user statistics and leaderboards
- Marks competitions as completed

## Time Zone Considerations

All cron jobs run in **UTC** but are scheduled to align with **Eastern Time (ET)**:

- **9:00 AM ET** = 14:00 UTC (during EST) or 13:00 UTC (during EDT)
- **3:00 PM ET** = 20:00 UTC (during EST) or 19:00 UTC (during EDT)
- **5:00 PM ET** = 22:00 UTC (during EST) or 21:00 UTC (during EDT)

## Security

All cron endpoints require authentication using the `CRON_SECRET` environment variable:

```bash
# Set in Vercel environment variables
CRON_SECRET=your-secure-secret-here
```

The secret can be passed via:

- **Header**: `x-cron-secret: your-secret`
- **Query Parameter**: `?secret=your-secret`

## Competition Lifecycle

### 1. Creation Phase (9:00 AM)

```
┌─────────────────┐
│ New Competition │
│ Created         │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Users Can Make  │
│ Predictions     │
└─────────────────┘
```

### 2. Closing Phase (3:00 PM)

```
┌─────────────────┐
│ Voting Closed   │
│ No New Guesses  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Waiting for     │
│ Market Close    │
└─────────────────┘
```

### 3. Ending Phase (5:00 PM)

```
┌─────────────────┐
│ Results         │
│ Calculated      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Scores Updated  │
│ Leaderboards    │
│ Updated         │
└─────────────────┘
```

## Weekend Handling

Cron jobs are scheduled for weekdays only (`1-5`) because:

- **Stock markets** are closed on weekends
- **Crypto markets** are 24/7 but have lower weekend activity
- **User engagement** is typically lower on weekends

## Error Handling

Each cron job includes comprehensive error handling:

- **Individual competition failures** don't stop other competitions
- **Detailed logging** for debugging
- **Graceful degradation** if external APIs fail
- **Retry mechanisms** for transient failures

## Monitoring

### Vercel Dashboard

- Monitor cron job execution in Vercel dashboard
- View logs and error rates
- Set up alerts for failures

### Application Logs

- Each endpoint logs detailed information
- Success/failure counts
- Performance metrics

### Health Checks

- `/api/health` endpoint for system status
- Competition state validation
- Database connectivity checks

## Manual Execution

For testing or emergency situations, you can manually trigger cron jobs:

```bash
# Using curl with authentication
curl -X POST https://your-app.vercel.app/api/competition/crypto/new \
  -H "x-cron-secret: your-secret"

# Or via query parameter
curl -X POST "https://your-app.vercel.app/api/competition/crypto/new?secret=your-secret"
```

## Environment Variables

Required environment variables for cron jobs:

```bash
# Authentication
CRON_SECRET=your-secure-secret-here

# Database
DATABASE_URL=your-supabase-connection-string
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# External APIs (for data fetching)
YAHOO_FINANCE_API_KEY=your-api-key
COINCAP_API_KEY=your-api-key
```

## Troubleshooting

### Common Issues

1. **Jobs not running**

   - Check Vercel cron job status
   - Verify environment variables
   - Check authentication secret

2. **Competitions not created**

   - Verify external API access
   - Check database connectivity
   - Review error logs

3. **Results not calculated**
   - Ensure market data is available
   - Check competition deadlines
   - Verify scoring logic

### Debug Commands

```bash
# Test competition creation
curl -X GET "https://your-app.vercel.app/api/competition/crypto/new?secret=your-secret"

# Test competition closing
curl -X GET "https://your-app.vercel.app/api/competition/crypto/close?secret=your-secret"

# Test competition ending
curl -X GET "https://your-app.vercel.app/api/competition/crypto/end?secret=your-secret"
```

## Future Enhancements

Potential improvements to consider:

- **Dynamic scheduling** based on market holidays
- **Retry mechanisms** for failed jobs
- **Slack/Discord notifications** for job status
- **Competition templates** for different market conditions
- **A/B testing** for different competition formats
