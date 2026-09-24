import { StyleSheet } from 'react-native';
import { colors } from './shared/theme';
import { Actions, Row } from './shared/Layout';
import { Typography } from './shared/Typography';
import { CollapsibleCard } from './shared/CollapsibleCard';
import { View, Text, ScrollView } from 'react-native';
import type { Device, Job } from '../shared/types';
import { Button } from './shared/Button';

interface Props {
  devices: Device[];
  warnings: string[];
  scanning: boolean;
  hasProject: boolean;
  active: Pick<Job, 'id' | 'kind' | 'status'>[];
  disabled: boolean;
  onRefresh: () => void;
  onBoot: (device: Device) => void;
  onBuild: (device: Device) => void;
}
export function DevicesPanel({
  devices,
  warnings,
  scanning,
  hasProject,
  active,
  disabled,
  onRefresh,
  onBoot,
  onBuild,
}: Props) {
  return (
    <CollapsibleCard title="Devices" summary={`${devices.length} available`}>
      <Row distribution="between">
        <Typography variant="body">
          Boot a device, then build and install your project.
        </Typography>
        <Button disabled={disabled || scanning} onPress={() => onRefresh()}>
          {scanning ? 'Scanning…' : 'Refresh'}
        </Button>
      </Row>
      <ScrollView style={{ maxHeight: 360 }}>
        {devices.map((d) => (
          <View key={`${d.type}:${d.id}`} style={s.device}>
            <Row distribution="between">
              <Typography variant="label">{d.name}</Typography>
              <Text style={s.platform}>
                {d.platform === 'ios' ? 'iOS' : 'ANDROID'}
              </Text>
            </Row>
            <Typography variant="hint">
              {d.state} · {d.runtime || d.type}
            </Typography>
            <Actions>
              {(d.type === 'avd' ||
                (d.type === 'simulator' && d.state !== 'Booted')) && (
                <Button
                  disabled={
                    disabled || active.some((j) => j.kind === `boot:${d.id}`)
                  }
                  onPress={() => onBoot(d)}
                >
                  Boot
                </Button>
              )}
              {d.type !== 'avd' && (
                <Button
                  disabled={
                    disabled ||
                    !hasProject ||
                    active.some((j) => j.kind === 'build') ||
                    (d.platform === 'android' && d.state !== 'device')
                  }
                  onPress={() => onBuild(d)}
                >
                  Build & run
                </Button>
              )}
            </Actions>
          </View>
        ))}
      </ScrollView>
      {!devices.length && (
        <Typography variant="hint">
          {scanning ? 'Looking for devices…' : 'No devices found.'}
        </Typography>
      )}
      {warnings.map((w) => (
        <Typography key={w} variant="warning">
          {w}
        </Typography>
      ))}
      <Typography variant="hint">
        Build & run may generate native project files. Run your project’s
        development-server script separately. After booting an Android emulator,
        refresh to find its connected target. Physical iOS device discovery is
        coming later.
      </Typography>
    </CollapsibleCard>
  );
}

const s = StyleSheet.create({
  device: {
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 16,
    gap: 9,
  },
  platform: { color: colors.muted, fontSize: 9 },
});
