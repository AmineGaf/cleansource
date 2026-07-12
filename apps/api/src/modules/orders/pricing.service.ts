import { Injectable } from '@nestjs/common';
import { VAT_RATE, type PriceBreakdown } from '@cleansource/contracts';

interface PricingInput {
  /** halalas */
  subtotal: number;
  promo?: { percentOff: number; maxDiscount: number | null } | null;
  /** halalas available in the customer's wallet (0 if unused) */
  walletBalance?: number;
}

/**
 * Checkout math, exactly as displayed in the design:
 * subtotal − promo discount − wallet credit, then 15% VAT on the taxable amount.
 * All values in halalas; VAT rounded to the nearest halala.
 */
@Injectable()
export class PricingService {
  compute({
    subtotal,
    promo,
    walletBalance = 0,
  }: PricingInput): PriceBreakdown {
    const rawDiscount = promo
      ? Math.round((subtotal * promo.percentOff) / 100)
      : 0;
    const discount =
      promo?.maxDiscount != null
        ? Math.min(rawDiscount, promo.maxDiscount)
        : rawDiscount;

    const afterDiscount = Math.max(0, subtotal - discount);
    const walletCreditUsed = Math.min(walletBalance, afterDiscount);
    const taxable = afterDiscount - walletCreditUsed;

    const vat = Math.round(taxable * VAT_RATE);
    const total = taxable + vat;

    return { subtotal, discount, walletCreditUsed, vat, total };
  }
}
