import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChartPeriod } from '@/lib/types';
import { colors, fonts, radius, spacing } from '@/theme';

interface ChartToggleProps {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}

export function ChartToggle({ value, onChange }: ChartToggleProps) {
  return (
    <View style={styles.container}>
      {(['week', 'month'] as ChartPeriod[]).map((period) => {
        const active = value === period;
        return (
          <Pressable
            key={period}
            onPress={() => onChange(period)}
            style={[styles.option, active && styles.optionActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>
              {period === 'week' ? 'This Week' : 'This Month'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  optionActive: {
    backgroundColor: colors.accent,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: colors.background,
  },
});
