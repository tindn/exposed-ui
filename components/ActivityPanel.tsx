import React, { useRef } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import type { Job } from '../shared/types';
import { Button } from './Button';
import { s } from './styles';

interface Props {
  jobs: Job[];
  activeCount: number;
  selected: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onStop: (id: string) => void;
}
export function ActivityPanel({
  jobs,
  activeCount,
  selected,
  disabled,
  onSelect,
  onStop,
}: Props) {
  const logs = useRef<ScrollView>(null);
  const job = jobs.find((j) => j.id === selected) || jobs.at(-1);
  return (
    <View style={s.console}>
      <View style={s.consoleHeader}>
        <View>
          <Text style={s.heading}>Activity</Text>
          <Text style={s.hint}>
            {activeCount} running · {jobs.length} this session
          </Text>
        </View>
        {job && ['running', 'stopping'].includes(job.status) && (
          <Button
            disabled={disabled || job.status === 'stopping'}
            onPress={() => onStop(job.id)}
          >
            Stop job
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
      <ScrollView
        ref={logs}
        style={s.log}
        onContentSizeChange={() =>
          logs.current?.scrollToEnd({ animated: false })
        }
      >
        <Text selectable style={s.logText}>
          {job
            ? job.logs.join('').replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '') ||
              'Waiting for output…'
            : 'Ready when you are.\n\nStart Metro or choose a device to see command output here.\nYour session stays running when you refresh this page.'}
        </Text>
      </ScrollView>
      <View style={s.consoleFooter}>
        <Text style={s.hint}>
          {job
            ? `${job.status}${job.exitCode != null ? ` · exit ${job.exitCode}` : ''}`
            : 'No commands started'}
        </Text>
        <Text style={s.hint}>SESSION LOG</Text>
      </View>
    </View>
  );
}
