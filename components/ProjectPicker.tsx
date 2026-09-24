import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import type { RecentProject } from '../shared/types';
import { Button } from './Button';
import { colors, s } from './styles';

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
    <View style={[s.card, { marginBottom: 24 }]}>
      <Text style={s.heading}>
        {hasProject ? 'Switch project' : 'Open an Expo project'}
      </Text>
      <View style={[s.actions, { alignItems: 'center' }]}>
        <TextInput
          accessibilityLabel="Expo project folder"
          placeholder="~/projects/my-expo-app"
          placeholderTextColor={colors.muted}
          value={projectPath}
          onChangeText={onPathChange}
          onSubmitEditing={() => {
            if (projectPath.trim() && !disabled && !hasActiveJobs)
              onOpen(projectPath);
          }}
          style={{
            flex: 1,
            minWidth: 180,
            color: colors.text,
            backgroundColor: colors.bg,
            borderColor: colors.line,
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            fontSize: 13,
          }}
        />
        <Button
          primary
          disabled={disabled || !projectPath.trim() || !!hasActiveJobs}
          onPress={() => onOpen(projectPath)}
        >
          Open project
        </Button>
      </View>
      {!!projectError && (
        <Text accessibilityRole="alert" style={s.warning}>
          {projectError}
        </Text>
      )}
      {!!hasActiveJobs && (
        <Text style={s.hint}>
          Stop running commands in Activity before switching projects.
        </Text>
      )}
      {!!recentProjects.length && (
        <View style={{ gap: 8 }}>
          <Text style={s.eyebrow}>RECENT PROJECTS</Text>
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
              <Text style={s.deviceName}>{p.name}</Text>
              <Text style={s.hint}>{p.path}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
