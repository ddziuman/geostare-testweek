export function enforceMinMax(e: Event) {
  const input = e.target as HTMLInputElement;

  const newValue = parseFloat(input.value);
  if (!newValue) return;

  const minValue = parseFloat(input.min);
  const maxValue = parseFloat(input.max);
  if (newValue < minValue) input.value = input.min;
  if (newValue > maxValue) input.value = input.max;
}
