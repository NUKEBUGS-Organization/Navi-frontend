import { useState } from "react";
import { Alert, Badge, Button, Group, List, Paper, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck, IconRefresh, IconSparkles } from "@tabler/icons-react";
import { getInitiativeHealth, type InitiativeHealthDto } from "@/api/ai";
import type { ApiError } from "@/api/client";

const STATUS_COLOR: Record<InitiativeHealthDto["status"], string> = {
  "On Track": "teal",
  "At Risk": "yellow",
  "Off Track": "red",
};

const PRIORITY_COLOR: Record<string, string> = { High: "red", Medium: "yellow", Low: "gray" };

export default function AiInitiativeHealthCard({ initiativeId }: { initiativeId: string }) {
  const [health, setHealth] = useState<InitiativeHealthDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      setHealth(await getInitiativeHealth(initiativeId));
    } catch (e) {
      setError((e as ApiError).message || "Could not generate the summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <IconSparkles size={20} color="var(--mantine-color-violet-6)" />
          <Title order={4} fw={800}>Health summary</Title>
        </Group>
        <Button
          color="violet"
          variant={health ? "light" : "filled"}
          size="xs"
          leftSection={health ? <IconRefresh size={14} /> : <IconSparkles size={14} />}
          onClick={generate}
          loading={loading}
        >
          {health ? "Regenerate" : "Generate summary"}
        </Button>
      </Group>

      {error && (
        <Alert color="red" variant="light" mb="md">
          {error}
        </Alert>
      )}

      {!health && !error && (
        <Text size="sm" c="dimmed">
          Get an AI status report built from this initiative's tasks, risks, adoption milestones, stakeholders and
          communications.
        </Text>
      )}

      {health && (
        <Stack gap="md">
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <Badge color={STATUS_COLOR[health.status]} size="lg" variant="filled" style={{ flexShrink: 0 }}>
              {health.status}
            </Badge>
            <Text fw={600}>{health.headline}</Text>
          </Group>
          <Text size="sm" style={{ lineHeight: 1.6 }}>
            {health.summary}
          </Text>

          {health.highlights.length > 0 && (
            <div>
              <Text size="sm" fw={700} mb={4}>Going well</Text>
              <List size="sm" spacing={4} icon={<IconCircleCheck size={16} color="var(--mantine-color-teal-6)" />}>
                {health.highlights.map((h, i) => (
                  <List.Item key={i}>{h}</List.Item>
                ))}
              </List>
            </div>
          )}

          {health.concerns.length > 0 && (
            <div>
              <Text size="sm" fw={700} mb={4}>Concerns</Text>
              <List size="sm" spacing={4} icon={<IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />}>
                {health.concerns.map((c, i) => (
                  <List.Item key={i}>{c}</List.Item>
                ))}
              </List>
            </div>
          )}

          {health.nextActions.length > 0 && (
            <div>
              <Text size="sm" fw={700} mb={6}>Recommended next actions</Text>
              <Stack gap={6}>
                {health.nextActions.map((a, i) => (
                  <Group key={i} gap="xs" wrap="nowrap" align="flex-start">
                    <Badge size="sm" variant="light" color={PRIORITY_COLOR[a.priority] ?? "gray"} style={{ flexShrink: 0 }}>
                      {a.priority}
                    </Badge>
                    <Text size="sm">
                      {a.action}{" "}
                      <Text span size="xs" c="dimmed">
                        · {a.area}
                      </Text>
                    </Text>
                  </Group>
                ))}
              </Stack>
            </div>
          )}

          <Text size="xs" c="dimmed">
            Generated {new Date(health.generatedAt).toLocaleString()}. AI analysis can contain mistakes; verify before
            acting.
          </Text>
        </Stack>
      )}
    </Paper>
  );
}
