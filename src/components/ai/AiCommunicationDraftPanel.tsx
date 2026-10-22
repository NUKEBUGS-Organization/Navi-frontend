import { useState } from "react";
import { Alert, Button, Collapse, Group, Paper, SegmentedControl, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IconArrowBackUp, IconSparkles } from "@tabler/icons-react";
import { draftCommunication, type CommunicationDraftDto, type DraftCommunicationPayload } from "@/api/ai";
import type { ApiError } from "@/api/client";

type Tone = NonNullable<DraftCommunicationPayload["tone"]>;
type Length = NonNullable<DraftCommunicationPayload["length"]>;

interface Props {
  initiativeId: string;
  type?: string;
  /** Human-readable audience used as the default for the AI (e.g. the preset label). */
  defaultAudience: string;
  currentMessage: string;
  onDraft: (draft: CommunicationDraftDto) => void;
  /** Restores the message from before the last AI draft. */
  onUndo?: () => void;
}

export default function AiCommunicationDraftPanel({
  initiativeId,
  type,
  defaultAudience,
  currentMessage,
  onDraft,
  onUndo,
}: Props) {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<Tone>("Friendly");
  const [length, setLength] = useState<Length>("Medium");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMessage = currentMessage.trim().length > 0;

  const generate = async (rewrite: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const draft = await draftCommunication({
        initiativeId,
        type,
        audience: audience.trim() || defaultAudience,
        tone,
        length,
        instructions: instructions.trim() || undefined,
        existingMessage: rewrite ? currentMessage : undefined,
      });
      onDraft(draft);
    } catch (e) {
      setError((e as ApiError).message || "Could not generate a draft.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder radius="md" p="sm" bg="violet.0">
      <Group justify="space-between">
        <Group gap={6}>
          <IconSparkles size={18} color="var(--mantine-color-violet-6)" />
          <Text size="sm" fw={600}>Write with AI</Text>
        </Group>
        <Button variant="subtle" color="violet" size="compact-sm" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Open"}
        </Button>
      </Group>

      <Collapse in={open}>
        <Stack gap="xs" mt="sm">
          <TextInput
            label="Audience"
            size="xs"
            value={audience}
            onChange={(e) => setAudience(e.currentTarget.value)}
            placeholder={defaultAudience}
          />
          <div>
            <Text size="xs" fw={500} mb={4}>Tone</Text>
            <SegmentedControl
              size="xs"
              fullWidth
              value={tone}
              onChange={(v) => setTone(v as Tone)}
              data={["Formal", "Friendly", "Urgent", "Inspiring"]}
            />
          </div>
          <div>
            <Text size="xs" fw={500} mb={4}>Length</Text>
            <SegmentedControl
              size="xs"
              fullWidth
              value={length}
              onChange={(v) => setLength(v as Length)}
              data={["Short", "Medium", "Long"]}
            />
          </div>
          <Textarea
            label="Extra instructions (optional)"
            size="xs"
            value={instructions}
            onChange={(e) => setInstructions(e.currentTarget.value)}
            placeholder="e.g. Mention training sessions start next Monday"
            autosize
            minRows={1}
            maxRows={4}
            maxLength={1000}
          />
          {error && (
            <Alert color="red" variant="light" p="xs">
              <Text size="xs">{error}</Text>
            </Alert>
          )}
          <Group justify="flex-end" gap="xs">
            {onUndo && (
              <Button variant="default" size="xs" leftSection={<IconArrowBackUp size={14} />} onClick={onUndo} disabled={loading}>
                Undo
              </Button>
            )}
            {hasMessage && (
              <Button variant="light" color="violet" size="xs" onClick={() => generate(true)} loading={loading}>
                Improve current message
              </Button>
            )}
            <Button color="violet" size="xs" leftSection={<IconSparkles size={14} />} onClick={() => generate(false)} loading={loading}>
              {hasMessage ? "Generate new draft" : "Generate draft"}
            </Button>
          </Group>
          <Text size="xs" c="dimmed">AI drafts can contain mistakes. Review before sending.</Text>
        </Stack>
      </Collapse>
    </Paper>
  );
}
