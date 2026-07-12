import { View } from 'react-native';

import { AppText } from './text';

/** Small count badge (cart items, unread notifications). */
export function Badge({ count, className = '' }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <View
      className={`h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 ${className}`}
    >
      <AppText variant="caption" className="text-white">
        {count > 99 ? '99+' : count}
      </AppText>
    </View>
  );
}
