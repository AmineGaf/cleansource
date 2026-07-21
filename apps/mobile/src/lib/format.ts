import { toSar } from '@cleansource/contracts';

import i18n from './i18n';

/** 4900 halalas → "49" / 4950 → "49.50" (currency label is added by the caller). */
export function formatAmount(halalas: number): string {
  const sar = toSar(halalas);
  return Number.isInteger(sar) ? String(sar) : sar.toFixed(2);
}

/** Localized short date — always Gregorian, matching the design. */
export function formatDate(iso: string): string {
  const locale = i18n.language === 'ar' ? 'ar-u-ca-gregory' : 'en-GB';
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  const locale = i18n.language === 'ar' ? 'ar-u-ca-gregory' : 'en-GB';
  return new Date(iso).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
