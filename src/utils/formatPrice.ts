export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

export function formatPriceModifier(modifier: number): string {
  if (modifier === 0) return 'Included'
  return `+$${modifier}`
}
