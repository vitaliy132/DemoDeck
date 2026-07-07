import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ChartToggle } from '@/components/ChartToggle';
import { DemoCard } from '@/components/DemoCard';
import { getChartEntries } from '@/lib/demos';
import { ChartEntry, ChartPeriod } from '@/lib/types';
import { colors, fonts, spacing } from '@/theme';

export default function ChartsScreen() {
  const [period, setPeriod] = useState<ChartPeriod>('week');
  const [entries, setEntries] = useState<ChartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCharts = useCallback(async () => {
    try {
      const data = await getChartEntries(period);
      setEntries(data);
    } catch (err) {
      console.error('Chart load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    loadCharts();
  }, [loadCharts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCharts();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>TOP DEMOS</Text>
        <ChartToggle value={period} onChange={setPeriod} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.demo.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Chart empty</Text>
              <Text style={styles.emptyText}>
                No demos ranked for this {period === 'week' ? 'week' : 'month'} yet.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DemoCard
              demo={item.demo}
              author={item.author}
              showRank={item.rank}
              showScore={item.score}
              onUpdate={loadCharts}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
