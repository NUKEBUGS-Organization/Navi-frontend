import { useEffect, useState } from "react";
import { Alert, Badge, Button, Group, Loader, Modal, Paper, Stack, Text } from "@mantine/core";
import { IconCheck, IconPlus, IconRefresh, IconSparkles } from "@tabler/icons-react";
import { suggestRisks, type RiskSuggestionDto } from "@/api/ai";
import { createRisk } from "@/api/risks";
import type { ApiError } from "@/api/client";

const SEVERITY_COLOR: Record<string, string> = { Critical: "red", High: "red", Medium: "orange", Low: "green" };

interface Props {
  initiativeId: string;
  opened: boolean;
  onClose: () => void;
  /** Called after a suggestion is saved as a real risk. */
  onAdded: () => void;
}

export default function AiRiskSuggestionsModal({ initiativeId, opened, onClose, onAdded }: Props) {
  const [suggestions, setSuggestions] = useState<RiskSuggestionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [addingIndex, setAddingIndex] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setAdded(new Set());
    try {
      const res = await suggestRisks(initiativeId);
      setSuggestions(res.risks);
    } catch (e) {
      setError((e as ApiError).message || "Could not get suggestions.");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened) load();
  }, [opened, initiativeId]);

  const add = async (s: RiskSuggestionDto, index: number) => {
    setAddingIndex(index);
    try {
      await createRisk({
        initiativeId,
        title: s.title,
        description: s.description,
        severity: s.severity,
        status: "Open",
        mitigationNotes: s.mitigationNotes,
      });
      setAdded((prev) => new Set(prev).add(index));
      onAdded();
    } catch (e) {
      setError((e as ApiError).message || "Could not add the risk.");
    } finally {
      setAddingIndex(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      title={
        <Group gap={6}>
          <IconSparkles size={18} color="var(--mantine-color-violet-6)" />
          <Text fw={700}>AI risk suggestions</Text>
        </Group>
      }
    >
      {loading && (
        <Group justify="center" py="xl">
          <Loader color="violet" size="sm" />
          <Text size="sm" c="dimmed">Analyzing the initiative…</Text>
        </Group>
      )}
      {error && (
        <Alert color="red" variant="light" mb="md">
          {error}
        </Alert>
      )}
      {!loading && (
        <Stack gap="sm">
          {suggestions.map((s, i) => (
            <Paper key={i} withBorder p="md" radius="md">
              <Group justify="space-between" wrap="nowrap" align="flex-start" mb={4}>
                <Group gap="xs" wrap="nowrap">
                  <Badge color={SEVERITY_COLOR[s.severity] ?? "gray"} variant="light">{s.severity}</Badge>
                  <Text fw={600} size="sm">{s.title}</Text>
                </Group>
                <Button
                  size="xs"
                  variant={added.has(i) ? "subtle" : "light"}
                  color={added.has(i) ? "teal" : "violet"}
                  leftSection={added.has(i) ? <IconCheck size={14} /> : <IconPlus size={14} />}
                  disabled={added.has(i)}
                  loading={addingIndex === i}
                  onClick={() => add(s, i)}
                >
                  {added.has(i) ? "Added" : "Add"}
                </Button>
              </Group>
              <Text size="sm" mb={6}>{s.description}</Text>
              <Text size="xs" c="dimmed" mb={4}>
                <b>Mitigation:</b> {s.mitigationNotes}
              </Text>
              <Text size="xs" c="dimmed" fs="italic">Why: {s.rationale}</Text>
            </Paper>
          ))}
          {!error && suggestions.length === 0 && <Text size="sm" c="dimmed">No new risks suggested.</Text>}
          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">Suggestions can contain mistakes. Review before adding.</Text>
            <Button size="xs" variant="default" leftSection={<IconRefresh size={14} />} onClick={load}>
              Suggest again
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
