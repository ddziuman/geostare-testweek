export function ensureNonEmptyString(value: string | undefined): boolean {
  return typeof value === 'string' && value.length > 0;
}