import { Pressable } from 'react-native';

import { AppText } from './text';

interface Props {
  label: string;
  /** Optional second line (e.g. day number under the weekday). */
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

/**
 * Selectable chip — day/time-slot picker, compliment chips, filters.
 * Selected = navy fill with white text, exactly as in the design.
 */
export function Chip({ label, sublabel, selected, disabled, onPress, className = '' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-md border px-4 py-2.5 ${
        selected ? 'border-primary bg-primary' : 'border-line bg-card active:bg-fill'
      } ${disabled ? 'opacity-40' : ''} ${className}`}
    >
      <AppText variant="footnote" className={selected ? 'text-white' : 'text-ink'}>
        {label}
      </AppText>
      {sublabel ? (
        <AppText variant="caption" className={selected ? 'text-baby' : 'text-faint'}>
          {sublabel}
        </AppText>
      ) : null}
    </Pressable>
  );
}
