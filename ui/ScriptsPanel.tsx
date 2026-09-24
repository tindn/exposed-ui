import { ScrollView } from 'react-native';
import type { Project, Job } from '../shared/types';
import { Row, Stack } from './shared/Layout';
import { Typography } from './shared/Typography';
import { ScriptCommand } from './ScriptCommand';
import { Button } from './shared/Button';

interface Props {
  project: Project | null;
  active: Pick<Job, 'id' | 'kind' | 'status'>[];
  disabled: boolean;
  onRun: (name: string, args: string[]) => void;
  onStop: (id: string) => void;
  onRefresh: () => void;
}
export function ScriptsPanel({
  project,
  active,
  disabled,
  onRun,
  onStop,
  onRefresh,
}: Props) {
  const scripts = Object.entries(project?.scripts || {});
  return (
    <Stack>
      <Row distribution="between">
        <Typography variant="heading">Project scripts</Typography>
        <Button disabled={disabled || !project} onPress={onRefresh}>
          Refresh scripts
        </Button>
      </Row>
      <Typography variant="body">
        {project
          ? `From package.json · ${project.packageManager} run`
          : 'Open a project to see its commands.'}
      </Typography>
      <ScrollView style={{ maxHeight: 420 }}>
        <Stack>
          {scripts.map(([name, command]) => {
            const running = active.find((job) => job.kind === `script:${name}`);
            return (
              <ScriptCommand
                key={`${project?.path}:${name}`}
                name={name}
                command={command}
                running={running}
                disabled={disabled}
                onRun={(args) => onRun(name, args)}
                onStop={() => running && onStop(running.id)}
              />
            );
          })}
          {project && !scripts.length && (
            <Typography variant="hint">
              No scripts defined in this project’s package.json.
            </Typography>
          )}
        </Stack>
      </ScrollView>
    </Stack>
  );
}
