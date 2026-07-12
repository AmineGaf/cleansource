import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';

export default function AccountScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <Screen className="gap-5">
      <AppText variant="title2" className="pt-2">
        {t('tabs.account')}
      </AppText>

      <Card className="flex-row items-center gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
          <AppText variant="title3" className="text-navy">
            {user?.fullName?.charAt(0) ?? '·'}
          </AppText>
        </View>
        <View className="flex-1">
          <AppText variant="subhead">{user?.fullName ?? '—'}</AppText>
          <AppText variant="footnote">{user?.phone}</AppText>
        </View>
      </Card>

      <Button label={t('auth.signOut')} variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}
