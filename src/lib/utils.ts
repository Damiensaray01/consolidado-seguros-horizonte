export function formatCurrency(amount: number | string | undefined): string {
  const num = Number(amount) || 0;
  const val = num > 50 ? num / 100 : num;
  return `$${val.toFixed(2).replace('.', ',')}`;
}