import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { toSar } from '@cleansource/contracts';

import { AppText } from './text';

interface Props {
  label: string;
  /** halalas */
  amount: number;
  /** discounts render with a leading minus and success color */
  negative?: boolean;
  emphasized?: boolean;
}

/** Checkout breakdown line — label + amount in SAR, tabular digits, bidi-safe. */
export function PriceRow({ label, amount, negative, emphasized }: Props) {
  const { t } = useTranslation();
  const sar = toSar(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <View className="flex-row items-center justify-between py-1.5">
      <AppText variant={emphasized ? 'subhead' : 'body'} className={emphasized ? '' : 'text-muted'}>
        {label}
      </AppText>
      <AppText
        variant={emphasized ? 'subhead' : 'body'}
        className={`tabular-nums ${negative ? 'text-success' : ''}`}
      >
        {negative ? '−' : ''}
        {sar} {t('common.sar')}
      </AppText>
    </View>
  );
}
