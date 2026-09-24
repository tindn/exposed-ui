import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { Device, Job } from '../shared/types';
import { Button } from './Button';
import { s } from './styles';

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
    <View style={s.card}>
      <View style={s.sectionRow}>
        <Text style={s.heading}>Devices</Text>
        <Button disabled={disabled || scanning} onPress={() => onRefresh()}>
          {scanning ? 'Scanning…' : 'Refresh'}
        </Button>
      </View>
      <Text style={s.description}>
        Boot a device, then build and install your project.
      </Text>
      <ScrollView style={{ maxHeight: 360 }}>
        {devices.map((d) => (
          <View key={`${d.type}:${d.id}`} style={s.device}>
            <View style={s.sectionRow}>
              <Text style={s.deviceName}>{d.name}</Text>
              <Text style={s.platform}>
                {d.platform === 'ios' ? 'iOS' : 'ANDROID'}
              </Text>
            </View>
            <Text style={s.hint}>
              {d.state} · {d.runtime || d.type}
            </Text>
            <View style={s.actions}>
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
            </View>
          </View>
        ))}
      </ScrollView>
      {!devices.length && (
        <Text style={s.hint}>
          {scanning ? 'Looking for devices…' : 'No devices found.'}
        </Text>
      )}
      {warnings.map((w) => (
        <Text key={w} style={s.warning}>
          {w}
        </Text>
      ))}
      <Text style={s.hint}>
        Build & run may generate native project files. Start Metro separately.
        After booting an Android emulator, refresh to find its connected target.
        Physical iOS device discovery is coming later.
      </Text>
    </View>
  );
}
