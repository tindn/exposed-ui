import React from 'react';
import { Pressable, Text } from 'react-native';
import { colors, s } from './styles';
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
