import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { AppText, Button, Card, PressableCard, Screen } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';

const MENU: { key: string; href: Href }[] = [
  { key: 'profile', href: '/account/profile' },
  { key: 'addresses', href: '/account/addresses' },
  { key: 'wallet', href: '/account/wallet' },
  { key: 'notifications', href: '/account/notifications' },
  { key: 'support', href: '/account/support' },
];

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const confirmSignOut = () => {
    Alert.alert(t('account.signOutTitle'), t('account.signOutMessage'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('account.signOut'),
        style: 'destructive',
        onPress: () => void signOut(),
      },
    ]);
  };

  return (
    <Screen className="gap-4">
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
          <AppText variant="subhead">{user?.fullName ?? t('account.guest')}</AppText>
          <AppText variant="footnote">{user?.phone ?? ''}</AppText>
        </View>
      </Card>

      <View className="gap-3">
        {MENU.map((item) => (
          <PressableCard
            key={item.key}
            className="flex-row items-center justify-between"
            onPress={() => router.push(item.href)}
          >
            <AppText variant="subhead">{t(`account.menu.${item.key}`)}</AppText>
            <AppText variant="subhead" className="text-faint">
              ›
            </AppText>
          </PressableCard>
        ))}
      </View>

      <Button label={t('account.signOut')} variant="danger" onPress={confirmSignOut} />
    </Screen>
  );
}
