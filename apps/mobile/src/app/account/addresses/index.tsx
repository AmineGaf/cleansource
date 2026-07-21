import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, View } from 'react-native';

import { AppText, Button, PressableCard, Screen } from '@/components/ui';
import { useAddresses, useDeleteAddress } from '@/features/addresses/api';
import { ApiError } from '@/lib/api';

export default function AddressesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: addresses, isLoading } = useAddresses();
  const deleteAddress = useDeleteAddress();

  const confirmDelete = (id: string) => {
    Alert.alert(t('addresses.deleteTitle'), t('addresses.deleteMessage'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('addresses.delete'),
        style: 'destructive',
        onPress: () =>
          deleteAddress.mutate(id, {
            onError: (error) =>
              Alert.alert(
                t('addresses.deleteTitle'),
                error instanceof ApiError && error.status === 409
                  ? t('addresses.deleteInUse')
                  : t('errors.network'),
              ),
          }),
      },
    ]);
  };

  return (
    <Screen scroll={false}>
      <AppText variant="title2" className="pb-4 pt-2">
        {t('addresses.title')}
      </AppText>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0e3b7b" />
        </View>
      ) : (
        <FlatList
          data={addresses ?? []}
          keyExtractor={(address) => address.id}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3 pb-6"
          renderItem={({ item: address }) => (
            <PressableCard
              className="gap-2"
              onPress={() =>
                router.push({ pathname: '/account/addresses/form', params: { id: address.id } })
              }
              onLongPress={() => confirmDelete(address.id)}
            >
              <View className="flex-row items-center justify-between">
                <AppText variant="subhead">
                  {t(`addresses.labels.${address.label}`)}
                </AppText>
                {address.isDefault && (
                  <View className="rounded-full bg-primary-soft px-3 py-1">
                    <AppText variant="caption" className="text-navy">
                      {t('addresses.default')}
                    </AppText>
                  </View>
                )}
              </View>
              <AppText variant="body" muted>
                {address.street}
                {address.building ? `, ${address.building}` : ''}
                {address.apartment ? `, ${address.apartment}` : ''}
              </AppText>
              <AppText variant="caption">{t('addresses.longPressHint')}</AppText>
            </PressableCard>
          )}
          ListEmptyComponent={
            <View className="items-center gap-2 pt-24">
              <AppText variant="title3">{t('addresses.emptyTitle')}</AppText>
              <AppText variant="body" muted className="text-center">
                {t('addresses.emptySubtitle')}
              </AppText>
            </View>
          }
        />
      )}

      <Button
        label={t('addresses.add')}
        className="mb-2"
        onPress={() => router.push('/account/addresses/form')}
      />
    </Screen>
  );
}
