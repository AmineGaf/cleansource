import { z } from 'zod';
import { moneySchema } from './common';

/** A wallet ledger entry — positive amounts are credits, negative are debits (halalas). */
export const walletTransactionSchema = z.object({
  id: z.string(),
  amount: z.number().int(),
  reason: z.string(),
  orderId: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type WalletTransaction = z.infer<typeof walletTransactionSchema>;

export const walletSchema = z.object({
  balance: moneySchema,
  transactions: z.array(walletTransactionSchema),
});
export type WalletResponse = z.infer<typeof walletSchema>;
