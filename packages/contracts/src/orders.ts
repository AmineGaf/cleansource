import { z } from 'zod';
import { moneySchema } from './common';
import { OrderStatus, OrderType, PaymentMethod } from './enums';

/** Pickup time slots as designed (morning / midday / evening ranges). */
export const timeSlotSchema = z.object({
  /** e.g. "09-11" — stable slot code. */
  code: z.string().regex(/^\d{2}-\d{2}$/),
  date: z.string().date(),
});
export type TimeSlot = z.infer<typeof timeSlotSchema>;

const orderItemInputSchema = z.object({
  serviceItemId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

/** "How would you like to order?" — the two paths from the client's brief. */
export const createOrderSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(OrderType.BY_WEIGHT),
    weightPackageId: z.string(),
    addressId: z.string(),
    pickup: timeSlotSchema,
    paymentMethod: z.nativeEnum(PaymentMethod),
    promoCode: z.string().trim().toUpperCase().optional(),
    specialInstructions: z.string().trim().max(500).optional(),
    useWalletCredit: z.boolean().default(false),
  }),
  z.object({
    type: z.literal(OrderType.BY_ITEM),
    items: z.array(orderItemInputSchema).min(1),
    addressId: z.string(),
    pickup: timeSlotSchema,
    paymentMethod: z.nativeEnum(PaymentMethod),
    promoCode: z.string().trim().toUpperCase().optional(),
    specialInstructions: z.string().trim().max(500).optional(),
    useWalletCredit: z.boolean().default(false),
  }),
]);
export type CreateOrderDto = z.infer<typeof createOrderSchema>;

/** Price breakdown as displayed at checkout: subtotal − discount + 15% VAT. All in halalas. */
export const priceBreakdownSchema = z.object({
  subtotal: moneySchema,
  discount: moneySchema,
  walletCreditUsed: moneySchema,
  vat: moneySchema,
  total: moneySchema,
});
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>;

export const orderSchema = z.object({
  id: z.string(),
  /** Human-friendly reference, e.g. CS-4821. */
  reference: z.string(),
  userId: z.string(),
  type: z.nativeEnum(OrderType),
  status: z.nativeEnum(OrderStatus),
  addressId: z.string(),
  pickup: timeSlotSchema,
  paymentMethod: z.nativeEnum(PaymentMethod),
  breakdown: priceBreakdownSchema,
  specialInstructions: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Order = z.infer<typeof orderSchema>;

export const cancelOrderSchema = z.object({
  reason: z.enum(['CHANGED_MIND', 'WRONG_TIME', 'PRICE', 'OTHER']),
  comment: z.string().trim().max(280).optional(),
});
export type CancelOrderDto = z.infer<typeof cancelOrderSchema>;

export const rateOrderSchema = z.object({
  stars: z.number().int().min(1).max(5),
  compliments: z.array(z.string()).max(6).default([]),
  comment: z.string().trim().max(500).optional(),
});
export type RateOrderDto = z.infer<typeof rateOrderSchema>;
