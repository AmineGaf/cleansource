import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, Button, Card, PressableCard, Screen } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';

const SERVICES = ['washAndFold', 'dryClean', 'ironing'] as const;

export default function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <Screen className="gap-5">
      {/* Greeting */}
      <View className="pt-2">
        <AppText variant="title2">{t('home.greeting', { name: user?.fullName ?? '—' })}</AppText>
      </View>

      {/* First-order promo banner (navy, per the design) */}
      <Card className="border-0 bg-primary p-5">
        <AppText variant="title3" className="text-white">
          {t('home.promoTitle')}
        </AppText>
        <AppText variant="footnote" className="mt-1 text-baby">
          {t('home.promoSubtitle')}
        </AppText>
        <Link href="/order/new" asChild>
          <Button label={t('home.newOrder')} variant="secondary" className="mt-4 h-11 self-start" />
        </Link>
      </Card>

      {/* Services */}
      <View className="flex-row items-center justify-between">
        <AppText variant="subhead">{t('home.ourServices')}</AppText>
        <AppText variant="footnote" className="text-navy">
          {t('home.priceList')}
        </AppText>
      </View>

      <View className="flex-row gap-3">
        {SERVICES.map((service) => (
          <PressableCard key={service} className="flex-1 items-center gap-2 py-5">
            <View className="h-12 w-12 rounded-md bg-primary-soft" />
            <AppText variant="footnote" className="text-ink">
              {t(`services.${service}`)}
            </AppText>
          </PressableCard>
        ))}
      </View>
    </Screen>
  );
}
