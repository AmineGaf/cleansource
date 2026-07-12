import { saudiPhoneSchema } from '@cleansource/contracts';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import { authApi } from '@/features/auth/api';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string>();

  const requestOtp = useMutation({
    mutationFn: authApi.requestOtp,
    onSuccess: (_, normalizedPhone) => {
      router.push({ pathname: '/(auth)/otp', params: { phone: normalizedPhone } });
    },
    onError: () => setError(t('auth.genericError')),
  });

  const handleSubmit = () => {
    const result = saudiPhoneSchema.safeParse(phone);
    if (!result.success) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setError(undefined);
    requestOtp.mutate(result.data);
  };

  return (
    <Screen scroll={false} className="justify-center gap-6">
      <View className="gap-2">
        <AppText variant="title1">{t('auth.phoneTitle')}</AppText>
        <AppText variant="body" muted>
          {t('auth.phoneSubtitle')}
        </AppText>
      </View>

      <Input
        keyboardType="phone-pad"
        placeholder={t('auth.phonePlaceholder')}
        value={phone}
        onChangeText={setPhone}
        error={error}
        autoFocus
        onSubmitEditing={handleSubmit}
      />

      <Button label={t('auth.sendCode')} onPress={handleSubmit} loading={requestOtp.isPending} />
    </Screen>
  );
}
