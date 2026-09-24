import React from 'react';
import { Text } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSession, selectDisabled } from '../state/session';
import { Header } from './Header';
import { ProjectSummary } from './ProjectSummary';
import { ProjectPicker } from './ProjectPicker';
import { MetroPanel } from './MetroPanel';
import { DevicesPanel } from './DevicesPanel';
import { ActivityPanel } from './ActivityPanel';
import { s } from './styles';

export function SessionHeader() {
  const connected = useSession((state) => state.connected);
  const token = useSession((state) => state.token);
  return <Header connected={connected} token={token} />;
}
export function SessionProjectSummary() {
  const project = useSession((state) => state.project);
  return <ProjectSummary project={project} />;
}
export function SessionProjectPicker() {
  const { hasProject, recentProjects, projectError, hasActiveJobs, action } =
    useSession(
      useShallow((state) => ({
        hasProject: !!state.project,
        recentProjects: state.recentProjects,
        projectError: state.projectError,
        hasActiveJobs: !!state.active.length,
        action: state.action,
      })),
    );
  const disabled = useSession(selectDisabled);
  return (
    <ProjectPicker
      {...{ hasProject, recentProjects, projectError, hasActiveJobs, disabled }}
      onOpen={(path) => action('project', { path })}
    />
  );
}
export function SessionMetroPanel() {
  const { metro, hasProject, action } = useSession(
    useShallow((state) => ({
      metro: state.active.find((job) => job.kind === 'metro'),
      hasProject: !!state.project,
      action: state.action,
    })),
  );
  const disabled = useSession(selectDisabled);
  return (
    <MetroPanel
      {...{ metro, hasProject, disabled }}
      onStart={(clear) => action('run', { action: 'metro', clear })}
      onStop={(id) => action('stop', { id })}
    />
  );
}
export function SessionDevicesPanel() {
  const { devices, warnings, scanning, hasProject, active, action } =
    useSession(
      useShallow((state) => ({
        devices: state.devices,
        warnings: state.warnings,
        scanning: state.scanning,
        hasProject: !!state.project,
        active: state.active,
        action: state.action,
      })),
    );
  const disabled = useSession(selectDisabled);
  return (
    <DevicesPanel
      {...{ devices, warnings, scanning, hasProject, active, disabled }}
      onRefresh={() => action('refresh')}
      onBoot={(device) =>
        action('run', {
          action: 'boot',
          deviceId: device.id,
          deviceType: device.type,
        })
      }
      onBuild={(device) =>
        action('run', {
          action: 'build',
          deviceId: device.id,
          deviceType: device.type,
        })
      }
    />
  );
}
export function SessionActivityPanel() {
  const { jobs, activeCount, selected, select, action } = useSession(
    useShallow((state) => ({
      jobs: state.jobs,
      activeCount: state.active.length,
      selected: state.selected,
      select: state.select,
      action: state.action,
    })),
  );
  const disabled = useSession(selectDisabled);
  return (
    <ActivityPanel
      {...{ jobs, activeCount, selected, disabled }}
      onSelect={select}
      onStop={(id) => action('stop', { id })}
    />
  );
}
export function SessionErrors() {
  const error = useSession((state) => state.error);
  const token = useSession((state) => state.token);
  return (
    <>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {!token && (
        <Text style={s.error}>
          Open the full session URL printed by the CLI. For UI development,
          export the web build and launch bin/cli.js.
        </Text>
      )}
    </>
  );
}
