import { JobTerminal } from './JobTerminal';
import { StyleSheet } from 'react-native';
import { colors } from './shared/theme';
import { Typography } from './shared/Typography';
import { View, Text, Pressable, ScrollView } from 'react-native';
import type { Job } from '../shared/types';
import { Button } from './shared/Button';

interface Props {
  jobs: Job[];
  activeCount: number;
  selected: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onStop: (id: string) => void;
  onClear: (id: string) => void;
}
export function ActivityPanel({
  jobs,
  activeCount,
  selected,
  disabled,
  onSelect,
  onStop,
  onClear,
}: Props) {
  const job = jobs.find((j) => j.id === selected) || jobs.at(-1);
  return (
    <View style={s.console}>
      <View style={s.consoleHeader}>
        <View>
          <Typography variant="heading">Activity</Typography>
          <Typography variant="hint">
            {activeCount} running · {jobs.length} this session
          </Typography>
        </View>
        {job && ['running', 'stopping'].includes(job.status) && (
          <Button
            disabled={disabled || job.status === 'stopping'}
            onPress={() => onStop(job.id)}
          >
            Stop job
          </Button>
        )}
        {job && !['running', 'stopping'].includes(job.status) && (
          <Button disabled={disabled} onPress={() => onClear(job.id)}>
            Clear job
          </Button>
        )}
      </View>
      <ScrollView
        horizontal
        style={s.tabs}
        contentContainerStyle={{ gap: 8, padding: 14 }}
      >
        {jobs.map((j) => (
          <Pressable
            key={j.id}
            onPress={() => onSelect(j.id)}
            style={[s.tab, j.id === job?.id && s.tabSelected]}
          >
            <Text style={s.tabText}>
              {j.label} · {j.status}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {job ? (
        <JobTerminal key={job.id} job={job} />
      ) : (
        <View style={s.log}>
          <Typography variant="hint">
            Run a project script or choose a device to open a terminal.
          </Typography>
        </View>
      )}
      <View style={s.consoleFooter}>
        <Typography variant="hint">
          {job
            ? `${job.status}${job.exitCode != null ? ` · exit ${job.exitCode}` : ''}`
            : 'No commands started'}
        </Typography>
        <Typography variant="hint">SESSION LOG</Typography>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  console: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#0b0e0c',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 540,
    maxHeight: 780,
  },
  consoleHeader: {
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  tabs: { flexGrow: 0, maxHeight: 66 },
  tab: { padding: 10, borderRadius: 6, backgroundColor: colors.panel },
  tabSelected: { backgroundColor: '#34422c' },
  tabText: { color: colors.text, fontSize: 11 },
  log: { flex: 1, padding: 22 },
  logText: {
    color: '#c5d3be',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 21,
  },
  consoleFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
