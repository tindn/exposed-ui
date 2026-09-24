import type { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { colors } from './shared/theme';
import { Stack } from './shared/Layout';
import { Card } from './shared/Card';

interface Props {
  header: ReactNode;
  project: ReactNode;
  devices: ReactNode;
  scripts: ReactNode;
  activity: ReactNode;
  footer: ReactNode;
}
export function DashboardLayout({
  header,
  project,
  devices,
  scripts,
  activity,
  footer,
}: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  return (
    <View style={styles.root}>
      {header}
      <ScrollView contentContainerStyle={styles.page}>
        <Stack spacing="roomy">
          {project}
          {devices}
          <Card>
            <View style={[styles.columns, compact && styles.compact]}>
              <View style={[styles.sidebar, compact && styles.fullWidth]}>
                {scripts}
              </View>
              <View style={styles.activity}>{activity}</View>
            </View>
          </Card>
          {footer}
        </Stack>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  page: { padding: 32, maxWidth: 1600, width: '100%', alignSelf: 'center' },
  columns: { flexDirection: 'row', gap: 22, alignItems: 'stretch' },
  compact: { flexDirection: 'column' },
  sidebar: { width: 370, minWidth: 0 },
  fullWidth: { width: '100%' },
  activity: { flex: 1, minWidth: 0 },
});
