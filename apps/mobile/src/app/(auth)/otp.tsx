import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import { useRequestOtp, useVerifyOtp } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { ApiError } from '@/lib/api';

const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const signIn = useAuthStore((state) => state.signIn);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const verifyOtp = useVerifyOtp();
  const resendOtp = useRequestOtp();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = () => {
    if (!phone || code.length !== 4) return;
    setError(undefined);
    verifyOtp.mutate(
      { phone, code },
      {
        onSuccess: async (auth) => {
          await signIn(auth.user, auth);
          router.replace('/(tabs)');
        },
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : t('errors.network')),
      },
    );
  };

  const handleResend = () => {
    if (!phone || secondsLeft > 0) return;
    resendOtp.mutate(phone, { onSuccess: () => setSecondsLeft(RESEND_SECONDS) });
  };

  return (
    <Screen scroll={false} className="justify-center gap-6">
      <View className="gap-2">
        <AppText variant="title1">{t('auth.otpTitle')}</AppText>
        <AppText variant="body" muted>
          {t('auth.otpSubtitle', { phone })}
        </AppText>
      </View>

      <Input
        keyboardType="number-pad"
        maxLength={4}
        className="text-center text-[24px]"
        value={code}
        onChangeText={setCode}
        error={error}
        autoFocus
      />

      <Button
        label={t('common.confirm')}
        onPress={handleVerify}
        loading={verifyOtp.isPending}
        disabled={code.length !== 4}
      />

      <Pressable onPress={handleResend} disabled={secondsLeft > 0}>
        <AppText variant="footnote" className="text-center">
          {secondsLeft > 0
            ? t('auth.resendIn', { seconds: secondsLeft })
            : t('auth.resend')}
        </AppText>
      </Pressable>
    </Screen>
  );
}
