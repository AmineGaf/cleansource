import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from './text';

interface Props {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  error?: boolean;
}

/**
 * OTP boxes from the design — one box per digit, driven by a single hidden
 * input so paste, autofill (SMS one-time-code) and backspace all just work.
 */
export function OtpInput({ length = 4, value, onChange, error }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.split('');
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      {/* Boxes always render LTR: codes read left-to-right even in Arabic UI. */}
      <View style={{ flexDirection: 'row' }} className="justify-center gap-3">
        {Array.from({ length }).map((_, index) => {
          const isActive = focused && index === activeIndex && value.length < length;
          return (
            <View
              key={index}
              className={`h-16 w-14 items-center justify-center rounded-md border-2 bg-fill ${
                error ? 'border-danger' : isActive ? 'border-primary' : 'border-line'
              }`}
            >
              <AppText variant="title2" className="tabular-nums">
                {digits[index] ?? ''}
              </AppText>
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute h-px w-px opacity-0"
      />
    </Pressable>
  );
}
