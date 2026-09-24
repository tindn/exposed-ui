import { StyleSheet, Text } from 'react-native';
import type { TextProps } from 'react-native';
import { colors } from './theme';

type Props = Omit<TextProps, 'style'> & { variant?: keyof typeof styles };
export function Typography({ variant = 'body', ...props }: Props) {
  return <Text {...props} style={styles[variant]} />;
}
const styles = StyleSheet.create({
  heading: { color: colors.text, fontWeight: '600', fontSize: 16 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 18 },
  warning: { color: '#dcb388', fontSize: 11, lineHeight: 18 },
  label: { color: colors.text, fontSize: 13, flexShrink: 1 },
  eyebrow: { color: colors.green, fontSize: 10, letterSpacing: 2 },
});
