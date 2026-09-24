import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { colors } from './theme';
export function TextField(
  props: Omit<TextInputProps, 'style' | 'placeholderTextColor'>,
) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.muted}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      style={[styles.input, focused && styles.focused]}
    />
  );
}
const styles = StyleSheet.create({
  focused: { backgroundColor: colors.panel },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 180,
    minWidth: 0,
    color: colors.text,
    backgroundColor: colors.bg,
    borderColor: colors.line,
    borderWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    outlineWidth: 0,
    outlineStyle: 'solid',
    outlineColor: 'transparent',
    fontSize: 13,
  },
});
