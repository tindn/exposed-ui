import { TextField } from './shared/TextField';
import { Actions, Stack } from './shared/Layout';
import { Typography } from './shared/Typography';
import { Card } from './shared/Card';
import { useState } from 'react';
import { Pressable } from 'react-native';
import type { RecentProject } from '../shared/types';
import { Button } from './shared/Button';

interface Props {
  hasProject: boolean;
  recentProjects: RecentProject[];
  projectError: string;
  disabled: boolean;
  hasActiveJobs: boolean;
  onOpen: (path: string) => Promise<boolean>;
}
export function ProjectPicker({
  hasProject,
  recentProjects,
  projectError,
  disabled,
  hasActiveJobs,
  onOpen: openProject,
}: Props) {
  const [projectPath, onPathChange] = useState('');
  async function onOpen(path: string) {
    if (await openProject(path)) onPathChange('');
  }
  return (
    <Card>
      <Typography variant="heading">
        {hasProject ? 'Switch project' : 'Open an Expo project'}
      </Typography>
      <Actions>
        <TextField
          accessibilityLabel="Expo project folder"
          placeholder="~/projects/my-expo-app"
          value={projectPath}
          onChangeText={onPathChange}
          onSubmitEditing={() => {
            if (projectPath.trim() && !disabled && !hasActiveJobs)
              onOpen(projectPath);
          }}
        />
        <Button
          primary
          disabled={disabled || !projectPath.trim() || !!hasActiveJobs}
          onPress={() => onOpen(projectPath)}
        >
          Open project
        </Button>
      </Actions>
      {!!projectError && (
        <Typography accessibilityRole="alert" variant="warning">
          {projectError}
        </Typography>
      )}
      {!!hasActiveJobs && (
        <Typography variant="hint">
          Stop running commands in Activity before switching projects.
        </Typography>
      )}
      {!!recentProjects.length && (
        <Stack spacing="tight">
          <Typography variant="eyebrow">RECENT PROJECTS</Typography>
          {recentProjects.map((p) => (
            <Pressable
              accessibilityRole="button"
              key={p.path}
              disabled={disabled || !!hasActiveJobs}
              onPress={() => {
                onPathChange(p.path);
                onOpen(p.path);
              }}
              style={{
                opacity: disabled || hasActiveJobs ? 0.4 : 1,
                paddingVertical: 6,
              }}
            >
              <Typography variant="label">{p.name}</Typography>
              <Typography variant="hint">{p.path}</Typography>
            </Pressable>
          ))}
        </Stack>
      )}
    </Card>
  );
}
