import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, PressableCard, Screen } from '@/components/ui';

/** "How would you like to order?" — the two-path chooser from the client's brief. */
export default function NewOrderScreen() {
  const { t } = useTranslation();

  return (
    <Screen scroll={false} className="gap-6 pt-6">
      <View className="gap-2">
        <AppText variant="title1">{t('order.howToOrder')}</AppText>
        <AppText variant="body" muted>
          {t('order.howToOrderSubtitle')}
        </AppText>
      </View>

      <View className="gap-4">
        <PressableCard className="gap-2 p-5">
          <View className="h-12 w-12 rounded-md bg-primary-soft" />
          <AppText variant="title3">{t('order.byWeight')}</AppText>
          <AppText variant="footnote">{t('order.byWeightDescription')}</AppText>
        </PressableCard>

        <PressableCard className="gap-2 p-5">
          <View className="h-12 w-12 rounded-md bg-primary-soft" />
          <AppText variant="title3">{t('order.byItem')}</AppText>
          <AppText variant="footnote">{t('order.byItemDescription')}</AppText>
        </PressableCard>
      </View>
    </Screen>
  );
}
