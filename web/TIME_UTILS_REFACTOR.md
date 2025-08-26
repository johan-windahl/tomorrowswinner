# Time Utils Refactoring

## Problem

There was significant duplication of time-related logic across the codebase:

1. **CronService** (`web/src/lib/services/cron-service.ts`):

   - `isTimeMatch()` - Check if current time matches specific hour and minute in ET
   - `isWeekday()` - Check if current date is a weekday
   - `toETDate()` - Convert UTC date to ET timezone

2. **BaseCronHandler** (`web/src/lib/api/cron-handlers/base-cron-handler.ts`):
   - `isTimeWithMinute()` - Check if current time matches specific hour and minute in ET
   - `isWeekday()` - Check if current date is a weekday
   - `getETDate()` - Get current date/time in ET timezone
   - `getETHour()` - Get current hour in ET timezone
   - `getETMinute()` - Get current minute in ET timezone
   - `getETDayOfWeek()` - Get current day of week in ET timezone
   - `etDate()` - Format date as YYYY-MM-DD string in ET
   - `isTime()` - Check if current time matches specific hour in ET

This duplication caused:

- Maintenance overhead
- Potential inconsistencies
- Code bloat
- Difficulty in updating timezone logic

## Solution

### 1. Created Shared Time Utils Module

Created `web/src/lib/utils/time-utils.ts` with all time-related functions:

```typescript
export function getETDate(date: Date): Date;
export function getETHour(date: Date): number;
export function getETMinute(date: Date): number;
export function getETDayOfWeek(date: Date): number;
export function formatETDate(date: Date): string;
export function isTimeMatch(date: Date, hour: number, minute: number): boolean;
export function isWeekday(date: Date): boolean;
export function isTime(date: Date, hour: number): boolean;
```

### 2. Refactored BaseCronHandler

- Removed all duplicated time utility methods
- Updated methods to use shared utilities
- Maintained backward compatibility through wrapper methods

### 3. Refactored CronService

- Removed duplicated time utility methods
- Updated to use shared utilities
- Fixed TypeScript `any` types to use `unknown`

### 4. Added Comprehensive Tests

Created `web/src/__tests__/lib/utils/time-utils.test.ts` with tests for:

- Timezone conversion accuracy
- Time matching logic
- Weekday detection
- Date formatting

## Benefits

1. **DRY Principle**: Eliminated code duplication
2. **Single Source of Truth**: All time logic centralized in one module
3. **Easier Maintenance**: Changes to timezone logic only need to be made in one place
4. **Better Testing**: Comprehensive test coverage for time utilities
5. **Type Safety**: Improved TypeScript types
6. **Consistency**: All components now use the same time logic

## Files Changed

### Added

- `web/src/lib/utils/time-utils.ts` - New shared time utilities
- `web/src/__tests__/lib/utils/time-utils.test.ts` - Tests for time utilities

### Modified

- `web/src/lib/api/cron-handlers/base-cron-handler.ts` - Refactored to use shared utilities
- `web/src/lib/services/cron-service.ts` - Refactored to use shared utilities

## Testing

All tests pass:

- ✅ Time utilities tests: 11/11 passed
- ✅ General utils tests: 13/13 passed
- ✅ Cron handler tests: 9/9 passed

## Migration Notes

The refactoring maintains backward compatibility:

- All existing method signatures remain the same
- No breaking changes to public APIs
- Existing code continues to work without modification

## Future Improvements

1. Consider using a dedicated timezone library like `date-fns-tz` for more robust timezone handling
2. Add more comprehensive edge case testing for daylight saving time transitions
3. Consider adding timezone validation and error handling
