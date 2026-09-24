import { StyleSheet, View } from 'react-native';
import type { PropsWithChildren } from 'react';

const gaps = { tight: 8, normal: 14, roomy: 22 } as const;
type Spacing = keyof typeof gaps;
export function Stack({
  children,
  spacing = 'normal',
}: PropsWithChildren<{ spacing?: Spacing }>) {
  return <View style={{ gap: gaps[spacing], minWidth: 0 }}>{children}</View>;
}
export function Row({
  children,
  distribution = 'start',
}: PropsWithChildren<{ distribution?: 'start' | 'between' }>) {
  return (
    <View style={[styles.row, distribution === 'between' && styles.between]}>
      {children}
    </View>
  );
}
export function Actions({ children }: PropsWithChildren) {
  return <View style={styles.actions}>{children}</View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    minWidth: 0,
  },
  between: { justifyContent: 'space-between' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
});
