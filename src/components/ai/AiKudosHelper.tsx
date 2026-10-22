import { useEffect, useState } from "react";
import { Button, Group, SegmentedControl, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { draftKudos, getAiStatus } from "@/api/ai";
import type { ApiError } from "@/api/client";

type Tone = "Warm" | "Formal" | "Enthusiastic";

interface Props {
  initiativeId: string;
  employeeId: string;
  currentNote: string;
  onNote: (note: string) => void;
}

/** Under the kudos note: writes a specific note from the employee's real work, or polishes a rough one. */
export default function AiKudosHelper({ initiativeId, employeeId, currentNote, onNote }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [tone, setTone] = useState<Tone>("Warm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAiStatus()
      .then((s) => setEnabled(!!s.enabled))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const { note } = await draftKudos({
        initiativeId,
        employeeId,
        roughNote: currentNote.trim() || undefined,
        tone,
      });
      onNote(note);
    } catch (e) {
      setError((e as ApiError).message || "Could not write the note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Group gap="xs" wrap="wrap">
        <SegmentedControl size="xs" value={tone} onChange={(v) => setTone(v as Tone)} data={["Warm", "Formal", "Enthusiastic"]} />
        <Button
          size="xs"
          variant="light"
          color="violet"
          leftSection={<IconSparkles size={14} />}
          onClick={run}
          loading={loading}
          disabled={!initiativeId || !employeeId}
        >
          {currentNote.trim() ? "Polish with AI" : "Write with AI"}
        </Button>
      </Group>
      {error && (
        <Text size="xs" c="red" mt={4}>
          {error}
        </Text>
      )}
    </div>
  );
}
