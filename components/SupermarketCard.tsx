import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { priceTierLabel } from '@/constants/supermarkets';
import { colors } from '@/constants/colors';
import type { RankedSupermarket } from '@/types';

interface SupermarketCardProps {
  supermarket: RankedSupermarket;
  rank: number;
}

export function SupermarketCard({ supermarket, rank }: SupermarketCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{supermarket.name}</Text>
          <Text style={styles.meta}>
            {priceTierLabel(supermarket.priceTier)} · ~
            {supermarket.estimatedDistanceKm.toFixed(1)} km
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfacePlain,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
