import { useEffect, useState } from "react";
import { Alert, Badge, Button, Group, List, Paper, Select, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconArrowRight, IconCircleCheck, IconSparkles, IconUsers } from "@tabler/icons-react";
import { getAssessmentInsights, type AssessmentInsightsDto } from "@/api/ai";
import { listAssessmentsByInitiative, type Assessment } from "@/api/assessments";
import type { ApiError } from "@/api/client";

function Section({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  if (!items.length) return null;
  return (
    <div>
      <Text size="sm" fw={700} mb={4}>{title}</Text>
      <List size="sm" spacing={4} icon={icon}>
        {items.map((x, i) => (
          <List.Item key={i}>{x}</List.Item>
        ))}
      </List>
    </div>
  );
}

export default function AiAssessmentInsightsCard({ initiativeId }: { initiativeId: string }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [insights, setInsights] = useState<AssessmentInsightsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAssessmentsByInitiative(initiativeId)
      .then((list) => {
        const published = (Array.isArray(list) ? list : []).filter((a) => a.status !== "DRAFT");
        setAssessments(published);
        if (published.length) setSelectedId(published[0]._id);
      })
      .catch(() => setAssessments([]));
  }, [initiativeId]);

  const generate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      setInsights(await getAssessmentInsights(selectedId));
    } catch (e) {
      setInsights(null);
      setError((e as ApiError).message || "Could not summarize the results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <Group gap={8} mb="md">
        <IconSparkles size={20} color="var(--mantine-color-violet-6)" />
        <Title order={4} fw={800}>Assessment insights</Title>
      </Group>

      {assessments.length === 0 ? (
        <Text size="sm" c="dimmed">No published assessments for this initiative yet.</Text>
      ) : (
        <Group align="flex-end" mb="md">
          <Select
            label="Assessment"
            data={assessments.map((a) => ({ value: a._id, label: a.name }))}
            value={selectedId}
            onChange={(v) => {
              setSelectedId(v);
              setInsights(null);
              setError(null);
            }}
            w={300}
            size="sm"
          />
          <Button color="violet" size="sm" leftSection={<IconSparkles size={14} />} onClick={generate} loading={loading} disabled={!selectedId}>
            {insights ? "Regenerate" : "Summarize results"}
          </Button>
        </Group>
      )}

      {error && (
        <Alert color="red" variant="light" mb="md">
          {error}
        </Alert>
      )}

      {insights && (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">Respondents</Text>
              <Group gap={4}><IconUsers size={16} /><Text fw={700}>{insights.respondents}</Text></Group>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">Avg NAVI index</Text>
              <Text fw={700}>{insights.averageNaviIndex ?? "—"}</Text>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">Avg score</Text>
              <Text fw={700}>{insights.averageScore ?? "—"}</Text>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">Readiness</Text>
              <Badge color="violet" variant="light">{insights.overallReadiness}</Badge>
            </Paper>
          </SimpleGrid>
          <Text size="sm" style={{ lineHeight: 1.6 }}>{insights.summary}</Text>
          <Section title="Strengths" items={insights.strengths} icon={<IconCircleCheck size={16} color="var(--mantine-color-teal-6)" />} />
          <Section title="Gaps" items={insights.gaps} icon={<IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />} />
          <Section title="By department" items={insights.departmentNotes} icon={<IconUsers size={16} color="var(--mantine-color-blue-6)" />} />
          <Section title="Recommended actions" items={insights.recommendedActions} icon={<IconArrowRight size={16} color="var(--mantine-color-violet-6)" />} />
          <Text size="xs" c="dimmed">
            Generated {new Date(insights.generatedAt).toLocaleString()} from each person's latest submission. AI analysis can
            contain mistakes.
          </Text>
        </Stack>
      )}
    </Paper>
  );
}
