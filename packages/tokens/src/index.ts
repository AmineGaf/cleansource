/**
 * CleanSource Laundry — design tokens.
 *
 * Single source of truth, codified from the approved design
 * (Claude Design handoff, July 2026). Consumed by:
 *  - the mobile app via the Tailwind preset (`@cleansource/tokens/tailwind-preset`)
 *  - runtime code that needs raw values (charts, native props, navigation themes)
 */

/** Raw palette — exact values from the design file. */
export const palette = {
  // Brand
  navy: '#0e3b7b',
  navyLight: '#1c52a0',
  ink: '#0f1b2d',

  // Supporting blues
  blue: '#7c94c3',
  blueGrey: '#92a8ce',
  baby: '#c9d4e5',

  // Neutrals (cool, blue-biased — per the design's calm direction)
  slate: '#5a6b85',
  line: '#e7edf6',
  lineSoft: '#e6eaf1',
  fill: '#f1f3f8',
  surface: '#f4f6f9',
  paper: '#e9edf3',
  white: '#ffffff',
  offWhite: '#fbfbfb',

  // Semantic
  success: '#1f9d6b',
  successSoft: '#e3f3ec',
  warning: '#f5b83d',
  warningDark: '#c87b1e',
  warningSoft: '#fff4e6',
  danger: '#d64545',
  dangerSoft: '#fdecec',
} as const;

/** Semantic color roles — use these in components, not the raw palette. */
export const colors = {
  primary: palette.navy,
  primaryPressed: '#0b2f63',
  primarySoft: '#eef3fb',
  onPrimary: palette.white,

  text: palette.ink,
  textMuted: palette.slate,
  textFaint: palette.blueGrey,

  background: palette.surface,
  card: palette.white,
  border: palette.line,
  inputFill: palette.fill,

  selected: palette.baby,
  success: palette.success,
  successSoft: palette.successSoft,
  warning: palette.warning,
  warningSoft: palette.warningSoft,
  danger: palette.danger,
  dangerSoft: palette.dangerSoft,
} as const;

/** Corner radii — the design uses soft 12–16px corners; sheets and pills go larger. */
export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  sheet: 24,
  pill: 999,
} as const;

/** 4pt spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

/**
 * Type scale (px). IBM Plex Sans Arabic carries both Arabic and Latin;
 * IBM Plex Sans is the Latin companion where needed.
 */
export const typography = {
  fonts: {
    regular: 'IBMPlexSansArabic_400Regular',
    medium: 'IBMPlexSansArabic_500Medium',
    semibold: 'IBMPlexSansArabic_600SemiBold',
    bold: 'IBMPlexSansArabic_700Bold',
  },
  sizes: {
    caption: 11,
    footnote: 12,
    body: 14,
    callout: 15,
    subhead: 16,
    title3: 18,
    title2: 22,
    title1: 26,
    hero: 30,
  },
} as const;

/** Order status → color mapping used by pills and the tracking timeline. */
export const statusColors = {
  PLACED: palette.navy,
  PICKED_UP: palette.success,
  IN_PROGRESS: palette.warningDark,
  OUT_FOR_DELIVERY: palette.navy,
  DELIVERED: palette.success,
  CANCELLED: palette.danger,
} as const;

export type Palette = typeof palette;
export type Colors = typeof colors;
