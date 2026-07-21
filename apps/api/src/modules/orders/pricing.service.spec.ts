import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const pricing = new PricingService();

  it('applies 15% VAT on the plain subtotal', () => {
    // 49 SAR package
    expect(pricing.compute({ subtotal: 4900 })).toEqual({
      subtotal: 4900,
      discount: 0,
      walletCreditUsed: 0,
      vat: 735,
      total: 5635,
    });
  });

  it('applies a percentage promo before VAT', () => {
    const result = pricing.compute({
      subtotal: 10000,
      promo: { percentOff: 20, maxDiscount: null },
    });
    expect(result.discount).toBe(2000);
    expect(result.vat).toBe(1200);
    expect(result.total).toBe(9200);
  });

  it('caps the promo discount at maxDiscount', () => {
    const result = pricing.compute({
      subtotal: 10000,
      promo: { percentOff: 50, maxDiscount: 1500 },
    });
    expect(result.discount).toBe(1500);
    expect(result.total).toBe(8500 + Math.round(8500 * 0.15));
  });

  it('uses wallet credit after the discount and taxes only the remainder', () => {
    const result = pricing.compute({
      subtotal: 10000,
      promo: { percentOff: 10, maxDiscount: null },
      walletBalance: 3000,
    });
    // 10000 - 1000 discount = 9000; 3000 wallet → 6000 taxable
    expect(result.walletCreditUsed).toBe(3000);
    expect(result.vat).toBe(900);
    expect(result.total).toBe(6900);
  });

  it('never uses more wallet credit than the amount due', () => {
    const result = pricing.compute({ subtotal: 2000, walletBalance: 99999 });
    expect(result.walletCreditUsed).toBe(2000);
    expect(result.total).toBe(0);
  });

  it('never produces a negative taxable amount on oversized discounts', () => {
    const result = pricing.compute({
      subtotal: 1000,
      promo: { percentOff: 100, maxDiscount: null },
    });
    expect(result.discount).toBe(1000);
    expect(result.vat).toBe(0);
    expect(result.total).toBe(0);
  });

  it('rounds VAT to the nearest halala', () => {
    // 333 halalas → VAT 49.95 → 50
    expect(pricing.compute({ subtotal: 333 }).vat).toBe(50);
  });
});
