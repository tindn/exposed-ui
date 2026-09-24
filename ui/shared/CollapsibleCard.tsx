import { useState, type PropsWithChildren } from 'react';
import { Pressable } from 'react-native';
import { Card } from './Card';
import { Row } from './Layout';
import { Typography } from './Typography';

export function CollapsibleCard({
  title,
  summary,
  children,
}: PropsWithChildren<{ title: string; summary?: string }>) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
      >
        <Row distribution="between">
          <Typography variant="heading">{title}</Typography>
          <Typography variant="hint">
            {summary ? `${summary} · ` : ''}
            {expanded ? 'Hide ▴' : 'Show ▾'}
          </Typography>
        </Row>
      </Pressable>
      {expanded && children}
    </Card>
  );
}
