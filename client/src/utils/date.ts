/**
 * Parse a date value from the GraphQL API.
 * Handles both ISO strings ("2026-06-15T14:00:00.000Z")
 * and numeric timestamp strings ("1781532000000") that
 * Mongoose returns through GraphQL's String type.
 */
export function parseDate(value: string): Date {
  // If it's all digits, treat as a millisecond timestamp
  if (/^\d+$/.test(value)) {
    return new Date(Number(value));
  }
  return new Date(value);
}
