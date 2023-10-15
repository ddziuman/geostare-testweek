export function ensureIsObject(value: unknown): boolean {
  return !Object.is(value, null) && typeof value === 'object';
}