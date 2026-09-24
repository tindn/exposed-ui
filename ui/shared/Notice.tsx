import type { PropsWithChildren } from 'react';
import { StyleSheet, Text } from 'react-native';
export function Notice({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="alert" style={styles.notice}>
      {children}
    </Text>
  );
}
const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#422a25',
    color: '#ffcfba',
    padding: 16,
    borderRadius: 8,
  },
});
