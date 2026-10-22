// Regras comerciais de pagamento (espelhadas no SQL docs/sql/pix-discount.sql).
export const MAX_INSTALLMENTS = 2;
export const PIX_DISCOUNT_RATE = 0.05;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Desconto Pix: 5% sobre o subtotal dos produtos (frete não entra). */
export function pixDiscount(subtotal: number): number {
  return round2(subtotal * PIX_DISCOUNT_RATE);
}

export function installmentValue(amount: number): number {
  return round2(amount / MAX_INSTALLMENTS);
}
