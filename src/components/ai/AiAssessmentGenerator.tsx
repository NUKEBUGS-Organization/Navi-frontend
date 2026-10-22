import { useEffect, useState } from "react";
import { Alert, Button, Collapse, Group, NumberInput, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { generateAssessment, getAiStatus, type GeneratedAssessmentStepDto } from "@/api/ai";
import type { ApiError } from "@/api/client";

type Audience = "Leadership" | "Employees";
type Stage = "Pre-change" | "During change" | "Post-change";

interface Props {
  /** Initiative chosen in the form, if any; questions are tailored to it. */
  initiativeId?: string;
  /** True when the form already has questions the generated set would replace. */
  hasQuestions: boolean;
  onSteps: (steps: GeneratedAssessmentStepDto[]) => void;
}

/** In the create-assessment form: generates NAVI-tagged questions. Hidden when AI is off. */
export default function AiAssessmentGenerator({ initiativeId, hasQuestions, onSteps }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<Audience>("Employees");
  const [stage, setStage] = useState<Stage>("Pre-change");
  const [perPillar, setPerPillar] = useState<number>(4);
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAiStatus()
      .then((s) => setEnabled(!!s.enabled))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  const run = async () => {
    if (hasQuestions && !window.confirm("Replace the current questions with AI-generated ones?")) return;
    setLoading(true);
    setError(null);
    try {
      const { steps } = await generateAssessment({
        initiativeId: initiativeId || undefined,
        audience,
        stage,
        questionsPerPillar: perPillar,
        focus: focus.trim() || undefined,
      });
      onSteps(steps);
    } catch (e) {
      setError((e as ApiError).message || "Could not generate questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="sm" radius="md" bg="violet.0">
      <Group justify="space-between">
        <Group gap={6}>
          <IconSparkles size={18} color="var(--mantine-color-violet-6)" />
          <Text size="sm" fw={600}>Or generate questions with AI</Text>
        </Group>
        <Button variant="subtle" color="violet" size="compact-sm" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Open"}
        </Button>
      </Group>
      <Collapse in={open}>
        <Stack gap="xs" mt="sm">
          <Group grow>
            <Select
              label="Audience"
              size="xs"
              data={["Employees", "Leadership"]}
              value={audience}
              onChange={(v) => v && setAudience(v as Audience)}
              allowDeselect={false}
            />
            <Select
              label="Stage"
              size="xs"
              data={["Pre-change", "During change", "Post-change"]}
              value={stage}
              onChange={(v) => v && setStage(v as Stage)}
              allowDeselect={false}
            />
            <NumberInput
              label="Questions per pillar"
              size="xs"
              min={2}
              max={8}
              value={perPillar}
              onChange={(v) => setPerPillar(Math.min(8, Math.max(2, Number(v) || 4)))}
            />
          </Group>
          <TextInput
            label="Focus (optional)"
            size="xs"
            placeholder="e.g. training readiness and night-shift concerns"
            value={focus}
            onChange={(e) => setFocus(e.currentTarget.value)}
            maxLength={500}
          />
          {error && (
            <Alert color="red" variant="light" p="xs">
              <Text size="xs">{error}</Text>
            </Alert>
          )}
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {initiativeId ? "Tailored to the selected initiative." : "Pick an initiative above to tailor the questions."}{" "}
              Tagged N/A/V/I for NAVI scoring.
            </Text>
            <Button color="violet" size="xs" leftSection={<IconSparkles size={14} />} onClick={run} loading={loading}>
              Generate
            </Button>
          </Group>
        </Stack>
      </Collapse>
    </Paper>
  );
}
