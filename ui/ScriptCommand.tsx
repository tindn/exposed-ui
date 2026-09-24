import { useState } from 'react';
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
      <Typography variant="label">{name}</Typography>
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
  );
}
