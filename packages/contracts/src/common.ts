import { z } from 'zod';

export const CURRENCY = 'SAR' as const;
/** KSA VAT — shown as a line item at checkout per the design. */
export const VAT_RATE = 0.15;

/** Saudi mobile number, normalized to E.164 (+9665XXXXXXXX). */
export const saudiPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .transform((value) => {
    if (value.startsWith('05')) return `+966${value.slice(1)}`;
    if (value.startsWith('966')) return `+${value}`;
    if (value.startsWith('5') && value.length === 9) return `+966${value}`;
    return value;
  })
  .pipe(z.string().regex(/^\+9665\d{8}$/, 'Invalid Saudi mobile number'));

export const idSchema = z.string().cuid();

/** Money is stored and transported in halalas (integer minor units). */
export const moneySchema = z.number().int().nonnegative();

export const toHalalas = (sar: number): number => Math.round(sar * 100);
export const toSar = (halalas: number): number => halalas / 100;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type Pagination = z.infer<typeof paginationSchema>;
