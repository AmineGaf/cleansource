import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText, Button, OtpInput, Screen } from '@/components/ui';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';

const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const signIn = useAuthStore((state) => state.signIn);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const verify = useMutation({
    mutationFn: (otpCode: string) => authApi.verifyOtp(phone!, otpCode),
    onSuccess: async (response) => {
      await signIn(response.user, response);
      // Protected routes flip automatically; new users finish their profile first.
      router.replace(response.isNewUser ? '/complete-profile' : '/(tabs)');
    },
    onError: () => setError(t('auth.invalidCode')),
  });

  const resend = useMutation({
    mutationFn: () => authApi.requestOtp(phone!),
    onSuccess: () => setSecondsLeft(RESEND_SECONDS),
  });

  const handleChange = (value: string) => {
    setCode(value);
    setError(undefined);
    if (value.length === 4 && !verify.isPending) verify.mutate(value);
  };

  return (
    <Screen scroll={false} className="justify-center gap-6">
      <View className="gap-2">
        <AppText variant="title1">{t('auth.otpTitle')}</AppText>
        <AppText variant="body" muted>
          {t('auth.otpSubtitle', { phone })}
        </AppText>
      </View>

      <View className="gap-2">
        <OtpInput value={code} onChange={handleChange} error={!!error} />
        {error ? (
          <AppText variant="caption" className="text-center text-danger">
            {error}
          </AppText>
        ) : null}
      </View>

      <Button
        label={t('common.confirm')}
        onPress={() => verify.mutate(code)}
        loading={verify.isPending}
        disabled={code.length !== 4}
      />

      {secondsLeft > 0 ? (
        <AppText variant="footnote" className="text-center">
          {t('auth.resendIn', { seconds: secondsLeft })}
        </AppText>
      ) : (
        <Pressable onPress={() => resend.mutate()} disabled={resend.isPending}>
          <AppText variant="footnote" className="text-center text-navy">
            {t('auth.resend')}
          </AppText>
        </Pressable>
      )}
    </Screen>
  );
}
