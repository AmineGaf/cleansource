/**
 * Tailwind preset for NativeWind — maps the CleanSource tokens onto the
 * Tailwind theme so the whole app styles from one source of truth.
 *
 * Usage (apps/mobile/tailwind.config.js):
 *   presets: [require('@cleansource/tokens/tailwind-preset')]
 */
import { colors, palette, radius, spacing } from './index';

const preset = {
  theme: {
    extend: {
      colors: {
        // brand
        navy: palette.navy,
        'navy-light': palette.navyLight,
        ink: palette.ink,
        blue: palette.blue,
        'blue-grey': palette.blueGrey,
        baby: palette.baby,
        slate: palette.slate,

        // semantic roles
        primary: {
          DEFAULT: colors.primary,
          pressed: colors.primaryPressed,
          soft: colors.primarySoft,
        },
        surface: palette.surface,
        card: colors.card,
        line: colors.border,
        fill: colors.inputFill,
        paper: palette.paper,
        muted: colors.textMuted,
        faint: colors.textFaint,
        success: { DEFAULT: colors.success, soft: colors.successSoft },
        warning: { DEFAULT: colors.warning, soft: colors.warningSoft, dark: palette.warningDark },
        danger: { DEFAULT: colors.danger, soft: colors.dangerSoft },
      },
      borderRadius: {
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        xl: `${radius.xl}px`,
        sheet: `${radius.sheet}px`,
      },
      spacing: Object.fromEntries(
        Object.entries(spacing).map(([key, value]) => [`t-${key}`, `${value}px`]),
      ),
      fontFamily: {
        sans: ['IBMPlexSansArabic_400Regular'],
        medium: ['IBMPlexSansArabic_500Medium'],
        semibold: ['IBMPlexSansArabic_600SemiBold'],
        bold: ['IBMPlexSansArabic_700Bold'],
      },
    },
  },
};

export default preset;
// CommonJS interop so tailwind.config.js can `require()` this directly.
module.exports = preset;
module.exports.default = preset;
