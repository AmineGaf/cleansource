import { CreditCard, MapPin, Scale, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { OrderStatus } from '@cleansource/contracts';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  IconTile,
  Input,
  ListRow,
  OtpInput,
  PriceRow,
  Screen,
  SelectionCard,
  Sheet,
  StatusPill,
  Stepper,
  Timeline,
} from '@/components/ui';

/**
 * DEV ONLY — living gallery of the design system.
 * Open via deep link: cleansource:///dev-components (or type the URL in Expo).
 * Not linked from any production screen.
 */
export default function DevComponentsScreen() {
  const [qty, setQty] = useState(2);
  const [otp, setOtp] = useState('12');
  const [chip, setChip] = useState(0);
  const [pkg, setPkg] = useState('6kg');
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Screen className="gap-6 pb-16">
      <AppText variant="title1" className="pt-4">
        Design system
      </AppText>

      <Section title="Buttons">
        <View className="gap-3">
          <Button label="Primary action" />
          <Button label="Secondary" variant="secondary" />
          <View className="flex-row gap-3">
            <Button label="Ghost" variant="ghost" className="flex-1" />
            <Button label="Danger" variant="danger" className="flex-1" />
          </View>
          <Button label="Loading" loading />
        </View>
      </Section>

      <Section title="Inputs">
        <View className="gap-3">
          <Input label="Label" placeholder="Placeholder" />
          <Input placeholder="With error" error="Something's wrong here" />
          <OtpInput value={otp} onChange={setOtp} />
        </View>
      </Section>

      <Section title="Chips (day / slot picker)">
        <View className="flex-row gap-2">
          {['Today 4', 'Fri 5', 'Sat 6', 'Sun 7'].map((label, index) => (
            <Chip
              key={label}
              label={label.split(' ')[0]!}
              sublabel={label.split(' ')[1]}
              selected={chip === index}
              onPress={() => setChip(index)}
            />
          ))}
        </View>
      </Section>

      <Section title="Selection cards (packages / payment)">
        <View className="gap-3">
          <SelectionCard
            title="6 KG Package"
            description="For one person · 2–3 days of clothes"
            leading={<IconTile icon={Scale} />}
            trailing={<AppText variant="subhead">49</AppText>}
            selected={pkg === '6kg'}
            onPress={() => setPkg('6kg')}
          />
          <SelectionCard
            title="12 KG Package"
            description="Ideal for families · save 9 SAR"
            leading={<IconTile icon={Scale} />}
            trailing={<AppText variant="subhead">89</AppText>}
            selected={pkg === '12kg'}
            onPress={() => setPkg('12kg')}
          />
        </View>
      </Section>

      <Section title="Status pills">
        <View className="flex-row flex-wrap gap-2">
          {Object.values(OrderStatus).map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </View>
      </Section>

      <Section title="Timeline (live tracking)">
        <Card>
          <Timeline
            current={OrderStatus.OUT_FOR_DELIVERY}
            timestamps={{ PLACED: '9:02 AM', PICKED_UP: '9:35 AM', IN_PROGRESS: '11:10 AM' }}
          />
        </Card>
      </Section>

      <Section title="List rows (account)">
        <Card className="py-1">
          <ListRow icon={Wallet} label="Wallet" value="25.00 SAR" onPress={() => {}} />
          <ListRow icon={MapPin} label="My addresses" onPress={() => {}} />
          <ListRow icon={CreditCard} label="Payment methods" onPress={() => {}} />
          <ListRow label="Delete account" danger chevron={false} onPress={() => {}} />
        </Card>
      </Section>

      <Section title="Stepper · Badge · Avatar">
        <View className="flex-row items-center gap-6">
          <Stepper value={qty} onChange={setQty} />
          <Badge count={3} />
          <Avatar name="Faisal" />
        </View>
      </Section>

      <Section title="Price breakdown">
        <Card>
          <PriceRow label="Subtotal" amount={5500} />
          <PriceRow label="Discount (CLEAN20)" amount={1100} negative />
          <PriceRow label="VAT 15%" amount={660} />
          <PriceRow label="Total" amount={5060} emphasized />
        </Card>
      </Section>

      <Section title="Sheet & empty state">
        <Button label="Open sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
        <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Bottom sheet">
          <AppText variant="body" muted>
            Rounded top, handle bar, dim backdrop — used for the calendar and cancel-reason flows.
          </AppText>
          <Button label="Close" className="mt-4" onPress={() => setSheetOpen(false)} />
        </Sheet>
        <View className="h-64">
          <EmptyState
            title="No orders yet"
            subtitle="Start your first order — we handle everything"
            actionLabel="New order"
            onAction={() => {}}
          />
        </View>
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <AppText variant="caption" className="uppercase tracking-widest">
        {title}
      </AppText>
      {children}
    </View>
  );
}
