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
export function Actions({
  children,
  align = 'start',
}: PropsWithChildren<{ align?: 'start' | 'end' }>) {
  return (
    <View style={[styles.actions, align === 'end' && styles.end]}>
      {children}
    </View>
  );
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
  end: { justifyContent: 'flex-end' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
});
