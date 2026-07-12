import { Text as RNText, type TextProps } from 'react-native';

type Variant = 'hero' | 'title1' | 'title2' | 'title3' | 'subhead' | 'body' | 'footnote' | 'caption';

const variantClasses: Record<Variant, string> = {
  hero: 'font-bold text-[30px] leading-[38px] text-ink',
  title1: 'font-bold text-[26px] leading-[34px] text-ink',
  title2: 'font-bold text-[22px] leading-[30px] text-ink',
  title3: 'font-semibold text-[18px] leading-[26px] text-ink',
  subhead: 'font-semibold text-[16px] leading-[24px] text-ink',
  body: 'font-sans text-[14px] leading-[22px] text-ink',
  footnote: 'font-sans text-[12px] leading-[18px] text-muted',
  caption: 'font-medium text-[11px] leading-[16px] text-faint',
};

interface Props extends TextProps {
  variant?: Variant;
  muted?: boolean;
  className?: string;
}

/** Typography primitive — every label in the app goes through this. */
export function AppText({ variant = 'body', muted, className = '', ...rest }: Props) {
  return (
    <RNText
      className={`${variantClasses[variant]} ${muted ? 'text-muted' : ''} ${className}`}
      {...rest}
    />
  );
}
