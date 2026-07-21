import { AddressLabel } from '@cleansource/contracts';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Switch, View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
} from '@/features/addresses/api';

const LABELS = [AddressLabel.HOME, AddressLabel.WORK, AddressLabel.OTHER];

export default function AddressFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: addresses } = useAddresses();
  const editing = id ? addresses?.find((address) => address.id === id) : undefined;

  const [label, setLabel] = useState<AddressLabel>(AddressLabel.HOME);
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [apartment, setApartment] = useState('');
  const [driverNotes, setDriverNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!editing) return;
    setLabel(editing.label);
    setStreet(editing.street);
    setBuilding(editing.building ?? '');
    setApartment(editing.apartment ?? '');
    setDriverNotes(editing.driverNotes ?? '');
    setIsDefault(editing.isDefault);
    if (editing.latitude != null && editing.longitude != null) {
      setCoords({ latitude: editing.latitude, longitude: editing.longitude });
    }
  }, [editing]);

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const saving = createAddress.isPending || updateAddress.isPending;

  const captureLocation = async () => {
    setLocating(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        Alert.alert(t('addresses.locationDeniedTitle'), t('addresses.locationDeniedMessage'));
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      Alert.alert(t('errors.title'), t('errors.location'));
    } finally {
      setLocating(false);
    }
  };

  const handleSave = () => {
    if (street.trim().length < 3) {
      setError(t('addresses.streetRequired'));
      return;
    }
    setError(undefined);

    const dto = {
      label,
      street: street.trim(),
      building: building.trim() || undefined,
      apartment: apartment.trim() || undefined,
      driverNotes: driverNotes.trim() || undefined,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      isDefault,
    };

    const options = {
      onSuccess: () => router.back(),
      onError: () => setError(t('errors.network')),
    };

    if (editing) updateAddress.mutate({ id: editing.id, ...dto }, options);
    else createAddress.mutate(dto, options);
  };

  return (
    <Screen className="gap-4">
      <AppText variant="title2" className="pt-2">
        {editing ? t('addresses.editTitle') : t('addresses.addTitle')}
      </AppText>

      {/* Label chips */}
      <View className="flex-row gap-2">
        {LABELS.map((value) => (
          <Pressable
            key={value}
            onPress={() => setLabel(value)}
            className={`rounded-full border px-4 py-2 ${
              label === value ? 'border-navy bg-primary-soft' : 'border-line bg-card'
            }`}
          >
            <AppText
              variant="footnote"
              className={label === value ? 'text-navy' : ''}
            >
              {t(`addresses.labels.${value}`)}
            </AppText>
          </Pressable>
        ))}
      </View>

      <Input
        label={t('addresses.street')}
        value={street}
        onChangeText={setStreet}
        error={error}
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input label={t('addresses.building')} value={building} onChangeText={setBuilding} />
        </View>
        <View className="flex-1">
          <Input label={t('addresses.apartment')} value={apartment} onChangeText={setApartment} />
        </View>
      </View>
      <Input
        label={t('addresses.driverNotes')}
        value={driverNotes}
        onChangeText={setDriverNotes}
        multiline
      />

      <Button
        label={coords ? t('addresses.locationSet') : t('addresses.useMyLocation')}
        variant="secondary"
        loading={locating}
        onPress={() => void captureLocation()}
      />

      <View className="flex-row items-center justify-between py-1">
        <AppText variant="body">{t('addresses.setDefault')}</AppText>
        <Switch value={isDefault} onValueChange={setIsDefault} />
      </View>

      <Button label={t('common.confirm')} loading={saving} onPress={handleSave} />
    </Screen>
  );
}
