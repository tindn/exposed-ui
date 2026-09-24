import { StyleSheet } from 'react-native';
import { colors } from './shared/theme';
import { Typography } from './shared/Typography';
import { View, Text } from 'react-native';
import type { Project } from '../shared/types';

interface Props {
  project: Project | null;
}
export function ProjectSummary({ project }: Props) {
  return (
    <View style={s.projectRow}>
      <View style={{ flex: 1 }}>
        <Typography variant="eyebrow">WORKSPACE</Typography>
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

const s = StyleSheet.create({
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  projectName: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -1,
  },
  path: { color: colors.muted, fontSize: 12, marginTop: 8 },
  meta: { color: colors.muted, fontSize: 11 },
});
