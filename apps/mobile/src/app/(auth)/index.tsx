import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, Button, Screen } from '@/components/ui';

/** Welcome — the guest entry point (brand hero + get started). */
export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen scroll={false} className="justify-between pb-6 pt-16">
      <View className="items-center gap-6 pt-24">
        <View className="h-24 w-24 items-center justify-center rounded-sheet bg-primary shadow-lg shadow-navy/30">
          <AppText variant="hero" className="text-white">
            CS
          </AppText>
        </View>
        <View className="items-center gap-2 px-6">
          <AppText variant="title1" className="text-center">
            {t('auth.welcomeTitle')}
          </AppText>
          <AppText variant="body" muted className="text-center">
            {t('auth.welcomeSubtitle')}
          </AppText>
        </View>
      </View>

      <Link href="/(auth)/login" asChild>
        <Button label={t('auth.getStarted')} />
      </Link>
    </Screen>
  );
}
