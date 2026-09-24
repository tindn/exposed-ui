import React from 'react';
import { View, Text } from 'react-native';
import { colors, s } from './styles';

interface Props {
  connected: boolean;
  token: string;
}
export function Header({ connected, token }: Props) {
  return (
    <View style={s.header}>
      <View style={s.brand}>
        <View style={s.mark}>
          <Text style={s.markText}>e.</Text>
        </View>
        <View>
          <Text style={s.title}>
            exposed<Text style={{ color: colors.muted }}> ui</Text>
          </Text>
          <Text style={s.subtitle}>A local control panel for Expo.</Text>
        </View>
      </View>
      <View style={{ maxWidth: '100%', gap: 6, alignItems: 'flex-end' }}>
        <Text style={[s.pill, { color: connected ? colors.green : '#e0ad7c' }]}>
          {connected ? '●  LOCAL SESSION' : '○  DISCONNECTED'}
        </Text>
        <Text
          selectable
          accessibilityLabel="Session auth token"
          style={{
            color: colors.muted,
            fontFamily: 'monospace',
            fontSize: 11,
            flexShrink: 1,
          }}
        >
          {token || 'No auth token'}
        </Text>
      </View>
    </View>
  );
}
