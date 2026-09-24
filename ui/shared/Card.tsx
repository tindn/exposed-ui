import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from './theme';

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 22,
    gap: 14,
    minWidth: 0,
  },
});
