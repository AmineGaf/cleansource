import { Image, View } from 'react-native';

import { Button } from './button';
import { AppText } from './text';

interface Props {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Empty state with the faded iron illustration, per the design's empty screens. */
export function EmptyState({ title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <Image
        source={require('../../../assets/images/brand/iron-baby.png')}
        style={{ width: 96, height: 96, opacity: 0.7 }}
        resizeMode="contain"
      />
      <View className="items-center gap-1.5">
        <AppText variant="title3" className="text-center">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="footnote" className="text-center">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} className="mt-2 h-11 self-center px-8" />
      ) : null}
    </View>
  );
}
