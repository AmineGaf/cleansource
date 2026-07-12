import { ScrollView, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props extends ViewProps {
  /** Scrollable content (default) or a fixed layout. */
  scroll?: boolean;
  className?: string;
}

/** Screen wrapper — surface background + safe-area padding, per the design's page chrome. */
export function Screen({ scroll = true, className = '', children, ...rest }: Props) {
  const insets = useSafeAreaInsets();

  if (!scroll) {
    return (
      <View
        className={`flex-1 bg-surface px-5 ${className}`}
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
        {...rest}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
      contentContainerClassName={`px-5 ${className}`}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
