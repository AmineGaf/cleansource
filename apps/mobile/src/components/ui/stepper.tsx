import { Pressable, View } from 'react-native';

import { AppText } from './text';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

/** Quantity stepper from the service-detail screen: − qty +, navy plus button. */
export function Stepper({ value, onChange, min = 0, max = 99 }: Props) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="decrease"
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        className={`h-9 w-9 items-center justify-center rounded-md bg-fill ${value <= min ? 'opacity-40' : 'active:bg-line'}`}
      >
        <AppText variant="subhead" className="text-ink">
          −
        </AppText>
      </Pressable>

      <AppText variant="subhead" className="min-w-[24px] text-center tabular-nums">
        {value}
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="increase"
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        className="h-9 w-9 items-center justify-center rounded-md bg-primary active:bg-primary-pressed"
      >
        <AppText variant="subhead" className="text-white">
          +
        </AppText>
      </Pressable>
    </View>
  );
}
