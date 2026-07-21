import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { AppText, Card, Screen } from '@/components/ui';
import { useWallet } from '@/features/wallet/api';
import { formatAmount, formatDate } from '@/lib/format';

export default function WalletScreen() {
  const { t } = useTranslation();
  const { data: wallet, isLoading } = useWallet();

  return (
    <Screen className="gap-4">
      <AppText variant="title2" className="pt-2">
        {t('wallet.title')}
      </AppText>

      {isLoading || !wallet ? (
        <ActivityIndicator color="#0e3b7b" className="pt-24" />
      ) : (
        <>
          <Card className="items-center gap-1 border-0 bg-primary py-8">
            <AppText variant="footnote" className="text-baby">
              {t('wallet.balance')}
            </AppText>
            <AppText variant="hero" className="text-white">
              {formatAmount(wallet.balance)} {t('common.sar')}
            </AppText>
          </Card>

          <AppText variant="subhead">{t('wallet.history')}</AppText>

          {wallet.transactions.length === 0 ? (
            <AppText variant="body" muted className="pt-6 text-center">
              {t('wallet.empty')}
            </AppText>
          ) : (
            wallet.transactions.map((tx) => (
              <Card key={tx.id} className="flex-row items-center justify-between">
                <View>
                  <AppText variant="body">{t(`wallet.reasons.${tx.reason}`, tx.reason)}</AppText>
                  <AppText variant="caption">{formatDate(tx.createdAt)}</AppText>
                </View>
                <AppText
                  variant="subhead"
                  className={tx.amount >= 0 ? 'text-success' : 'text-danger'}
                >
                  {tx.amount >= 0 ? '+' : '−'}
                  {formatAmount(Math.abs(tx.amount))} {t('common.sar')}
                </AppText>
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}
