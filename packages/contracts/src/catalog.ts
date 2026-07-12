import { z } from 'zod';
import { moneySchema } from './common';
import { ServiceCode } from './enums';

/** Localized copy is delivered in both languages; the app picks by locale. */
export const localizedTextSchema = z.object({
  ar: z.string(),
  en: z.string(),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const serviceSchema = z.object({
  id: z.string(),
  code: z.nativeEnum(ServiceCode),
  name: localizedTextSchema,
  description: localizedTextSchema,
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});
export type Service = z.infer<typeof serviceSchema>;

export const serviceItemSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  name: localizedTextSchema,
  /** Price per piece, in halalas. */
  price: moneySchema,
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});
export type ServiceItem = z.infer<typeof serviceItemSchema>;

/** The two weight packages from the client's brief: 6 kg / 49 SAR and 12 kg / 89 SAR. */
export const weightPackageSchema = z.object({
  id: z.string(),
  kg: z.number().int().positive(),
  name: localizedTextSchema,
  description: localizedTextSchema,
  price: moneySchema,
  isActive: z.boolean(),
});
export type WeightPackage = z.infer<typeof weightPackageSchema>;

export const catalogResponseSchema = z.object({
  services: z.array(serviceSchema),
  items: z.array(serviceItemSchema),
  weightPackages: z.array(weightPackageSchema),
});
export type CatalogResponse = z.infer<typeof catalogResponseSchema>;
