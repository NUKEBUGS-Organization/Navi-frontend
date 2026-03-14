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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { NAVY, TEAL, PAGE_BG, ROUTES } from "@/constants";
import {
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
  IconRoute,
  IconStar,
  IconStarFilled,
  IconBulb,
  IconMessageCircle,
  IconChartDots,
} from "@tabler/icons-react";

// Design dimensions and mock data matching the reference
const DIMENSION_LABELS = [
  "Leadership & Governance",
  "Internal Communication",
  "Strategic Alignment",
  "Operational Agility",
  "Organizational Resilience",
  "Innovation Capacity",
];

const MOCK_RESULTS = {
  initiative: "Digital Transformation 2026",
  completedBy: "Alex Johnson",
  completedDate: "Oct 24, 2023",
  overall: 3.6,
  dimensionScores: [
    { label: "Leadership & Governance", score: 4.2 },
    { label: "Internal Communication", score: 2.8 },
    { label: "Strategic Alignment", score: 4.5 },
    { label: "Operational Agility", score: 1.9 },
    { label: "Organizational Resilience", score: 3.2 },
    { label: "Innovation Capacity", score: 3.5 },
  ],
  strongArea: "Strategic Vision",
  criticalFocus: "Execution Agility",
};

const RECOMMENDED_FOCUS = [
  {
    title: "Agility Coaching",
    icon: IconBulb,
    description:
      "Build adaptive capacity through structured Scrum/Kanban frameworks and cross-functional training to improve delivery predictability.",
    color: "#0F2B5B",
  },
  {
    title: "Feedback Loops",
    icon: IconMessageCircle,
    description:
      "Implement anonymous pulse surveys and retrospectives to surface blind spots and align leadership with frontline realities.",
    color: "#0F2B5B",
  },
  {
    title: "Silo Elimination",
    icon: IconChartDots,
    description:
      "Form cross-departmental tiger teams and shared OKRs to break down barriers and accelerate end-to-end ownership.",
    color: "#0F2B5B",
  },
];

interface AssessmentCreateValues {
  name: string;
  owner: string;
  initiative: string;
  audience: string;
  dueDate: string;
  description: string;
}

const AUDIENCE_OPTIONS = [
  { value: "leadership", label: "Leadership team" },
  { value: "managers", label: "People managers" },
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
  const [createOpen, setCreateOpen] = useState(false);

  const createForm = useForm<AssessmentCreateValues>({
    initialValues: {
      name: "",
      owner: "",
      initiative: "",
      audience: "",
      dueDate: "",
      description: "",
    },
    validate: {
      name: (v) => (!v ? "Assessment name is required" : null),
      owner: (v) => (!v ? "Owner is required" : null),
    },
  });

  type DimensionScore = { label: string; score: number };
  const state = location.state as {
    dimensionScores?: DimensionScore[];
    categoryScores?: { category: string; score: number }[];
    overall?: number;
    completedBy?: string;
    completedDate?: string;
  } | null;
  const hasState = state?.overall != null && (state?.dimensionScores || state?.categoryScores);
  const dimensionScores: DimensionScore[] = hasState
    ? (state.dimensionScores ?? (state.categoryScores || []).map((c, i) => ({
        label: DIMENSION_LABELS[i] ?? c.category,
        score: Number(c.score),
      })))
    : MOCK_RESULTS.dimensionScores;
  const overall = hasState ? Number(state.overall) : MOCK_RESULTS.overall;

  const risk = getRiskLevel(overall);

  const breadcrumbs = [
    { title: "Assessments", href: ROUTES.ADMIN_ASSESSMENTS },
    { title: "Results", href: "#" },
  ];

  return (
    <AdminLayout>
      <Box bg={PAGE_BG} style={{ minHeight: "100%", paddingBottom: 40 }}>
        <Modal
          opened={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Create Assessment"
          centered
          size="lg"
        >
          <form
            onSubmit={createForm.onSubmit(() => {
              setCreateOpen(false);
              createForm.reset();
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
                  <TextInput
                    label="Owner"
                    placeholder="Person responsible"
                    withAsterisk
                    {...createForm.getInputProps("owner")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Due date"
                    placeholder="YYYY-MM-DD"
                    {...createForm.getInputProps("dueDate")}
                  />
                </Grid.Col>
              </Grid>
              <TextInput
                label="Related initiative"
                placeholder="Which initiative is this assessment for?"
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
              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Assessment</Button>
              </Group>
            </Stack>
          </form>
        </Modal>

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
              <Button
                color={NAVY}
                onClick={() => setCreateOpen(true)}
              >
                Create Assessment
              </Button>
              <Button
                variant="light"
                color="dark"
                leftSection={<IconRefresh size={18} />}
                onClick={() => navigate(ROUTES.ADMIN_ASSESSMENTS_FORM)}
              >
                Retake Assessment
              </Button>
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
                Your overall readiness indicates moderate alignment with
                strategic goals. Strengths in strategic planning and vision are
                evident; however, gaps in execution agility and communication
                transparency require targeted interventions to reduce risk and
                accelerate outcomes.
              </Text>
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
                      {MOCK_RESULTS.strongArea}
                    </Text>
                  </Box>
                </Group>
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
                      {MOCK_RESULTS.criticalFocus}
                    </Text>
                  </Box>
                </Group>
              </Stack>
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
                  Scores are calculated based on weighted inputs from 42 unique
                  data points.
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Recommended Focus Areas */}
        <Title order={5} c={NAVY} mb="md">
          Recommended Focus Areas
        </Title>
        <Grid gutter="md">
          {RECOMMENDED_FOCUS.map((item) => (
            <Grid.Col key={item.title} span={{ base: 12, md: 4 }}>
              <Paper
                withBorder
                p="lg"
                radius="md"
                bg="white"
                h="100%"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <item.icon
                  size={32}
                  color={item.color}
                  stroke={1.5}
                  style={{ marginBottom: 12 }}
                />
                <Title order={6} c={NAVY} mb="xs">
                  {item.title}
                </Title>
                <Text size="sm" c="dimmed" mb="md" style={{ flex: 1, lineHeight: 1.5 }}>
                  {item.description}
                </Text>
                <Anchor
                  size="sm"
                  fw={600}
                  c={NAVY}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  View Resource →
                </Anchor>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Box>
    </AdminLayout>
  );
}
