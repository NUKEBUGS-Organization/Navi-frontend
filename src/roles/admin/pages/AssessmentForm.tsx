import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Title,
  Text,
  Progress,
  UnstyledButton,
  Grid,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NAVY, TEAL, PAGE_BG, ROUTES } from "@/constants";
import {
  IconCircleFilled,
  IconCircle,
  IconCheck,
  IconDeviceFloppy,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
} from "@tabler/icons-react";

interface QuestionDef {
  text: string;
  lowLabel: string;
  highLabel: string;
}

interface CategoryDef {
  key: string;
  name: string;
  description: string;
  questions: QuestionDef[];
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "LEADERSHIP_ALIGNMENT",
    name: "Leadership Alignment",
    description:
      "Assess the extent to which organizational leaders are prepared to sponsor and lead the upcoming transformation initiatives.",
    questions: [
      {
        text: "To what extent has the leadership team communicated a shared vision for this change?",
        lowLabel: "NOT AT ALL",
        highLabel: "COMPLETELY",
      },
      {
        text: "How visible is executive sponsorship for the initiative across the organization?",
        lowLabel: "INVISIBLE",
        highLabel: "HIGHLY VISIBLE",
      },
      {
        text: "How well do leaders model the behaviors expected from the change?",
        lowLabel: "POORLY",
        highLabel: "EXEMPLARY",
      },
    ],
  },
  {
    key: "COMMUNICATION_READINESS",
    name: "Communication Readiness",
    description:
      "Evaluate the clarity, consistency, and effectiveness of change-related communication across the organization.",
    questions: [
      { text: "How clear is the messaging about why this change is needed?", lowLabel: "UNCLEAR", highLabel: "VERY CLEAR" },
      { text: "How often do employees receive updates on the initiative?", lowLabel: "RARELY", highLabel: "FREQUENTLY" },
      { text: "How well are different channels (email, meetings, etc.) used for communication?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { text: "To what extent do employees feel they can ask questions about the change?", lowLabel: "NOT AT ALL", highLabel: "FULLY" },
      { text: "How consistent is the change narrative across leaders?", lowLabel: "INCONSISTENT", highLabel: "HIGHLY CONSISTENT" },
      { text: "How well are milestones and successes communicated?", lowLabel: "POORLY", highLabel: "EXCELLENTLY" },
      { text: "How accessible is information about the change to frontline staff?", lowLabel: "INACCESSIBLE", highLabel: "HIGHLY ACCESSIBLE" },
      { text: "How would you rate the overall change communication plan?", lowLabel: "WEAK", highLabel: "STRONG" },
    ],
  },
  {
    key: "STAKEHOLDER_ENGAGEMENT",
    name: "Stakeholder Engagement",
    description: "Measure how effectively key stakeholders are identified, engaged, and aligned with the change.",
    questions: [
      { text: "How well have key stakeholders been identified?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { text: "How engaged are resistant stakeholders in the change process?", lowLabel: "DISENGAGED", highLabel: "HIGHLY ENGAGED" },
      { text: "How effective are the feedback mechanisms for stakeholders?", lowLabel: "INEFFECTIVE", highLabel: "HIGHLY EFFECTIVE" },
      { text: "To what extent are stakeholder concerns being addressed?", lowLabel: "NOT AT ALL", highLabel: "FULLY" },
      { text: "How strong are the relationships between the change team and key stakeholders?", lowLabel: "WEAK", highLabel: "STRONG" },
    ],
  },
  {
    key: "RESOURCE_AVAILABILITY",
    name: "Resource Availability",
    description: "Assess whether sufficient time, budget, and skills are available to support the change.",
    questions: [
      { text: "How adequate is the budget allocated for this initiative?", lowLabel: "INADEQUATE", highLabel: "FULLY ADEQUATE" },
      { text: "How available are key people to work on the change?", lowLabel: "UNAVAILABLE", highLabel: "FULLY AVAILABLE" },
      { text: "How well do teams have the skills needed for the change?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { text: "How realistic is the timeline given other priorities?", lowLabel: "UNREALISTIC", highLabel: "REALISTIC" },
      { text: "How sufficient are tools and technology to support the change?", lowLabel: "INSUFFICIENT", highLabel: "SUFFICIENT" },
    ],
  },
  {
    key: "PROCESS_SYSTEMS_READINESS",
    name: "Process & Systems Readiness",
    description: "Evaluate the readiness of processes and systems to support the transformation.",
    questions: [
      { text: "How well are current processes documented?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { text: "How ready are systems for the planned changes?", lowLabel: "NOT READY", highLabel: "FULLY READY" },
      { text: "How clear are the process change requirements?", lowLabel: "UNCLEAR", highLabel: "VERY CLEAR" },
      { text: "How integrated are the systems that need to work together?", lowLabel: "NOT INTEGRATED", highLabel: "FULLY INTEGRATED" },
      { text: "How well do workflows support the new way of working?", lowLabel: "POORLY", highLabel: "VERY WELL" },
    ],
  },
  {
    key: "CULTURAL_READINESS",
    name: "Cultural Readiness",
    description: "Assess the organization's culture and readiness to adopt new behaviors and norms.",
    questions: [
      { text: "How open is the culture to trying new approaches?", lowLabel: "RESISTANT", highLabel: "HIGHLY OPEN" },
      { text: "How strong is psychological safety for voicing concerns?", lowLabel: "WEAK", highLabel: "STRONG" },
      { text: "How well does the culture support collaboration across teams?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { text: "To what extent do employees feel ownership of the change?", lowLabel: "LOW", highLabel: "HIGH" },
      { text: "How aligned is the culture with the desired future state?", lowLabel: "MISALIGNED", highLabel: "ALIGNED" },
    ],
  },
];

const TOTAL_QUESTIONS = CATEGORIES.reduce((sum, c) => sum + c.questions.length, 0);

function getInitialResponses(): Record<string, (number | "")[]> {
  return CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.key] = cat.questions.map(() => "");
      return acc;
    },
    {} as Record<string, (number | "")[]>
  );
}

export default function AssessmentForm() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(0);
  const form = useForm({
    initialValues: { responses: getInitialResponses() },
  });

  const cat = CATEGORIES[activeCategory];
  const responses = form.values.responses;

  const answeredCount = useMemo(() => {
    let n = 0;
    for (const key of Object.keys(responses)) {
      n += responses[key].filter((v) => v !== "" && v !== undefined).length;
    }
    return n;
  }, [responses]);

  const progressPercent = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  function getCategoryStatus(index: number): "current" | "completed" | "partial" | "not_started" {
    const key = CATEGORIES[index].key;
    const vals = responses[key] ?? [];
    const total = CATEGORIES[index].questions.length;
    const answered = vals.filter((v) => v !== "" && v !== undefined).length;
    if (index === activeCategory) return "current";
    if (answered === total) return "completed";
    if (answered > 0) return "partial";
    return "not_started";
  }

  const handleNext = () => {
    if (activeCategory < CATEGORIES.length - 1) {
      setActiveCategory((c) => c + 1);
    } else {
      form.onSubmit(handleSubmit)();
    }
  };

  const handlePrev = () => setActiveCategory((c) => Math.max(0, c - 1));

  const handleSubmit = (values?: { responses: Record<string, (number | "")[]> }) => {
    const res = values?.responses ?? form.values.responses;
    const categoryScores = CATEGORIES.map((c) => {
      const vals = (res[c.key] ?? []).map((v) => Number(v)).filter((n) => !Number.isNaN(n));
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { category: c.name, score: avg };
    });
    const overall =
      categoryScores.reduce((sum, x) => sum + x.score, 0) / CATEGORIES.length;
    navigate(ROUTES.ADMIN_ASSESSMENTS, {
      state: { categoryScores, overall },
    });
  };

  return (
    <AdminLayout>
      <Box bg={PAGE_BG} style={{ minHeight: "100%", paddingBottom: rem(40) }}>
        {/* Status bar */}
        <Group justify="space-between" mb="lg" py="xs" px="md" style={{ backgroundColor: "white", borderRadius: 8 }}>
          <Group gap="xs">
            <IconCircleFilled size={10} color="#228BE6" />
            <Text size="sm" fw={600} c="dark">ASSESSMENT IN PROGRESS</Text>
          </Group>
        </Group>

        <Grid gutter="lg" align="flex-start">
          {/* Left sidebar: Progress + Categories */}
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Paper withBorder p="lg" radius="md" bg="white" mb="md">
              <Text size="sm" fw={700} c={NAVY} mb="xs">Overall Progress</Text>
              <Progress value={progressPercent} size="md" color={NAVY} radius="xl" mb="lg" />
              <Text size="sm" fw={700} c={NAVY} mb="sm">CATEGORIES</Text>
              <Stack gap="xs">
                {CATEGORIES.map((c, idx) => {
                  const status = getCategoryStatus(idx);
                  const key = c.key;
                  const vals = responses[key] ?? [];
                  const answered = vals.filter((v) => v !== "" && v !== undefined).length;
                  const total = c.questions.length;
                  return (
                    <UnstyledButton
                      key={c.key}
                      onClick={() => setActiveCategory(idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: rem(10),
                        padding: `${rem(8)} ${rem(12)}`,
                        borderRadius: 8,
                        backgroundColor: status === "current" ? "rgba(15, 43, 91, 0.08)" : "transparent",
                      }}
                    >
                      {status === "current" && <IconCircleFilled size={12} color={NAVY} />}
                      {status === "partial" && <IconCircle size={12} color="#94A3B8" />}
                      {status === "not_started" && <IconCircle size={12} color="#94A3B8" />}
                      {status === "completed" && <IconCheck size={16} color={TEAL} />}
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={status === "current" ? 700 : 500} c={NAVY} truncate>
                          {c.name}
                        </Text>
                        {status === "current" && <Text size="xs" c="dimmed">Current</Text>}
                        {status === "partial" && (
                          <Text size="xs" c="dimmed">{answered} of {total} answered</Text>
                        )}
                        {status === "not_started" && <Text size="xs" c="dimmed">Not started</Text>}
                        {status === "completed" && <Text size="xs" c="dimmed">Completed</Text>}
                      </Box>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Main content: Category + Questions */}
          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <Paper withBorder p="xl" radius="md" bg="white" mb="md">
              <Group gap="xs" mb="xs">
                <IconUsers size={18} color="#64748B" />
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                  CATEGORY {String(activeCategory + 1).padStart(2, "0")}
                </Text>
              </Group>
              <Title order={3} c={NAVY} mb="sm">{cat.name}</Title>
              <Text size="sm" c="dimmed" mb="xl" style={{ lineHeight: 1.6 }}>
                {cat.description}
              </Text>

              <Stack gap="lg">
                {cat.questions.map((q, qIdx) => {
                  const value = form.values.responses[cat.key]?.[qIdx];
                  const numValue = value === "" || value === undefined ? null : Number(value);
                  return (
                    <Paper key={qIdx} withBorder p="md" radius="md" bg="#F8FAFC">
                      <Text size="sm" fw={600} c={NAVY} mb="md">
                        {q.text}
                      </Text>
                      <Group justify="space-between" wrap="nowrap" mb={4}>
                        <Text size="xs" c="dimmed" fw={500}>{q.lowLabel}</Text>
                        <Text size="xs" c="dimmed" fw={500}>{q.highLabel}</Text>
                      </Group>
                      <Group gap="xs">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <UnstyledButton
                            key={n}
                            onClick={() => {
                              const key = cat.key;
                              const arr = [...(form.values.responses[key] ?? [])];
                              arr[qIdx] = n;
                              form.setFieldValue(`responses.${key}`, arr);
                            }}
                            style={{
                              width: rem(44),
                              height: rem(44),
                              borderRadius: 8,
                              backgroundColor: numValue === n ? NAVY : "#E2E8F0",
                              color: numValue === n ? "white" : NAVY,
                              fontWeight: 700,
                              fontSize: rem(14),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {n}
                          </UnstyledButton>
                        ))}
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>

            {/* Footer */}
            <Group justify="space-between" wrap="wrap" gap="md">
              <Button
                variant="default"
                leftSection={<IconDeviceFloppy size={18} />}
                onClick={() => {}}
              >
                Save and Exit
              </Button>
              <Group gap="md">
                <Button
                  variant="default"
                  leftSection={<IconChevronLeft size={18} />}
                  disabled={activeCategory === 0}
                  onClick={handlePrev}
                >
                  Previous Category
                </Button>
                <Text size="sm" c="dimmed" fw={500}>
                  Step {activeCategory + 1} of {CATEGORIES.length}
                </Text>
                <Button
                  color={NAVY}
                  rightSection={<IconChevronRight size={18} />}
                  onClick={handleNext}
                >
                  {activeCategory === CATEGORIES.length - 1 ? "Submit Assessment" : "Next Category →"}
                </Button>
              </Group>
            </Group>
          </Grid.Col>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
