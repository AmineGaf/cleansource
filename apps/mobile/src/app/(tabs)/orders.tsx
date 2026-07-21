import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';

import { AppText, Button, PressableCard, Screen, StatusPill } from '@/components/ui';
import { useOrders } from '@/features/orders/api';
import { formatAmount, formatDate } from '@/lib/format';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: orders, isLoading, isRefetching, refetch } = useOrders();

  return (
    <Screen scroll={false}>
      <AppText variant="title2" className="pb-4 pt-2">
        {t('tabs.orders')}
      </AppText>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0e3b7b" />
        </View>
      ) : (
        <FlatList
          data={orders ?? []}
          keyExtractor={(order) => order.id}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3 pb-6"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }
          renderItem={({ item: order }) => (
            <PressableCard
              className="gap-3"
              onPress={() => router.push(`/order/${order.id}`)}
            >
              <View className="flex-row items-center justify-between">
                <AppText variant="subhead">{order.reference}</AppText>
                <StatusPill status={order.status} />
              </View>
              <View className="flex-row items-center justify-between">
                <AppText variant="footnote">
                  {t(`order.${order.type === 'BY_WEIGHT' ? 'byWeight' : 'byItem'}`)}
                  {order.type === 'BY_ITEM'
                    ? ` · ${t('orders.itemsCount', { count: order.itemsCount })}`
                    : ''}
                </AppText>
                <AppText variant="footnote">{formatDate(order.createdAt)}</AppText>
              </View>
              <AppText variant="subhead" className="text-navy">
                {formatAmount(order.total)} {t('common.sar')}
              </AppText>
            </PressableCard>
          )}
          ListEmptyComponent={
            <View className="items-center gap-4 pt-24">
              <AppText variant="title3">{t('orders.emptyTitle')}</AppText>
              <AppText variant="body" muted className="text-center">
                {t('orders.emptySubtitle')}
              </AppText>
              <Link href="/order/new" asChild>
                <Button label={t('home.newOrder')} className="mt-2 self-center px-10" />
              </Link>
            </View>
          }
        />
      )}
    </Screen>
  );
}
