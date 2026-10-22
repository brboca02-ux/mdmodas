import { describe, it, expect } from "vitest";
import { MAX_INSTALLMENTS, PIX_DISCOUNT_RATE, pixDiscount, installmentValue } from "./paymentRules";

describe("regras de pagamento", () => {
  it("parcela no máximo em 2x", () => expect(MAX_INSTALLMENTS).toBe(2));
  it("desconto Pix é 5%", () => {
    expect(PIX_DISCOUNT_RATE).toBe(0.05);
    expect(pixDiscount(200)).toBe(10);
  });
  it("2x de R$ 199,90 = R$ 99,95", () => expect(installmentValue(199.9)).toBe(99.95));
});
