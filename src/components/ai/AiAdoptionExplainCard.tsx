import { useState } from "react";
import { Alert, Badge, Button, Group, List, Paper, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight, IconRefresh, IconSparkles } from "@tabler/icons-react";
import { explainAdoption, type AdoptionExplanationDto } from "@/api/ai";
import type { ApiError } from "@/api/client";

const ASSESSMENT_COLOR: Record<string, string> = {
  Achieved: "teal",
  Ahead: "teal",
  "On pace": "blue",
  Behind: "orange",
  Overdue: "red",
  "Not started": "gray",
};

export default function AiAdoptionExplainCard({ initiativeId }: { initiativeId: string }) {
  const [result, setResult] = useState<AdoptionExplanationDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await explainAdoption(initiativeId));
    } catch (e) {
      setResult(null);
      setError((e as ApiError).message || "Could not explain adoption.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="lg" radius="md">
      <Group justify="space-between" mb={result || error ? "md" : 0}>
        <Group gap={8}>
          <IconSparkles size={20} color="var(--mantine-color-violet-6)" />
          <Title order={5} fw={800}>Adoption explained</Title>
        </Group>
        <Button
          color="violet"
          variant={result ? "light" : "filled"}
          size="xs"
          leftSection={result ? <IconRefresh size={14} /> : <IconSparkles size={14} />}
          onClick={run}
          loading={loading}
        >
          {result ? "Regenerate" : "Explain adoption"}
        </Button>
      </Group>

      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}

      {result && (
        <Stack gap="sm">
          <Text size="sm" style={{ lineHeight: 1.6 }}>{result.overview}</Text>
          {result.milestones.map((m, i) => (
            <Paper key={i} withBorder p="sm" radius="md">
              <Group gap="xs" mb={4}>
                <Badge color={ASSESSMENT_COLOR[m.assessment] ?? "gray"} variant="light">{m.assessment}</Badge>
                <Text fw={600} size="sm">{m.milestone}</Text>
              </Group>
              <Text size="sm">{m.explanation}</Text>
              <Text size="xs" c="dimmed" mt={4}>
                <b>Next step:</b> {m.suggestion}
              </Text>
            </Paper>
          ))}
          {result.interventions.length > 0 && (
            <div>
              <Text size="sm" fw={700} mb={4}>Ways to lift adoption</Text>
              <List size="sm" spacing={4} icon={<IconArrowRight size={16} color="var(--mantine-color-violet-6)" />}>
                {result.interventions.map((x, i) => (
                  <List.Item key={i}>{x}</List.Item>
                ))}
              </List>
            </div>
          )}
          <Text size="xs" c="dimmed">
            Based on current milestone figures (no history is stored). AI analysis can contain mistakes.
          </Text>
        </Stack>
      )}
    </Paper>
  );
}
