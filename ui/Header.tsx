import { useState } from 'react';
import { Button } from './shared/Button';
import { Row } from './shared/Layout';
import { StyleSheet } from 'react-native';
import { colors } from './shared/theme';
import { View, Text } from 'react-native';

interface Props {
  connected: boolean;
  token: string;
}
export function Header({ connected, token }: Props) {
  const [copyStatus, setCopyStatus] = useState('Copy');
  async function copyToken() {
    try {
      await navigator.clipboard.writeText(token);
      setCopyStatus('Copied');
    } catch {
      setCopyStatus('Retry copy');
    }
  }
  return (
    <View style={s.header}>
      <View style={s.brand}>
        <View style={s.mark}>
          <Text style={s.markText}>e.</Text>
        </View>
        <View>
          <Text style={s.title}>
            expo <Text style={{ color: colors.muted }}>sed</Text>-ui
          </Text>
          <Text style={s.subtitle}>A local control panel for Expo.</Text>
        </View>
      </View>
      <View style={{ maxWidth: '100%', gap: 6, alignItems: 'flex-end' }}>
        <Text style={[s.pill, { color: connected ? colors.green : '#e0ad7c' }]}>
          {connected ? '●  LOCAL SESSION' : '○  DISCONNECTED'}
        </Text>
        <Row>
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
            {token
              ? `${token.slice(0, 8)}…${token.slice(-6)}`
              : 'No auth token'}
          </Text>
          <Button disabled={!token} onPress={copyToken}>
            {copyStatus}
          </Button>
        </Row>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 36,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  brand: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  mark: {
    backgroundColor: colors.green,
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontSize: 28, fontWeight: '800', color: colors.bg },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },
  pill: {
    fontSize: 10,
    letterSpacing: 1.5,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    borderRadius: 20,
  },
});
