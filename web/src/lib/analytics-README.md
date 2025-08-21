# Google Analytics 4 (GA4) Implementation

## Overview

This implementation provides comprehensive, privacy-compliant Google Analytics 4 tracking for Tomorrow's Winner. It tracks key user interactions while respecting user privacy and following GDPR/CCPA guidelines.

## Features

### ✅ Privacy-First Design

- **Cookie consent banner** with clear opt-in/opt-out
- **No advertising tracking** - only analytics for improving the platform
- **Anonymized data** - IP addresses are anonymized
- **Consent management** - Users can change preferences anytime

### ✅ Comprehensive Event Tracking

- **Page views** - Automatic tracking of all page navigation
- **Competition interactions** - View, join, and guess submission
- **User authentication** - Sign up and sign in tracking
- **Search behavior** - Track what users search for
- **Engagement metrics** - Time spent on pages, leaderboard views

### ✅ Type-Safe Implementation

- **TypeScript interfaces** for all event types
- **Custom hooks** for easy component integration
- **Centralized configuration** - Easy to modify or disable

## Files Structure

```
web/src/
├── lib/
│   ├── analytics.ts              # Core GA4 configuration and utilities
│   └── analytics-README.md       # This documentation
├── components/
│   └── analytics/
│       ├── GoogleAnalytics.tsx   # GA4 script loader
│       └── CookieConsent.tsx     # Privacy consent banner
└── hooks/
    └── use-analytics.ts          # React hooks for tracking
```

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX  # Your GA4 Measurement ID
```

### Key Settings

- **Development**: Analytics disabled in development mode
- **Privacy**: IP anonymization, no ad tracking, no personalization
- **Consent**: Default deny, explicit opt-in required

## Usage Examples

### Basic Page Tracking (Automatic)

```tsx
import { useAnalytics } from "@/hooks/use-analytics";

function MyPage() {
  // Page views are tracked automatically
  return <div>My content</div>;
}
```

### Competition Tracking

```tsx
import { useCompetitionTracking } from "@/hooks/use-analytics";

function CompetitionPage() {
  const { trackView, trackGuessSubmitted } = useCompetitionTracking();

  useEffect(() => {
    trackView({
      slug: "crypto-best-tomorrow",
      title: "Crypto Best Tomorrow",
      category: "crypto",
    });
  }, []);

  const handleGuess = () => {
    trackGuessSubmitted({
      slug: "crypto-best-tomorrow",
      category: "crypto",
    });
  };
}
```

### User Authentication Tracking

```tsx
import { useAnalytics } from "@/hooks/use-analytics";

function AuthForm() {
  const { trackUser } = useAnalytics();

  const handleSignUp = async () => {
    // ... auth logic
    trackUser("sign_up", "email");
  };
}
```

### Search and Filter Tracking

```tsx
import { useAnalytics } from "@/hooks/use-analytics";

function SearchComponent() {
  const { trackSearch, trackFilter } = useAnalytics();

  const handleSearch = (query: string) => {
    trackSearch(query);
  };

  const handleFilter = (type: string, value: string) => {
    trackFilter(type, value);
  };
}
```

## Event Types

### Competition Events

- `competition_view` - User views a competition
- `competition_join` - User joins a competition (makes first guess)
- `guess_submitted` - User submits/changes their guess

### User Events

- `sign_up` - New user registration
- `sign_in` - User authentication
- `profile_update` - Profile changes

### Engagement Events

- `leaderboard_view` - Leaderboard page visits
- `results_view` - Competition results viewing
- `search` - Search queries
- `filter_applied` - Filter usage

## Privacy Compliance

### GDPR/CCPA Compliance

- ✅ **Explicit consent** required before tracking
- ✅ **Granular control** - users can opt out of analytics
- ✅ **Data minimization** - only collect necessary data
- ✅ **Transparency** - clear explanation of what's tracked

### Data Collected

- **Anonymous usage patterns** - page views, clicks, navigation
- **Feature usage** - which competitions are popular, search terms
- **Performance metrics** - page load times, user engagement
- **NO personal data** - no names, emails, or identifying information

### Data NOT Collected

- ❌ Personal identifying information
- ❌ Advertising data
- ❌ Cross-site tracking
- ❌ User content or predictions

## Testing

### Development

```bash
# Analytics is disabled in development by default
npm run dev
```

### Production Testing

```bash
# Build and test with analytics enabled
npm run build
npm start
```

### Verify Implementation

1. Open browser dev tools → Network tab
2. Look for requests to `googletagmanager.com`
3. Check console for `gtag` function
4. Use Google Analytics DebugView for real-time validation

## Maintenance

### Adding New Events

1. Define event type in `analytics.ts`
2. Add tracking function
3. Update hooks if needed
4. Use in components

### Updating Consent

Users can manage consent through:

- Initial cookie banner
- Browser localStorage: `analytics-consent`
- Future: Settings page (can be added)

### Disabling Analytics

Set `NEXT_PUBLIC_GA4_ID` to empty or remove from environment variables.

## Best Practices

### Performance

- Scripts load asynchronously
- No impact on page load speed
- Graceful degradation if GA4 fails

### Privacy

- Always default to no tracking
- Respect user choices
- Regular consent re-prompting for major changes

### Data Quality

- Consistent event naming
- Structured data properties
- Regular validation of tracking

## Support

For issues or questions:

1. Check browser console for errors
2. Verify GA4_ID in environment
3. Test in production environment
4. Use Google Analytics DebugView for troubleshooting
