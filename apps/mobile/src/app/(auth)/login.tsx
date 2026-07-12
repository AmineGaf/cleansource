import { saudiPhoneSchema } from '@cleansource/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    const result = saudiPhoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    // TODO: request OTP via the API, then:
    router.push({ pathname: '/(auth)/otp', params: { phone: result.data } });
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
      />

      <Button label={t('auth.sendCode')} onPress={handleSubmit} />
    </Screen>
  );
}
