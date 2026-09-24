import { useEffect } from 'react';
import { connectSession } from './state/session';
import { DashboardLayout } from './ui/DashboardLayout';
import { Typography } from './ui/shared/Typography';
import { Stack } from './ui/shared/Layout';
import {
  SessionHeader,
  SessionProjectSummary,
  SessionProjectPicker,
  SessionScriptsPanel,
  SessionDevicesPanel,
  SessionActivityPanel,
  SessionErrors,
} from './ui/SessionPanels';

export default function App() {
  useEffect(connectSession, []);
  return (
    <DashboardLayout
      header={<SessionHeader />}
      project={
        <Stack spacing="roomy">
          <SessionProjectSummary />
          <SessionProjectPicker />
          <SessionErrors />
        </Stack>
      }
      devices={<SessionDevicesPanel />}
      scripts={<SessionScriptsPanel />}
      activity={<SessionActivityPanel />}
      footer={
        <Typography variant="eyebrow">
          EXPOSED UI / YOUR PROJECT, IN VIEW.
        </Typography>
      }
    />
  );
}
