# Competition Scoring System

## Overview

Tomorrow's Winner uses a **graduated scoring system** for stock competitions that rewards users based on how close their prediction was to the actual best performer, rather than the traditional all-or-nothing approach.

## How It Works

### 1. Daily Ranking Process

Every day after market close:

1. **All Nasdaq 100 stocks are ranked** by their daily percentage change (highest to lowest)
2. **Rank #1** = Stock with the highest % gain
3. **Rank #2** = Stock with the second highest % gain
4. **...and so on**

### 2. Points Distribution

Users earn points based on the **rank of the stock they picked**:

| Rank | Points  | Description                     |
| ---- | ------- | ------------------------------- |
| #1   | **100** | Perfect pick - highest reward   |
| #2   | **60**  | Very close - significant reward |
| #3   | **40**  | Close - good reward             |
| #4   | **25**  | Good pick - solid points        |
| #5   | **20**  | Decent pick - reasonable reward |
| #6   | **15**  | Okay pick - moderate reward     |
| #7   | **12**  | Fair pick - some reward         |
| #8   | **10**  | Participation level             |
| #9   | **8**   | Participation level             |
| #10  | **7**   | Participation level             |
| #11  | **6**   | Participation level             |
| #12  | **5**   | Participation level             |
| #13  | **4**   | Participation level             |
| #14  | **3**   | Participation level             |
| #15  | **2**   | Minimal participation           |
| #16  | **1**   | Minimal participation           |
| #17+ | **0**   | No points awarded               |

## Why This System?

### 🎯 **Strategic Depth**

- Encourages research and analysis
- Rewards consistent good picks over lucky guesses
- Creates multiple winning strategies (aggressive vs conservative)

### 📈 **Better Engagement**

- ~16% of participants earn some points each day
- Reduces frustration from all-or-nothing scoring
- Maintains strong incentive for precision (#1 = 100 points)

### 🏆 **Skill Recognition**

- Separates skilled traders from random guessers
- Rewards users who consistently pick top performers
- Allows comeback potential after bad days

## Example Scenarios

### Scenario 1: Strong Pick

- **User picks**: NVDA
- **NVDA finishes**: Rank #3 with +2.8% gain
- **Points earned**: 40 points
- **Message**: "Great pick! NVDA finished #3 today"

### Scenario 2: Perfect Pick

- **User picks**: TSLA
- **TSLA finishes**: Rank #1 with +5.2% gain
- **Points earned**: 100 points
- **Message**: "Perfect! TSLA was the top performer"

### Scenario 3: Decent Pick

- **User picks**: AAPL
- **AAPL finishes**: Rank #8 with +1.1% gain
- **Points earned**: 10 points
- **Message**: "Good participation! AAPL finished #8"

### Scenario 4: Poor Pick

- **User picks**: META
- **META finishes**: Rank #45 with -0.8% loss
- **Points earned**: 0 points
- **Message**: "Better luck tomorrow! META finished #45"

## Strategic Implications

### 🎲 **Risk vs Reward Balance**

- **High-risk strategy**: Pick volatile stocks (potential for rank #1, but higher chance of no points)
- **Conservative strategy**: Pick consistently strong performers (steady points, lower variance)
- **Sector strategy**: Focus on specific industries you understand well

### 📊 **Long-term Success**

- **Consistency matters**: Users who regularly pick top 10 stocks will accumulate significant points
- **Skill development**: System encourages learning about market patterns and stock analysis
- **Comeback potential**: One bad day doesn't eliminate you from competition

## Technical Implementation

The scoring system is implemented in `/api/competition/stocks/end/route.ts`:

1. **Fetch price data** for all Nasdaq 100 stocks
2. **Calculate daily % changes** using Yahoo Finance data
3. **Sort and rank** all stocks by performance
4. **Award points** to users based on their stock's rank
5. **Store results** with full ranking context

## Configuration

The system is controlled by these constants in `/lib/constants.ts`:

```typescript
export const RANKING_POINTS = {
  1: 100,
  2: 60,
  3: 40,
  4: 25,
  5: 20,
  6: 15,
  7: 12,
  8: 10,
  9: 8,
  10: 7,
  11: 6,
  12: 5,
  13: 4,
  14: 3,
  15: 2,
  16: 1,
};

export const MAX_SCORING_RANK = 16;
```

Competition rules are set in `/lib/competitions.ts`:

```typescript
rules: {
  useRankingSystem: true,
  maxScoringRank: 16,
  // ... other rules
}
```

## Migration from Legacy System

The system maintains backward compatibility:

- **Legacy system**: 100 points for exact winner, 0 for all others
- **New system**: Graduated points based on ranking
- **Toggle**: Controlled by `useRankingSystem` flag in competition config

This allows for A/B testing and gradual rollout of the new scoring mechanism.
