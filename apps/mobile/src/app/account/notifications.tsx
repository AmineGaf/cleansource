import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { AppText, Card, Screen } from '@/components/ui';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/api';
import { formatDate } from '@/lib/format';

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <Screen scroll={false}>
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <AppText variant="title2">{t('notifications.title')}</AppText>
        {(data?.unreadCount ?? 0) > 0 && (
          <Pressable onPress={() => markAllRead.mutate()}>
            <AppText variant="footnote" className="text-navy">
              {t('notifications.markAllRead')}
            </AppText>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0e3b7b" />
        </View>
      ) : (
        <FlatList
          data={data?.notifications ?? []}
          keyExtractor={(notification) => notification.id}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3 pb-6"
          renderItem={({ item: notification }) => (
            <Pressable
              onPress={() =>
                !notification.readAt && markRead.mutate(notification.id)
              }
            >
              <Card className={notification.readAt ? '' : 'border-baby bg-primary-soft'}>
                <AppText variant="subhead">{notification.title[lang]}</AppText>
                <AppText variant="body" muted className="mt-1">
                  {notification.body[lang]}
                </AppText>
                <AppText variant="caption" className="mt-2">
                  {formatDate(notification.createdAt)}
                </AppText>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <AppText variant="body" muted className="pt-24 text-center">
              {t('notifications.empty')}
            </AppText>
          }
        />
      )}
    </Screen>
  );
}
