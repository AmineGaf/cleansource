import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

/** Soft white card — 16px radius, hairline border, gentle shadow (design system). */
export function Card({ className = '', ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-lg border border-line bg-card p-4 shadow-sm shadow-navy/10 ${className}`}
      {...rest}
    />
  );
}

/** Tappable variant with a pressed state. */
export function PressableCard({ className = '', ...rest }: PressableProps & { className?: string }) {
  return (
    <Pressable
      className={`rounded-lg border border-line bg-card p-4 shadow-sm shadow-navy/10 active:bg-fill ${className}`}
      {...rest}
    />
  );
}
