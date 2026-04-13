export function formatPrice(amount: string | number): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  const safeValue = Number.isFinite(value) ? value : 0
  return `$${Math.floor(safeValue).toLocaleString('en-US')}`
}

export function formatPriceModifier(modifier: number): string {
  if (modifier === 0) return 'Included'
  return `+$${modifier}`
}
