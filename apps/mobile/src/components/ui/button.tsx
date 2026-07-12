import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { AppText } from './text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const containerClasses: Record<Variant, string> = {
  primary: 'bg-primary active:bg-primary-pressed',
  secondary: 'bg-primary-soft border border-baby',
  ghost: 'bg-transparent',
  danger: 'bg-danger-soft',
};

const labelClasses: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-navy',
  ghost: 'text-navy',
  danger: 'text-danger',
};

interface Props extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  className?: string;
}

/** Primary CTA — full-width navy pill-ish button, per the design (radius lg, 52px tall). */
export function Button({ label, variant = 'primary', loading, disabled, className = '', ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`h-[52px] flex-row items-center justify-center rounded-lg px-6 ${containerClasses[variant]} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#0e3b7b'} />
      ) : (
        <AppText variant="subhead" className={labelClasses[variant]}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
