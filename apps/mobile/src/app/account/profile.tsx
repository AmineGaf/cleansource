import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, I18nManager, Pressable, View } from 'react-native';

import { AppText, Button, Input, Screen } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useUpdateProfile } from '@/features/profile/api';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (fullName.trim().length < 2) {
      setError(t('profile.nameRequired'));
      return;
    }
    setError(undefined);
    setSaved(false);
    updateProfile.mutate(
      {
        fullName: fullName.trim(),
        email: email.trim() || null,
      },
      {
        onSuccess: () => setSaved(true),
        onError: () => setError(t('errors.network')),
      },
    );
  };

  const switchLanguage = (language: 'ar' | 'en') => {
    if (language === i18n.language) return;
    void i18n.changeLanguage(language);
    updateProfile.mutate({ language });
    const wantsRTL = language === 'ar';
    if (I18nManager.isRTL !== wantsRTL) {
      I18nManager.allowRTL(wantsRTL);
      I18nManager.forceRTL(wantsRTL);
      Alert.alert(t('profile.restartTitle'), t('profile.restartMessage'));
    }
  };

  return (
    <Screen className="gap-4">
      <AppText variant="title2" className="pt-2">
        {t('profile.title')}
      </AppText>

      <Input label={t('profile.fullName')} value={fullName} onChangeText={setFullName} error={error} />
      <Input
        label={t('profile.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input label={t('profile.phone')} value={user?.phone ?? ''} editable={false} className="opacity-60" />

      <View className="gap-2">
        <AppText variant="footnote">{t('profile.language')}</AppText>
        <View className="flex-row gap-2">
          {(['ar', 'en'] as const).map((language) => (
            <Pressable
              key={language}
              onPress={() => switchLanguage(language)}
              className={`rounded-full border px-5 py-2 ${
                i18n.language === language
                  ? 'border-navy bg-primary-soft'
                  : 'border-line bg-card'
              }`}
            >
              <AppText
                variant="footnote"
                className={i18n.language === language ? 'text-navy' : ''}
              >
                {language === 'ar' ? 'العربية' : 'English'}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      {saved && (
        <AppText variant="footnote" className="text-success">
          {t('profile.saved')}
        </AppText>
      )}

      <Button label={t('common.confirm')} loading={updateProfile.isPending} onPress={handleSave} />
    </Screen>
  );
}
