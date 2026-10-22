import { useState } from "react";
import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { assessRisk, type RiskAssessmentDto } from "@/api/ai";
import type { ApiError } from "@/api/client";

interface Props {
  initiativeId: string;
  title: string;
  description: string;
  currentMitigation: string;
  onSeverity: (severity: string) => void;
  onMitigation: (text: string) => void;
}

/** Sits in the risk form: rates severity and proposes mitigation for the risk being edited. */
export default function AiRiskAssessButton({
  initiativeId,
  title,
  description,
  currentMitigation,
  onSeverity,
  onMitigation,
}: Props) {
  const [result, setResult] = useState<RiskAssessmentDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await assessRisk({ initiativeId, title: title.trim(), description: description.trim() || undefined });
      setResult(r);
      onSeverity(r.severity);
      // Never overwrite mitigation the user already wrote; offer it instead.
      if (!currentMitigation.trim()) onMitigation(r.mitigationNotes);
    } catch (e) {
      setError((e as ApiError).message || "Could not assess this risk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap={6}>
      <Group>
        <Button
          size="xs"
          variant="light"
          color="violet"
          leftSection={<IconSparkles size={14} />}
          onClick={run}
          loading={loading}
          disabled={title.trim().length < 3}
        >
          AI: assess severity & mitigation
        </Button>
      </Group>
      {error && (
        <Alert color="red" variant="light" p="xs">
          <Text size="xs">{error}</Text>
        </Alert>
      )}
      {result && (
        <Alert color="violet" variant="light" p="xs">
          <Text size="xs">
            <b>Suggested severity: {result.severity}.</b> {result.rationale}
          </Text>
          {currentMitigation.trim() && currentMitigation.trim() !== result.mitigationNotes && (
            <Group gap="xs" mt={6} wrap="nowrap" align="flex-start">
              <Text size="xs" style={{ flex: 1 }}>
                <b>Suggested mitigation:</b> {result.mitigationNotes}
              </Text>
              <Button size="compact-xs" variant="white" color="violet" onClick={() => onMitigation(result.mitigationNotes)}>
                Use this
              </Button>
            </Group>
          )}
        </Alert>
      )}
    </Stack>
  );
}
