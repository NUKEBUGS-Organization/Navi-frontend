import { useEffect, useState } from "react";
import { Alert, Badge, Button, Group, List, Loader, Modal, Paper, Stack, Text } from "@mantine/core";
import { IconAlertTriangle, IconRefresh, IconSparkles } from "@tabler/icons-react";
import { analyzeStakeholders, type StakeholderAnalysisDto } from "@/api/ai";
import type { ApiError } from "@/api/client";

const QUADRANT_COLOR: Record<string, string> = {
  "Manage closely": "red",
  "Keep satisfied": "blue",
  "Keep informed": "yellow",
  Monitor: "gray",
};

interface Props {
  initiativeId: string;
  opened: boolean;
  onClose: () => void;
}

export default function AiStakeholderAnalysisModal({ initiativeId, opened, onClose }: Props) {
  const [analysis, setAnalysis] = useState<StakeholderAnalysisDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalysis(await analyzeStakeholders(initiativeId));
    } catch (e) {
      setAnalysis(null);
      setError((e as ApiError).message || "Could not analyze stakeholders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened) load();
  }, [opened, initiativeId]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      title={
        <Group gap={6}>
          <IconSparkles size={18} color="var(--mantine-color-violet-6)" />
          <Text fw={700}>Stakeholder engagement plan</Text>
        </Group>
      }
    >
      {loading && (
        <Group justify="center" py="xl">
          <Loader color="violet" size="sm" />
          <Text size="sm" c="dimmed">Analyzing stakeholders…</Text>
        </Group>
      )}
      {error && (
        <Alert color="red" variant="light" mb="md">
          {error}
        </Alert>
      )}
      {!loading && analysis && (
        <Stack gap="md">
          <Text size="sm" style={{ lineHeight: 1.6 }}>{analysis.overview}</Text>
          {analysis.concerns.length > 0 && (
            <List size="sm" spacing={4} icon={<IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />}>
              {analysis.concerns.map((c, i) => (
                <List.Item key={i}>{c}</List.Item>
              ))}
            </List>
          )}
          {analysis.stakeholders.map((s, i) => (
            <Paper key={i} withBorder p="md" radius="md">
              <Group justify="space-between" mb={6}>
                <Text fw={700} size="sm">{s.name}</Text>
                <Badge color={QUADRANT_COLOR[s.quadrant] ?? "gray"} variant="light">{s.quadrant}</Badge>
              </Group>
              <Text size="sm" mb={6}>{s.strategy}</Text>
              <Text size="xs" c="dimmed">
                <b>How often:</b> {s.frequency} · <b>Channel:</b> {s.channel}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                <b>Key message:</b> {s.keyMessage}
              </Text>
            </Paper>
          ))}
          <Group justify="space-between">
            <Text size="xs" c="dimmed">AI recommendations can contain mistakes. Use your judgement.</Text>
            <Button size="xs" variant="default" leftSection={<IconRefresh size={14} />} onClick={load}>
              Regenerate
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
