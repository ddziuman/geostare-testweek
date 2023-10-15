export function ensureNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0;
}