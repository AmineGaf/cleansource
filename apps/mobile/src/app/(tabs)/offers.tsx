import { useTranslation } from 'react-i18next';

import { AppText, Screen } from '@/components/ui';

export default function OffersScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <AppText variant="title2" className="pt-2">
        {t('tabs.offers')}
      </AppText>
    </Screen>
  );
}
