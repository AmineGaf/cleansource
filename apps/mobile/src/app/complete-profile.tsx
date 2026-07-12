import { completeProfileSchema } from '@cleansource/contracts';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';

/** New users land here right after OTP — one quick step, then into the app. */
export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  const save = useMutation({
    mutationFn: authApi.completeProfile,
    onSuccess: (user) => {
      setUser(user);
      router.replace('/(tabs)');
    },
    onError: () => setError(t('auth.genericError')),
  });

  const handleSubmit = () => {
    const result = completeProfileSchema.safeParse({
      fullName,
      email: email.trim() === '' ? undefined : email,
    });
    if (!result.success) {
      setError(t('auth.invalidProfile'));
      return;
    }
    setError(undefined);
    save.mutate(result.data);
  };

  return (
    <Screen scroll={false} className="justify-center gap-6">
      <View className="gap-2">
        <AppText variant="title1">{t('auth.profileTitle')}</AppText>
        <AppText variant="body" muted>
          {t('auth.profileSubtitle')}
        </AppText>
      </View>

      <Input
        placeholder={t('auth.fullName')}
        value={fullName}
        onChangeText={setFullName}
        autoFocus
      />
      <Input
        placeholder={t('auth.emailOptional')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
      />

      <Button label={t('common.continue')} onPress={handleSubmit} loading={save.isPending} />
    </Screen>
  );
}
