import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';

export default function OtpScreen() {
  const { t } = useTranslation();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  return (
    <Screen scroll={false} className="justify-center gap-6">
      <View className="gap-2">
        <AppText variant="title1">{t('auth.otpTitle')}</AppText>
        <AppText variant="body" muted>
          {t('auth.otpSubtitle', { phone })}
        </AppText>
      </View>

      <Input keyboardType="number-pad" maxLength={4} className="text-center text-[24px]" autoFocus />

      {/* TODO: verify via the API, store tokens, route to (tabs) */}
      <Button label={t('common.confirm')} />
    </Screen>
  );
}
