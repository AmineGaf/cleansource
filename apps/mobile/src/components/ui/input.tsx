import { TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './text';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

/** Text input — soft fill, 12px radius, navy focus ring (design system). */
export function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <View className="gap-2">
      {label ? <AppText variant="footnote">{label}</AppText> : null}
      <TextInput
        className={`h-[52px] rounded-md border border-line bg-fill px-4 font-sans text-[15px] text-ink focus:border-navy ${
          error ? 'border-danger' : ''
        } ${className}`}
        placeholderTextColor="#92a8ce"
        {...rest}
      />
      {error ? (
        <AppText variant="caption" className="text-danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
