import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { colors } from '@cleansource/tokens';

import { useAuthStore } from '@/features/auth/store';

export default function TabsLayout() {
  const { t } = useTranslation();
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') return null;
  if (status === 'guest') return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: 'IBMPlexSansArabic_600SemiBold', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="orders" options={{ title: t('tabs.orders') }} />
      <Tabs.Screen name="offers" options={{ title: t('tabs.offers') }} />
      <Tabs.Screen name="account" options={{ title: t('tabs.account') }} />
    </Tabs>
  );
}
