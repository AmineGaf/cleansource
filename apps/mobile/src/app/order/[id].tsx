import { OrderStatus, type CancelOrderDto } from '@cleansource/contracts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { AppText, Button, Card, Input, Screen, StatusPill } from '@/components/ui';
import { useCancelOrder, useOrder, useRateOrder } from '@/features/orders/api';
import { formatAmount, formatDate, formatTime } from '@/lib/format';

/** The tracking timeline from the design (cancelled orders show their own row). */
const TIMELINE: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.PICKED_UP,
  OrderStatus.IN_PROGRESS,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

export default function OrderDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading || !order) {
    return (
      <Screen scroll={false} className="items-center justify-center">
        <ActivityIndicator color="#0e3b7b" />
      </Screen>
    );
  }

  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <Screen className="gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-2">
        <View>
          <AppText variant="title2">{order.reference}</AppText>
          <AppText variant="footnote">{formatDate(order.createdAt)}</AppText>
        </View>
        <StatusPill status={order.status} />
      </View>

      {/* Tracking timeline */}
      {order.status !== OrderStatus.CANCELLED && (
        <Card className="gap-0">
          {TIMELINE.map((status, index) => {
            const event = order.statusEvents.find((e) => e.status === status);
            const reached = Boolean(event);
            return (
              <View key={status} className="flex-row gap-3">
                <View className="items-center">
                  <View
                    className={`h-4 w-4 rounded-full ${reached ? 'bg-primary' : 'bg-line'}`}
                  />
                  {index < TIMELINE.length - 1 && (
                    <View className={`w-0.5 flex-1 ${reached ? 'bg-primary' : 'bg-line'}`} />
                  )}
                </View>
                <View className="flex-1 pb-5">
                  <AppText variant="subhead" className={reached ? '' : 'text-faint'}>
                    {t(`status.${status}`)}
                  </AppText>
                  {event && (
                    <AppText variant="caption">
                      {formatDate(event.createdAt)} · {formatTime(event.createdAt)}
                    </AppText>
                  )}
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {/* Driver */}
      {order.driver && (
        <Card className="flex-row items-center justify-between">
          <View>
            <AppText variant="subhead">{order.driver.name}</AppText>
            <AppText variant="footnote">
              {t('orderDetail.driver')} · ★ {order.driver.rating.toFixed(1)}
            </AppText>
          </View>
          <AppText variant="footnote" className="text-navy">
            {order.driver.phone}
          </AppText>
        </Card>
      )}

      {/* Pickup + address */}
      <Card className="gap-2">
        <AppText variant="subhead">{t('orderDetail.pickup')}</AppText>
        <AppText variant="body">
          {formatDate(order.pickup.date)} · {order.pickup.code}
        </AppText>
        <AppText variant="footnote">
          {t(`addresses.labels.${order.address.label}`)} — {order.address.street}
        </AppText>
      </Card>

      {/* Items */}
      {order.items.length > 0 && (
        <Card className="gap-3">
          <AppText variant="subhead">{t('orderDetail.items')}</AppText>
          {order.items.map((item) => (
            <View key={item.id} className="flex-row items-center justify-between">
              <AppText variant="body">
                {item.name[lang]} × {item.quantity}
              </AppText>
              <AppText variant="body">
                {formatAmount(item.unitPrice * item.quantity)} {t('common.sar')}
              </AppText>
            </View>
          ))}
        </Card>
      )}

      {/* Price breakdown */}
      <Card className="gap-2">
        <BreakdownRow label={t('orderDetail.subtotal')} amount={order.breakdown.subtotal} />
        {order.breakdown.discount > 0 && (
          <BreakdownRow label={t('orderDetail.discount')} amount={-order.breakdown.discount} />
        )}
        {order.breakdown.walletCreditUsed > 0 && (
          <BreakdownRow
            label={t('orderDetail.walletCredit')}
            amount={-order.breakdown.walletCreditUsed}
          />
        )}
        <BreakdownRow label={t('orderDetail.vat')} amount={order.breakdown.vat} />
        <View className="my-1 h-px bg-line" />
        <View className="flex-row items-center justify-between">
          <AppText variant="subhead">{t('orderDetail.total')}</AppText>
          <AppText variant="subhead" className="text-navy">
            {formatAmount(order.breakdown.total)} {t('common.sar')}
          </AppText>
        </View>
      </Card>

      {order.status === OrderStatus.PLACED && <CancelSection orderId={order.id} />}
      {order.status === OrderStatus.DELIVERED && !order.rating && (
        <RateSection orderId={order.id} />
      )}
      {order.rating && (
        <Card className="gap-1">
          <AppText variant="subhead">{t('orderDetail.yourRating')}</AppText>
          <AppText variant="title3" className="text-warning-dark">
            {'★'.repeat(order.rating.stars)}
            {'☆'.repeat(5 - order.rating.stars)}
          </AppText>
          {order.rating.comment && <AppText variant="footnote">{order.rating.comment}</AppText>}
        </Card>
      )}
    </Screen>
  );
}

function BreakdownRow({ label, amount }: { label: string; amount: number }) {
  const { t } = useTranslation();
  const negative = amount < 0;
  return (
    <View className="flex-row items-center justify-between">
      <AppText variant="body" muted>
        {label}
      </AppText>
      <AppText variant="body" className={negative ? 'text-success' : ''}>
        {negative ? '−' : ''}
        {formatAmount(Math.abs(amount))} {t('common.sar')}
      </AppText>
    </View>
  );
}

function CancelSection({ orderId }: { orderId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cancelOrder = useCancelOrder(orderId);

  const confirmCancel = () => {
    Alert.alert(t('orderDetail.cancelTitle'), t('orderDetail.cancelMessage'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('orderDetail.cancelConfirm'),
        style: 'destructive',
        onPress: () => {
          const dto: CancelOrderDto = { reason: 'CHANGED_MIND' };
          cancelOrder.mutate(dto, { onSuccess: () => router.back() });
        },
      },
    ]);
  };

  return (
    <Button
      label={t('orderDetail.cancelOrder')}
      variant="danger"
      loading={cancelOrder.isPending}
      onPress={confirmCancel}
    />
  );
}

function RateSection({ orderId }: { orderId: string }) {
  const { t } = useTranslation();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const rateOrder = useRateOrder(orderId);

  return (
    <Card className="gap-3">
      <AppText variant="subhead">{t('orderDetail.rateTitle')}</AppText>
      <View className="flex-row justify-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setStars(value)} hitSlop={8}>
            <AppText variant="hero" className={value <= stars ? 'text-warning-dark' : 'text-faint'}>
              {value <= stars ? '★' : '☆'}
            </AppText>
          </Pressable>
        ))}
      </View>
      <Input
        placeholder={t('orderDetail.ratePlaceholder')}
        value={comment}
        onChangeText={setComment}
      />
      <Button
        label={t('orderDetail.rateSubmit')}
        disabled={stars === 0}
        loading={rateOrder.isPending}
        onPress={() =>
          rateOrder.mutate({
            stars,
            compliments: [],
            comment: comment.trim() || undefined,
          })
        }
      />
    </Card>
  );
}
