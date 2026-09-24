import React from 'react';
import { View, Text } from 'react-native';
import type { Job } from '../shared/types';
import { Button } from './Button';
import { s } from './styles';

interface Props {
  metro?: Pick<Job, 'id' | 'kind' | 'status'>;
  hasProject: boolean;
  disabled: boolean;
  onStart: (clear: boolean) => void;
  onStop: (id: string) => void;
}
export function MetroPanel({
  metro,
  hasProject,
  disabled,
  onStart,
  onStop,
}: Props) {
  return (
    <View style={s.card}>
      <View style={s.sectionRow}>
        <Text style={s.heading}>Development server</Text>
        <Text style={s.status}>
          {metro ? metro.status.toUpperCase() : 'STOPPED'}
        </Text>
      </View>
      <Text style={s.description}>
        Metro serves your JavaScript to connected apps on port 8081.
      </Text>
      <View style={s.actions}>
        <Button
          primary
          disabled={disabled || !hasProject || !!metro}
          onPress={() => onStart(false)}
        >
          Start Metro
        </Button>
        <Button
          disabled={disabled || !hasProject || !!metro}
          onPress={() => onStart(true)}
        >
          Start fresh
        </Button>
        {metro && (
          <Button
            disabled={disabled || metro.status === 'stopping'}
            onPress={() => onStop(metro.id)}
          >
            Stop
          </Button>
        )}
      </View>
      <Text style={s.hint}>Start fresh clears Metro’s cache.</Text>
    </View>
  );
}
