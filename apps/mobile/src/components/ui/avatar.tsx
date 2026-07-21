import { View } from 'react-native';

import { AppText } from './text';

/** Initial-letter avatar circle (profile, driver card). */
export function Avatar({ name, size = 56 }: { name?: string | null; size?: number }) {
  return (
    <View
      className="items-center justify-center rounded-full bg-primary-soft"
      style={{ width: size, height: size }}
    >
      <AppText variant={size >= 56 ? 'title3' : 'subhead'} className="text-navy">
        {name?.trim().charAt(0) || '·'}
      </AppText>
    </View>
  );
}
