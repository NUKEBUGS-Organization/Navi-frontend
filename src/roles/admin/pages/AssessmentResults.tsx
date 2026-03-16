import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Grid,
  Stack,
  Progress,
  Anchor,
  Breadcrumbs,
  Modal,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Divider,
  Tabs,
  Table,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { NAVY, TEAL, PAGE_BG, ROUTES } from "@/constants";
import {
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
  IconRoute,
  IconStar,
  IconStarFilled,
  IconPlus,
  IconTrash,
  IconCheckbox,
} from "@tabler/icons-react";
import { listOrganizationUsers } from "@/api/auth";
import { listInitiatives } from "@/api/initiatives";
import {
  createAssessment,
  listAssessments,
  listSubmissions,
  type Assessment,
  type AssessmentSubmission,
} from "@/api/assessments";
import { useAuth } from "@/contexts/AuthContext";

// Category labels used when mapping categoryScores from assessment form
const DIMENSION_LABELS = [
  "Leadership & Governance",
  "Internal Communication",
  "Strategic Alignment",
  "Operational Agility",
  "Organizational Resilience",
  "Innovation Capacity",
];

interface AssessmentStep {
  title: string;
  questions: string[];
}

interface AssessmentCreateValues {
  name: string;
  owner: string;
  initiative: string;
  audience: string;
  dueDate: string;
  description: string;
  steps: AssessmentStep[];
}

const AUDIENCE_OPTIONS = [
  { value: "all-roles", label: "All roles" },
  { value: "leadership", label: "Leadership team" },
  { value: "admin", label: "Admins only" },
  { value: "managers", label: "Managers only" },
  { value: "all-employees", label: "All employees" },
];

function getRiskLevel(score: number) {
  if (score >= 4.0) return { label: "Low Risk", color: TEAL };
  if (score >= 2.5) return { label: "Medium Risk", color: "orange" };
  return { label: "High Risk", color: "red" };
}

function getBarColor(score: number) {
  if (score >= 4.0) return TEAL;
  if (score >= 2.5) return "orange";
  return "red";
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  return (
    <Group gap={2}>
      {Array.from({ length: max }, (_, i) => {
        if (i < full) return <IconStarFilled key={i} size={20} color="#F59E0B" />;
        if (i === full && half) return <IconStarFilled key={i} size={20} color="#F59E0B" style={{ opacity: 0.7 }} />;
        return <IconStar key={i} size={20} color="#E5E7EB" />;
      })}
    </Group>
  );
}

export default function AssessmentResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreateAssessment = user?.role === "admin";
  const [createOpen, setCreateOpen] = useState(false);
  const [managers, setManagers] = useState<{ value: string; label: string }[]>([]);
  const [initiatives, setInitiatives] = useState<{ value: string; label: string }[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<Assessment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<AssessmentSubmission[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [initiativeTitleMap, setInitiativeTitleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!createOpen) return;
    listOrganizationUsers()
      .then((users) => {
        const list = users
          .filter((u) => u.role === "manager")
          .map((u) => ({ value: u._id, label: u.name }));
        setManagers(list);
      })
      .catch(() => setManagers([]));
    listInitiatives()
      .then((list) => {
        setInitiatives(list.map((i) => ({ value: i.id, label: i.title })));
      })
      .catch(() => setInitiatives([]));
  }, [createOpen]);

  useEffect(() => {
    Promise.all([
      listAssessments().then((list) => setAssessmentsList(Array.isArray(list) ? list : [])).catch(() => setAssessmentsList([])),
      listSubmissions({ mine: true }).then((list) => setMySubmissions(Array.isArray(list) ? list : [])).catch(() => setMySubmissions([])),
    ]).finally(() => setAssessmentsLoading(false));
    listInitiatives().then((initiativesList) => {
      const map: Record<string, string> = {};
      initiativesList.forEach((i) => {
        map[i.id] = i.title;
        if (i._id) map[i._id] = i.title;
      });
      setInitiativeTitleMap(map);
    }).catch(() => {});
  }, []);

  const toId = (x: unknown): string => {
    if (x == null) return "";
    if (typeof x === "string") return x;
    if (typeof x === "object" && "toString" in x) return (x as { toString(): string }).toString();
    return String(x);
  };
  const assessmentById: Record<string, Assessment> = {};
  assessmentsList.forEach((a) => {
    const id = toId(a._id);
    if (id) assessmentById[id] = a;
  });
  const submittedSubmissions = mySubmissions;
  const pendingAssessments = assessmentsList.filter(
    (a) => !mySubmissions.some((s) => toId(s.assessmentId) === toId(a._id))
  );

  const createForm = useForm<AssessmentCreateValues>({
    initialValues: {
      name: "",
      owner: "",
      initiative: "",
      audience: "",
      dueDate: "",
      description: "",
      steps: [{ title: "", questions: [""] }],
    },
    validate: {
      name: (v) => (!v?.trim() ? "Assessment name is required" : null),
      owner: (v) => (!v ? "Owner is required" : null),
      initiative: (v) => (!v ? "Related initiative is required" : null),
    },
  });

  type DimensionScore = { label: string; score: number };
  const state = location.state as {
    dimensionScores?: DimensionScore[];
    categoryScores?: { category: string; score: number }[];
    overall?: number;
    initiativeId?: string;
    initiativeTitle?: string;
    completedBy?: string;
    completedDate?: string;
  } | null;
  const hasState = state?.overall != null && (state?.dimensionScores || state?.categoryScores);
  const dimensionScores: DimensionScore[] = hasState
    ? (state.dimensionScores ?? (state.categoryScores || []).map((c, i) => ({
        label: DIMENSION_LABELS[i] ?? c.category,
        score: Number(c.score),
      })))
    : [];
  const overall = hasState ? Number(state.overall) : 0;
  const initiativeTitle = state?.initiativeTitle ?? null;
  const risk = getRiskLevel(overall);

  // Derive strong area (highest) and critical focus (lowest) from actual category scores
  const strongArea = dimensionScores.length
    ? dimensionScores.reduce((a, b) => (a.score >= b.score ? a : b)).label
    : null;
  const criticalFocus = dimensionScores.length
    ? dimensionScores.reduce((a, b) => (a.score <= b.score ? a : b)).label
    : null;

  const breadcrumbs = [
    { title: "Assessments", href: ROUTES.ADMIN_ASSESSMENTS },
    { title: "Results", href: "#" },
  ];

  return (
    <AdminLayout>
      <Box bg={PAGE_BG} style={{ minHeight: "100%", paddingBottom: 40 }}>
        {canCreateAssessment && (
        <Modal
          opened={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Create Assessment"
          centered
          size="lg"
          styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
        >
          <form
            onSubmit={createForm.onSubmit(async (values) => {
              if (!values.initiative?.trim()) return;
              try {
                await createAssessment({
                  name: values.name,
                  initiativeId: values.initiative.trim(),
                  ownerId: values.owner || undefined,
                  dueDate: values.dueDate || undefined,
                  audience: values.audience || undefined,
                  description: values.description || undefined,
                  steps: (values.steps ?? []).map((s) => ({
                    title: s.title ?? "",
                    questions: s.questions ?? [],
                  })),
                });
                setCreateOpen(false);
                createForm.reset();
              } catch {
                // Error could be shown in UI
              }
            })}
          >
            <Stack gap="md">
              <TextInput
                label="Assessment name"
                placeholder="e.g., Q3 Readiness Survey"
                withAsterisk
                {...createForm.getInputProps("name")}
              />
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Owner"
                    placeholder="Select a manager"
                    withAsterisk
                    data={managers}
                    searchable
                    {...createForm.getInputProps("owner")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateInput
                    label="Due date"
                    placeholder="Pick date"
                    value={createForm.values.dueDate ? new Date(createForm.values.dueDate) : null}
                    onChange={(d) => {
                      if (!d) {
                        createForm.setFieldValue("dueDate", "");
                        return;
                      }
                      const dateStr = typeof d === "string" ? d.slice(0, 10) : (d instanceof Date ? d.toISOString().slice(0, 10) : "");
                      createForm.setFieldValue("dueDate", dateStr);
                    }}
                    valueFormat="YYYY-MM-DD"
                    popoverProps={{ withinPortal: true, zIndex: 10000 }}
                    clearable
                  />
                </Grid.Col>
              </Grid>
              <Select
                label="Related initiative"
                placeholder="Which initiative is this assessment for?"
                data={initiatives}
                searchable
                clearable
                withAsterisk
                {...createForm.getInputProps("initiative")}
              />
              <Select
                label="Primary audience"
                placeholder="Select who will answer this assessment"
                data={AUDIENCE_OPTIONS}
                clearable
                {...createForm.getInputProps("audience")}
              />
              <Textarea
                label="Description"
                placeholder="Short description so others understand the purpose of this assessment."
                minRows={3}
                autosize
                {...createForm.getInputProps("description")}
              />

              <Divider label="Questions" labelPosition="center" />

              <Text size="sm" c="dimmed">
                Add steps (e.g. sections) and questions for each step. Each step can have multiple questions.
              </Text>

              {createForm.values.steps.map((step, stepIdx) => (
                <Paper key={stepIdx} withBorder p="md" radius="md" bg="#f8f9fa">
                  <Group justify="space-between" mb="sm">
                    <TextInput
                      placeholder="Step title (e.g. Leadership Alignment)"
                      size="sm"
                      style={{ flex: 1 }}
                      {...createForm.getInputProps(`steps.${stepIdx}.title`)}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => createForm.removeListItem("steps", stepIdx)}
                      disabled={createForm.values.steps.length <= 1}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                  <Stack gap="xs">
                    {(createForm.values.steps[stepIdx]?.questions ?? []).map((_, qIdx) => (
                      <Group key={qIdx} gap="xs" align="flex-start">
                        <TextInput
                          placeholder={`Question ${qIdx + 1}`}
                          size="sm"
                          style={{ flex: 1 }}
                          {...createForm.getInputProps(`steps.${stepIdx}.questions.${qIdx}`)}
                        />
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="sm"
                          onClick={() => createForm.removeListItem(`steps.${stepIdx}.questions`, qIdx)}
                          disabled={(createForm.values.steps[stepIdx]?.questions?.length ?? 0) <= 1}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    ))}
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => createForm.insertListItem(`steps.${stepIdx}.questions`, "")}
                    >
                      Add question
                    </Button>
                  </Stack>
                </Paper>
              ))}

              <Button
                variant="default"
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  createForm.insertListItem("steps", { title: "", questions: [""] })
                }
              >
                Add step
              </Button>

              <Group justify="flex-end" mt="md">
                <Button variant="default" type="button" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Assessment</Button>
              </Group>
            </Stack>
          </form>
        </Modal>
        )}

        {/* Breadcrumb + Header */}
        <Stack gap="xs" mb="lg">
          <Breadcrumbs separator=">" styles={{ separator: { color: NAVY } }}>
            {breadcrumbs.map((item) => (
              <Anchor
                key={item.title}
                href={item.href}
                size="sm"
                c={NAVY}
                fw={500}
                onClick={(e) => {
                  if (item.href !== "#") {
                    e.preventDefault();
                    navigate(item.href);
                  }
                }}
              >
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
          <Group justify="space-between" align="flex-end" wrap="wrap">
            <Box>
              <Title order={2} c={NAVY} mb={4}>
                Assessments
              </Title>
              <Text c="dimmed" fz="sm">
                Review the latest readiness results and manage assessment runs.
              </Text>
            </Box>
            <Group gap="sm">
              {canCreateAssessment && (
                <Button
                  color={NAVY}
                  onClick={() => setCreateOpen(true)}
                >
                  Create Assessment
                </Button>
              )}
              {pendingAssessments.length > 0 && (
                <Button
                  variant="light"
                  color="dark"
                  leftSection={<IconRefresh size={18} />}
                  onClick={() => navigate(ROUTES.ADMIN_ASSESSMENTS_FORM)}
                >
                  Retake Assessment
                </Button>
              )}
              <Button
                variant="light"
                color="dark"
                leftSection={<IconRoute size={18} />}
                onClick={() => navigate(ROUTES.ADMIN_ROADMAP)}
              >
                View Roadmap
              </Button>
            </Group>
          </Group>
        </Stack>

        {/* No assessments for this role: show single empty state */}
        {!assessmentsLoading && assessmentsList.length === 0 && mySubmissions.length === 0 ? (
          <Paper withBorder radius="md" bg="white" p="xl" mb="lg">
            <Stack align="center" gap="md" py="xl">
              <IconCheckbox size={48} color={NAVY} stroke={1.5} />
              <Box ta="center">
                <Title order={4} c={NAVY} mb="xs">
                  No assessments assigned to your role
                </Title>
                <Text c="dimmed" size="sm" maw={420}>
                  There are no assessments for you at the moment. When your administrator assigns assessments to your role, they will appear here.
                </Text>
              </Box>
            </Stack>
          </Paper>
        ) : (
        <Paper withBorder radius="md" bg="white" mb="lg">
          <Tabs defaultValue="submitted" variant="default">
            <Tabs.List>
              <Tabs.Tab value="submitted">
                My submissions ({submittedSubmissions.length})
              </Tabs.Tab>
              <Tabs.Tab value="pending">
                Pending ({pendingAssessments.length})
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="submitted" pt="md" px="md" pb="md">
              {assessmentsLoading ? (
                <Text size="sm" c="dimmed">Loading…</Text>
              ) : submittedSubmissions.length === 0 ? (
                <Text size="sm" c="dimmed">You have not submitted any assessments yet. Complete an assessment from the Pending tab.</Text>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Assessment</Table.Th>
                      <Table.Th>Initiative</Table.Th>
                      <Table.Th>Score</Table.Th>
                      <Table.Th>Risk</Table.Th>
                      <Table.Th>Submitted</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {submittedSubmissions.map((s) => (
                      <Table.Tr key={s._id}>
                        <Table.Td fw={500}>
                          {s.assessmentName ?? assessmentById[toId(s.assessmentId)]?.name ?? "Assessment"}
                        </Table.Td>
                        <Table.Td>
                          {initiativeTitleMap[String(s.initiativeId)] ?? s.initiativeId}
                        </Table.Td>
                        <Table.Td>
                          <Badge color={NAVY} variant="light" size="lg">
                            {Math.round(Number(s.overallScore))}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {s.riskLevel ? (
                            <Badge color={s.riskLevel === "High Risk" ? "red" : s.riskLevel === "Medium Risk" ? "yellow" : "green"} variant="light">
                              {s.riskLevel}
                            </Badge>
                          ) : "—"}
                        </Table.Td>
                        <Table.Td>
                          {s.createdAt
                            ? new Date(s.createdAt).toLocaleDateString()
                            : "—"}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Tabs.Panel>
            <Tabs.Panel value="pending" pt="md" px="md" pb="md">
              {assessmentsLoading ? (
                <Text size="sm" c="dimmed">Loading assessments…</Text>
              ) : pendingAssessments.length === 0 ? (
                <Text size="sm" c="dimmed">No pending assessments.</Text>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Assessment</Table.Th>
                      <Table.Th>Initiative</Table.Th>
                      <Table.Th>Due date</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {pendingAssessments.map((a) => {
                      const initiativeId = typeof a.initiativeId === "string" ? a.initiativeId : (a.initiativeId as { toString?: () => string })?.toString?.() ?? "";
                      const initiativeTitle = initiativeId ? (initiativeTitleMap[initiativeId] ?? initiativeId) : "";
                      return (
                        <Table.Tr key={a._id}>
                          <Table.Td fw={500}>{a.name}</Table.Td>
                          <Table.Td>{initiativeTitle}</Table.Td>
                          <Table.Td>
                            {a.dueDate
                              ? new Date(a.dueDate).toLocaleDateString()
                              : "—"}
                          </Table.Td>
                          <Table.Td>
                            <Button
                              size="xs"
                              color={NAVY}
                              variant="light"
                              onClick={() =>
                                navigate(ROUTES.ADMIN_ASSESSMENTS_FORM, {
                                  state: { initiativeId, initiativeTitle },
                                })
                              }
                            >
                              Complete Assessment
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>
        )}

        {!hasState ? (
          <Paper withBorder p="xl" radius="md" bg="white">
            <Stack align="center" gap="lg" py="xl">
              <IconCheckbox size={48} color={NAVY} stroke={1.5} />
              <Box ta="center">
                <Title order={4} c={NAVY} mb="xs">
                  No assessment results yet
                </Title>
                <Text c="dimmed" size="sm" maw={400}>
                  Take an assessment from an initiative to see your readiness results here. Go to an initiative, open the <strong>Assessment</strong> tab, and take an assessment assigned to your role.
                </Text>
              </Box>
              <Button
                color={NAVY}
                onClick={() => navigate(ROUTES.ADMIN_INITIATIVES)}
              >
                View Initiatives
              </Button>
            </Stack>
          </Paper>
        ) : (
          <>
            {initiativeTitle && (
              <Paper withBorder p="md" radius="md" bg="white" mb="lg">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                  Initiative
                </Text>
                <Text size="md" fw={700} c={NAVY}>
                  {initiativeTitle}
                </Text>
              </Paper>
            )}

            {/* Readiness Score + Performance Interpretation */}
            <Grid gutter="lg" mb="xl">
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Paper withBorder p="xl" radius="md" bg="white" h="100%">
                  <Text
                    tt="uppercase"
                    fz="xs"
                    fw={700}
                    c="dimmed"
                    mb="xs"
                    lts={1}
                  >
                    Readiness Score
                  </Text>
                  <Title order={1} c={NAVY} fz={48} fw={800} mb="xs">
                    {overall.toFixed(1)}
                  </Title>
                  <StarRating value={overall} />
                  <Badge
                    size="lg"
                    variant="light"
                    color={risk.color}
                    mt="md"
                    fw={700}
                  >
                    {risk.label}
                  </Badge>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Paper withBorder p="xl" radius="md" bg="white" h="100%">
                  <Title order={5} c={NAVY} mb="sm">
                    Performance Interpretation
                  </Title>
                  <Text c="dimmed" fz="sm" mb="md" style={{ lineHeight: 1.6 }}>
                    Your overall readiness indicates {overall >= 4 ? "strong" : overall >= 2.5 ? "moderate" : "limited"} alignment with
                    strategic goals. Use the strong area and critical focus below to plan next steps.
                  </Text>
                  {strongArea && (
                    <Stack gap="sm">
                      <Group
                        gap="sm"
                        p="sm"
                        style={{
                          backgroundColor: "#D1FAE5",
                          borderRadius: 8,
                        }}
                      >
                        <IconCheck size={20} color={TEAL} />
                        <Box>
                          <Text size="xs" fw={700} c="dark" tt="uppercase">
                            Strong Area
                          </Text>
                          <Text size="sm" fw={600} c={NAVY}>
                            {strongArea}
                          </Text>
                        </Box>
                      </Group>
                      {criticalFocus && (
                        <Group
                          gap="sm"
                          p="sm"
                          style={{
                            backgroundColor: "#FEF3C7",
                            borderRadius: 8,
                          }}
                        >
                          <IconAlertTriangle size={20} color="#D97706" />
                          <Box>
                            <Text size="xs" fw={700} c="dark" tt="uppercase">
                              Critical Focus
                            </Text>
                            <Text size="sm" fw={600} c={NAVY}>
                              {criticalFocus}
                            </Text>
                          </Box>
                        </Group>
                      )}
                    </Stack>
                  )}
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Scores by Dimension + Risk Classification */}
            <Grid gutter="lg" mb="xl">
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Paper withBorder p="xl" radius="md" bg="white">
                  <Title order={5} c={NAVY} mb="md">
                    Scores by Dimension
                  </Title>
                  <Stack gap="md">
                    {dimensionScores.map((d) => (
                      <Box key={d.label}>
                        <Group justify="space-between" mb={4}>
                          <Text size="sm" fw={600} c={NAVY}>
                            {d.label}
                          </Text>
                          <Text size="sm" fw={700} c={NAVY}>
                            {d.score.toFixed(1)}/5
                          </Text>
                        </Group>
                        <Progress
                          value={(d.score / 5) * 100}
                          color={getBarColor(d.score)}
                          size="md"
                          radius="xl"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Paper withBorder p="xl" radius="md" bg="white" h="100%">
                  <Title order={5} c={NAVY} mb="md">
                    Risk Classification
                  </Title>
                  <Stack gap="md">
                    <Box>
                      <Group gap="xs" mb={4}>
                        <Box
                          w={10}
                          h={10}
                          style={{ borderRadius: "50%", backgroundColor: TEAL }}
                        />
                        <Text size="sm" fw={700} c={NAVY}>
                          Low Risk (4.0 – 5.0)
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                        High readiness; minimal intervention needed.
                      </Text>
                    </Box>
                    <Box>
                      <Group gap="xs" mb={4}>
                        <Box
                          w={10}
                          h={10}
                          style={{
                            borderRadius: "50%",
                            backgroundColor: "orange",
                          }}
                        />
                        <Text size="sm" fw={700} c={NAVY}>
                          Medium Risk (2.5 – 3.9)
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                        Moderate gaps; targeted actions recommended.
                      </Text>
                    </Box>
                    <Box>
                      <Group gap="xs" mb={4}>
                        <Box
                          w={10}
                          h={10}
                          style={{
                            borderRadius: "50%",
                            backgroundColor: "red",
                          }}
                        />
                        <Text size="sm" fw={700} c={NAVY}>
                          High Risk (0.0 – 2.4)
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                        Critical vulnerabilities; immediate attention required.
                      </Text>
                    </Box>
                    <Text size="xs" c="dimmed" mt="sm" style={{ lineHeight: 1.5 }}>
                      Scores are from your assessment responses (1–5 scale).
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>

            </>
        )}
      </Box>
    </AdminLayout>
  );
}
