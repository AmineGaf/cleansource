import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors } from '@cleansource/tokens';

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, { box: string; icon: number }> = {
  sm: { box: 'h-9 w-9 rounded-sm', icon: 18 },
  md: { box: 'h-12 w-12 rounded-md', icon: 22 },
  lg: { box: 'h-14 w-14 rounded-lg', icon: 26 },
};

interface Props {
  icon: LucideIcon;
  size?: Size;
  /** navy icon on soft fill (default) or white icon on navy. */
  tone?: 'soft' | 'solid';
  className?: string;
}

/** The rounded icon square used across the design (services grid, rows, banners). */
export function IconTile({ icon: Icon, size = 'md', tone = 'soft', className = '' }: Props) {
  const { box, icon } = sizes[size];
  return (
    <View
      className={`items-center justify-center ${box} ${tone === 'solid' ? 'bg-primary' : 'bg-primary-soft'} ${className}`}
    >
      <Icon size={icon} color={tone === 'solid' ? '#ffffff' : colors.primary} strokeWidth={2} />
    </View>
  );
}
