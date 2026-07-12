import type { OrderStatus } from '@cleansource/contracts';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from './text';

const styles: Record<OrderStatus, { container: string; label: string }> = {
  PLACED: { container: 'bg-primary-soft', label: 'text-navy' },
  PICKED_UP: { container: 'bg-success-soft', label: 'text-success' },
  IN_PROGRESS: { container: 'bg-warning-soft', label: 'text-warning-dark' },
  OUT_FOR_DELIVERY: { container: 'bg-primary-soft', label: 'text-navy' },
  DELIVERED: { container: 'bg-success-soft', label: 'text-success' },
  CANCELLED: { container: 'bg-danger-soft', label: 'text-danger' },
};

/** Order status pill — colors match the design's status system exactly. */
export function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const style = styles[status];

  return (
    <View className={`self-start rounded-full px-3 py-1 ${style.container}`}>
      <AppText variant="caption" className={style.label}>
        {t(`status.${status}`)}
      </AppText>
    </View>
  );
}
