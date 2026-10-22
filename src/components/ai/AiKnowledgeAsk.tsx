import { useState } from "react";
import { Alert, Badge, Button, Card, Group, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconFile, IconMessage, IconSparkles } from "@tabler/icons-react";
import { askKnowledge, type KnowledgeAnswerDto } from "@/api/ai";
import type { ApiError } from "@/api/client";

const SNIPPET_CHARS = 280;

export default function AiKnowledgeAsk({ initiativeId }: { initiativeId: string }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<KnowledgeAnswerDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    const q = question.trim();
    if (q.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await askKnowledge(initiativeId, q));
    } catch (e) {
      setResult(null);
      setError((e as ApiError).message || "Could not answer that question.");
    } finally {
      setLoading(false);
    }
  };

  const cited = new Set(result?.citedSources ?? []);

  return (
    <Card withBorder radius="md" p="lg" mb="lg" bg="violet.0">
      <Group gap={6} mb="sm">
        <IconSparkles size={18} color="var(--mantine-color-violet-6)" />
        <Title order={5}>Ask the Knowledge Hub</Title>
      </Group>
      <Group align="flex-start" wrap="nowrap">
        <TextInput
          style={{ flex: 1 }}
          placeholder="e.g. How do I reset my password in the new system?"
          value={question}
          onChange={(e) => setQuestion(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          maxLength={500}
        />
        <Button color="violet" onClick={ask} loading={loading} disabled={question.trim().length < 2}>
          Ask
        </Button>
      </Group>

      {error && (
        <Alert color="red" variant="light" mt="md">
          {error}
        </Alert>
      )}

      {result && (
        <Stack gap="sm" mt="md">
          <Paper p="md" radius="md" withBorder>
            <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {result.answer}
            </Text>
          </Paper>
          {result.sources.length > 0 && (
            <>
              <Text size="xs" fw={700} c="dimmed">
                Sources
              </Text>
              {result.sources
                .filter((s) => !result.answered || cited.has(s.index))
                .map((s) => (
                  <Paper key={s.entryId} p="sm" radius="md" withBorder>
                    <Group gap="xs" mb={4}>
                      <Badge size="sm" color="violet" variant="light">
                        [{s.index}]
                      </Badge>
                      {s.kind === "file" ? <IconFile size={14} /> : <IconMessage size={14} />}
                      <Text size="xs" fw={600}>
                        {s.kind === "file" ? s.originalFileName : "Post"} · {s.authorName}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                      {s.snippet.length > SNIPPET_CHARS ? `${s.snippet.slice(0, SNIPPET_CHARS)}…` : s.snippet}
                    </Text>
                  </Paper>
                ))}
            </>
          )}
          <Text size="xs" c="dimmed">
            Answers come only from this initiative's Knowledge Hub and can contain mistakes. Check the sources.
          </Text>
        </Stack>
      )}
    </Card>
  );
}
