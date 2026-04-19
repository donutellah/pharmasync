/**
 * Format an integer cent value as Philippine Peso.
 * Shows centavo part only when non-zero.
 *
 * formatPeso(1800)  → "₱18"
 * formatPeso(1850)  → "₱18.50"
 * formatPeso(100)   → "₱1"
 * formatPeso(50)    → "₱0.50"
 */
export function formatPeso(cents) {
  if (cents == null) return '₱0';
  const c = Math.round(Number(cents));
  const whole    = Math.floor(c / 100);
  const centavos = c % 100;
  if (centavos === 0) {
    return '₱' + whole.toLocaleString('en-PH');
  }
  return '₱' + (c / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format a REAL peso value (e.g. from Sales.total_amount).
 * Shows centavo part only when non-zero.
 *
 * formatPesoReal(18)      → "₱18"
 * formatPesoReal(18.5)    → "₱18.50"
 * formatPesoReal(1234.00) → "₱1,234"
 */
export function formatPesoReal(pesos) {
  if (pesos == null) return '₱0';
  const n         = Number(pesos);
  const cents     = Math.round(n * 100);
  const whole     = Math.floor(cents / 100);
  const centavos  = cents % 100;
  if (centavos === 0) {
    return '₱' + whole.toLocaleString('en-PH');
  }
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
