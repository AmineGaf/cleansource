import { SupportProblemType } from '@cleansource/contracts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText, Button, Card, Input, Screen } from '@/components/ui';
import { useCreateSupportTicket, useSupportTickets } from '@/features/support/api';
import { formatDate } from '@/lib/format';

const PROBLEM_TYPES = [
  SupportProblemType.MISSING_ITEM,
  SupportProblemType.DAMAGE,
  SupportProblemType.LATE,
  SupportProblemType.QUALITY,
  SupportProblemType.OTHER,
];

export default function SupportScreen() {
  const { t } = useTranslation();
  const { data: tickets } = useSupportTickets();
  const createTicket = useCreateSupportTicket();

  const [problemType, setProblemType] = useState<SupportProblemType>();
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    if (!problemType) {
      setError(t('support.problemRequired'));
      return;
    }
    if (description.trim().length < 10) {
      setError(t('support.descriptionTooShort'));
      return;
    }
    setError(undefined);
    createTicket.mutate(
      { problemType, description: description.trim() },
      {
        onSuccess: () => {
          setProblemType(undefined);
          setDescription('');
        },
        onError: () => setError(t('errors.network')),
      },
    );
  };

  return (
    <Screen className="gap-4">
      <AppText variant="title2" className="pt-2">
        {t('support.title')}
      </AppText>

      <Card className="gap-3">
        <AppText variant="subhead">{t('support.newTicket')}</AppText>

        <View className="flex-row flex-wrap gap-2">
          {PROBLEM_TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => setProblemType(type)}
              className={`rounded-full border px-4 py-2 ${
                problemType === type ? 'border-navy bg-primary-soft' : 'border-line bg-card'
              }`}
            >
              <AppText
                variant="footnote"
                className={problemType === type ? 'text-navy' : ''}
              >
                {t(`support.problems.${type}`)}
              </AppText>
            </Pressable>
          ))}
        </View>

        <Input
          placeholder={t('support.descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
          className="h-24 py-3"
          error={error}
        />

        <Button
          label={t('support.submit')}
          loading={createTicket.isPending}
          onPress={handleSubmit}
        />
      </Card>

      {(tickets?.length ?? 0) > 0 && (
        <>
          <AppText variant="subhead">{t('support.pastTickets')}</AppText>
          {tickets?.map((ticket) => (
            <Card key={ticket.id} className="gap-1">
              <View className="flex-row items-center justify-between">
                <AppText variant="subhead">{ticket.reference}</AppText>
                <View className="rounded-full bg-warning-soft px-3 py-1">
                  <AppText variant="caption" className="text-warning-dark">
                    {t(`support.statuses.${ticket.status}`, ticket.status)}
                  </AppText>
                </View>
              </View>
              <AppText variant="footnote">
                {t(`support.problems.${ticket.problemType}`)} · {formatDate(ticket.createdAt)}
              </AppText>
              <AppText variant="body" muted numberOfLines={2}>
                {ticket.description}
              </AppText>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
