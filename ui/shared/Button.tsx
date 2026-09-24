import { StyleSheet } from 'react-native';
import { colors } from './theme';
import React from 'react';
import { Pressable, Text } from 'react-native';
export function Button({
  children,
  onPress,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        primary && s.primary,
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.35 },
      ]}
    >
      <Text style={[s.buttonText, primary && { color: colors.bg }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#465140',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primary: { backgroundColor: colors.green, borderColor: colors.green },
  buttonText: { color: colors.text, fontSize: 12, fontWeight: '600' },
});
