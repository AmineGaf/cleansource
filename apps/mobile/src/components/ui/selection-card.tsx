import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from './text';

interface Props {
  title: string;
  description?: string;
  /** Right-side slot (price, logo, radio…). */
  trailing?: ReactNode;
  /** Leading slot (icon tile). */
  leading?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

/**
 * Radio-style selection card — order-type chooser, weight packages,
 * payment methods, addresses. Selected = navy border + check, per the design.
 */
export function SelectionCard({
  title,
  description,
  trailing,
  leading,
  selected,
  onPress,
  className = '',
}: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-lg border-2 bg-card p-4 ${
        selected ? 'border-primary' : 'border-line active:bg-fill'
      } ${className}`}
    >
      {leading}
      <View className="flex-1 gap-0.5">
        <AppText variant="subhead">{title}</AppText>
        {description ? <AppText variant="footnote">{description}</AppText> : null}
      </View>
      {trailing}
      {selected ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Check size={14} color="#ffffff" strokeWidth={3} />
        </View>
      ) : (
        <View className="h-6 w-6 rounded-full border-2 border-line" />
      )}
    </Pressable>
  );
}
