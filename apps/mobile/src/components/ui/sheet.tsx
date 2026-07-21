import type { PropsWithChildren } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './text';

interface Props extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

/** Bottom sheet — rounded top, handle bar, dim backdrop (calendar, cancel-reason, etc.). */
export function Sheet({ visible, onClose, title, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-ink/40" onPress={onClose} accessibilityLabel="close" />
      <View
        className="rounded-t-sheet bg-card px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-line" />
        {title ? (
          <AppText variant="title3" className="mb-4">
            {title}
          </AppText>
        ) : null}
        {children}
      </View>
    </Modal>
  );
}
