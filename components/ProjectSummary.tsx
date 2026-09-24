import React from 'react';
import { View, Text } from 'react-native';
import type { Project } from '../shared/types';
import { s } from './styles';

interface Props {
  project: Project | null;
}
export function ProjectSummary({ project }: Props) {
  return (
    <View style={s.projectRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.eyebrow}>WORKSPACE</Text>
        <Text style={s.projectName}>
          {project?.name || 'Connect your project'}
        </Text>
        <Text selectable style={s.path}>
          {project?.path || 'Paste the folder path of your Expo app below.'}
        </Text>
      </View>
      <Text style={s.meta}>{project?.expo ? `EXPO ${project.expo}` : ''}</Text>
    </View>
  );
}
