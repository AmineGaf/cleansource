import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { I18nManager, Pressable, View } from 'react-native';

import { colors } from '@cleansource/tokens';

import { IconTile } from './icon-tile';
import { AppText } from './text';

interface Props {
  icon?: LucideIcon;
  label: string;
  /** Secondary text under the label. */
  sublabel?: string;
  /** Right-aligned value (balance, plan name…). */
  value?: string;
  trailing?: ReactNode;
  chevron?: boolean;
  danger?: boolean;
  onPress?: () => void;
  className?: string;
}

/** Account/settings row: icon tile · label · value · chevron (RTL-aware). */
export function ListRow({
  icon,
  label,
  sublabel,
  value,
  trailing,
  chevron = true,
  danger,
  onPress,
  className = '',
}: Props) {
  const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`flex-row items-center gap-3 py-3 active:opacity-70 ${className}`}
    >
      {icon ? <IconTile icon={icon} size="sm" /> : null}
      <View className="flex-1">
        <AppText variant="callout" className={danger ? 'text-danger' : 'text-ink'}>
          {label}
        </AppText>
        {sublabel ? <AppText variant="caption">{sublabel}</AppText> : null}
      </View>
      {value ? <AppText variant="footnote">{value}</AppText> : null}
      {trailing}
      {chevron && onPress ? <Chevron size={18} color={colors.textFaint} /> : null}
    </Pressable>
  );
}
