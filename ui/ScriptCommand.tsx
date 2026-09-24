import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './shared/theme';
import type { Job } from '../shared/types';
import { parseArguments } from '../shared/arguments';
import { errorMessage } from '../shared/types';
import { Stack, Actions } from './shared/Layout';
import { Typography } from './shared/Typography';
import { TextField } from './shared/TextField';
import { CommandField } from './shared/CommandField';
import { Button } from './shared/Button';
interface Props {
  name: string;
  command: string;
  running?: Pick<Job, 'id' | 'kind' | 'status'>;
  disabled: boolean;
  onRun: (args: string[]) => void;
  onStop: () => void;
}
export function ScriptCommand({
  name,
  command,
  running,
  disabled,
  onRun,
  onStop,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [argumentsText, setArgumentsText] = useState('');
  const [error, setError] = useState('');
  const blocked = disabled || !!running || name.startsWith('-');
  function submit() {
    if (blocked) return;
    try {
      const args = parseArguments(argumentsText);
      setError('');
      onRun(args);
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  return (
    <Stack spacing="tight">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name} script`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.summary}
      >
        <View style={styles.summaryText}>
          <Typography variant="label">{name}</Typography>
          {!expanded && (
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.preview}>
              {command}
            </Text>
          )}
        </View>
        {running && <Typography variant="hint">{running.status}</Typography>}
        <Typography variant="hint">{expanded ? '▴' : '▾'}</Typography>
      </Pressable>
      {expanded && (
        <Stack spacing="tight">
          <CommandField label={`${name} command`} value={command} />
          <Actions>
            <TextField
              accessibilityLabel={`${name} additional arguments`}
              placeholder="Additional args, e.g. --clear"
              value={argumentsText}
              onChangeText={setArgumentsText}
              onSubmitEditing={submit}
            />
          </Actions>
          {!!error && (
            <Typography accessibilityRole="alert" variant="warning">
              {error}
            </Typography>
          )}
          <Actions>
            <Button primary disabled={blocked} onPress={submit}>
              Run
            </Button>
            {running && (
              <Button
                disabled={disabled || running.status === 'stopping'}
                onPress={onStop}
              >
                {running.status === 'stopping' ? 'Stopping…' : 'Stop'}
              </Button>
            )}
          </Actions>
        </Stack>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  summaryText: { flex: 1, minWidth: 0, gap: 4 },
  preview: {
    color: colors.muted,
    opacity: 0.7,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
