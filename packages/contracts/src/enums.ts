/** Domain enums — shared verbatim by the API (Prisma) and the mobile app. */

export const OrderType = {
  BY_WEIGHT: 'BY_WEIGHT',
  BY_ITEM: 'BY_ITEM',
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

/** The tracking timeline from the design: placed → picked up → in progress → out for delivery → delivered. */
export const OrderStatus = {
  PLACED: 'PLACED',
  PICKED_UP: 'PICKED_UP',
  IN_PROGRESS: 'IN_PROGRESS',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/** mada first — the KSA default. */
export const PaymentMethod = {
  MADA: 'MADA',
  STC_PAY: 'STC_PAY',
  APPLE_PAY: 'APPLE_PAY',
  GOOGLE_PAY: 'GOOGLE_PAY',
  CARD: 'CARD',
  CASH_ON_PICKUP: 'CASH_ON_PICKUP',
  WALLET: 'WALLET',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const AddressLabel = {
  HOME: 'HOME',
  WORK: 'WORK',
  OTHER: 'OTHER',
} as const;
export type AddressLabel = (typeof AddressLabel)[keyof typeof AddressLabel];

export const ServiceCode = {
  WASH_AND_FOLD: 'WASH_AND_FOLD',
  DRY_CLEAN: 'DRY_CLEAN',
  IRONING: 'IRONING',
  CARPET: 'CARPET',
} as const;
export type ServiceCode = (typeof ServiceCode)[keyof typeof ServiceCode];

export const SubscriptionFrequency = {
  WEEKLY: 'WEEKLY',
  BI_WEEKLY: 'BI_WEEKLY',
} as const;
export type SubscriptionFrequency =
  (typeof SubscriptionFrequency)[keyof typeof SubscriptionFrequency];

/** Statuses in which the customer may still cancel (per the design: only before pickup). */
export const CANCELLABLE_STATUSES: readonly OrderStatus[] = [OrderStatus.PLACED];
