import { Check, Home, Package, Truck, WashingMachine } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { OrderStatus } from '@cleansource/contracts';
import { colors } from '@cleansource/tokens';

import { AppText } from './text';

const STEPS = [
  { status: OrderStatus.PLACED, icon: Check },
  { status: OrderStatus.PICKED_UP, icon: Package },
  { status: OrderStatus.IN_PROGRESS, icon: WashingMachine },
  { status: OrderStatus.OUT_FOR_DELIVERY, icon: Truck },
  { status: OrderStatus.DELIVERED, icon: Home },
] as const;

interface Props {
  current: OrderStatus;
  /** Optional label under each step (e.g. the timestamp). */
  timestamps?: Partial<Record<OrderStatus, string>>;
}

/**
 * The live-tracking status timeline from the design:
 * done = green, current = navy, upcoming = faint. RTL-aware by inheritance.
 */
export function Timeline({ current, timestamps = {} }: Props) {
  const { t } = useTranslation();
  const currentIndex = STEPS.findIndex((step) => step.status === current);

  return (
    <View className="gap-0">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = isDone ? Check : step.icon;
        const circleClass = isDone ? 'bg-success' : isCurrent ? 'bg-primary' : 'bg-fill';
        const iconColor = isDone || isCurrent ? '#ffffff' : colors.textFaint;

        return (
          <View key={step.status} className="flex-row gap-3">
            {/* rail */}
            <View className="items-center">
              <View className={`h-10 w-10 items-center justify-center rounded-full ${circleClass}`}>
                <Icon size={18} color={iconColor} strokeWidth={2.4} />
              </View>
              {index < STEPS.length - 1 ? (
                <View className={`w-[3px] flex-1 ${isDone ? 'bg-success' : 'bg-line'}`} />
              ) : null}
            </View>
            {/* copy */}
            <View className={`flex-1 gap-0.5 ${index < STEPS.length - 1 ? 'pb-6' : ''}`}>
              <AppText
                variant="callout"
                className={isCurrent ? 'text-navy font-semibold' : isDone ? 'text-ink' : 'text-faint'}
              >
                {t(`status.${step.status}`)}
              </AppText>
              {timestamps[step.status] ? (
                <AppText variant="caption">{timestamps[step.status]}</AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
