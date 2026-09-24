import { TextInput, StyleSheet } from 'react-native';
import { colors } from './theme';
export function CommandField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <TextInput
      accessibilityLabel={label}
      value={value}
      editable={false}
      multiline
      style={styles.field}
    />
  );
}
const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.bg,
    color: colors.muted,
    borderWidth: 0,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    outlineWidth: 0,
    outlineStyle: 'solid',
    outlineColor: 'transparent',
    fontFamily: 'monospace',
    fontSize: 12,
    minWidth: 0,
  },
});
