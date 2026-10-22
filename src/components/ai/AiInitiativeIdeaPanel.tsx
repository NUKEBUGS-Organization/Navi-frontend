import { useEffect, useState } from "react";
import { Alert, Button, Group, Paper, Text, Textarea } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { draftInitiative, getAiStatus, type InitiativeDraftDto } from "@/api/ai";
import type { ApiError } from "@/api/client";

interface Props {
  departments: string[];
  /** True when the wizard already has a title or description the draft would replace. */
  hasContent: boolean;
  onApply: (draft: InitiativeDraftDto) => void;
}

/** Top of the create-initiative wizard: turns a short idea into a filled-in draft. Hidden when AI is off. */
export default function AiInitiativeIdeaPanel({ departments, hasContent, onApply }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    getAiStatus()
      .then((s) => setEnabled(!!s.enabled))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  const generate = async () => {
    if (hasContent && !window.confirm("Replace the title, description, goals and FAQs you've entered with an AI draft?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      onApply(await draftInitiative(idea.trim(), departments));
      setApplied(true);
    } catch (e) {
      setError((e as ApiError).message || "Could not draft the initiative.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder radius="md" p="lg" bg="violet.0">
      <Group gap={6} mb="xs">
        <IconSparkles size={20} color="var(--mantine-color-violet-6)" />
        <Text fw={800}>Start with AI</Text>
      </Group>
      <Text size="sm" c="dimmed" mb="sm">
        Describe the change in a few sentences. AI fills in the title, description, change type, goals, FAQs, affected
        departments and timeline. You can edit everything before saving.
      </Text>
      <Textarea
        placeholder="e.g. We're replacing our paper-based shift handover with a tablet app for all warehouse staff, starting next quarter. Supervisors need training and we expect resistance from night shifts."
        value={idea}
        onChange={(e) => setIdea(e.currentTarget.value)}
        autosize
        minRows={3}
        maxRows={8}
        maxLength={3000}
      />
      {error && (
        <Alert color="red" variant="light" mt="sm" p="xs">
          <Text size="xs">{error}</Text>
        </Alert>
      )}
      <Group justify="space-between" mt="sm">
        <Text size="xs" c={applied ? "teal" : "dimmed"}>
          {applied ? "Draft applied below. Review each section." : "Lead, sponsor and RACI stay for you to choose."}
        </Text>
        <Button color="violet" leftSection={<IconSparkles size={16} />} onClick={generate} loading={loading} disabled={idea.trim().length < 15}>
          {applied ? "Regenerate" : "Draft initiative"}
        </Button>
      </Group>
    </Paper>
  );
}
