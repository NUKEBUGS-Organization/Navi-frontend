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
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAssessment, getAssessmentByInitiative, createSubmission } from "@/api/assessments";
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

/** Matches schema: Assessment Questions (question, category) + Responses (score 1-5) */
interface QuestionDef {
  question: string;
  lowLabel: string;
  highLabel: string;
}

interface CategoryDef {
  key: string;
  name: string;
  description: string;
  questions: QuestionDef[];
}

const RATING_SCALE = [1, 2, 3, 4, 5] as const;
const RATING_LABEL = "Rate from 1 (lowest) to 5 (highest)";

const CATEGORIES: CategoryDef[] = [
  {
    key: "LEADERSHIP_ALIGNMENT",
    name: "Leadership Alignment",
    description:
      "Assess the extent to which organizational leaders are prepared to sponsor and lead the upcoming transformation initiatives.",
    questions: [
      {
        question: "To what extent has the leadership team communicated a shared vision for this change?",
        lowLabel: "NOT AT ALL",
        highLabel: "COMPLETELY",
      },
      {
        question: "How visible is executive sponsorship for the initiative across the organization?",
        lowLabel: "INVISIBLE",
        highLabel: "HIGHLY VISIBLE",
      },
      {
        question: "How well do leaders model the behaviors expected from the change?",
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
      { question: "How clear is the messaging about why this change is needed?", lowLabel: "UNCLEAR", highLabel: "VERY CLEAR" },
      { question: "How often do employees receive updates on the initiative?", lowLabel: "RARELY", highLabel: "FREQUENTLY" },
      { question: "How well are different channels (email, meetings, etc.) used for communication?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { question: "To what extent do employees feel they can ask questions about the change?", lowLabel: "NOT AT ALL", highLabel: "FULLY" },
      { question: "How consistent is the change narrative across leaders?", lowLabel: "INCONSISTENT", highLabel: "HIGHLY CONSISTENT" },
      { question: "How well are milestones and successes communicated?", lowLabel: "POORLY", highLabel: "EXCELLENTLY" },
      { question: "How accessible is information about the change to frontline staff?", lowLabel: "INACCESSIBLE", highLabel: "HIGHLY ACCESSIBLE" },
      { question: "How would you rate the overall change communication plan?", lowLabel: "WEAK", highLabel: "STRONG" },
    ],
  },
  {
    key: "STAKEHOLDER_ENGAGEMENT",
    name: "Stakeholder Engagement",
    description: "Measure how effectively key stakeholders are identified, engaged, and aligned with the change.",
    questions: [
      { question: "How well have key stakeholders been identified?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { question: "How engaged are resistant stakeholders in the change process?", lowLabel: "DISENGAGED", highLabel: "HIGHLY ENGAGED" },
      { question: "How effective are the feedback mechanisms for stakeholders?", lowLabel: "INEFFECTIVE", highLabel: "HIGHLY EFFECTIVE" },
      { question: "To what extent are stakeholder concerns being addressed?", lowLabel: "NOT AT ALL", highLabel: "FULLY" },
      { question: "How strong are the relationships between the change team and key stakeholders?", lowLabel: "WEAK", highLabel: "STRONG" },
    ],
  },
  {
    key: "RESOURCE_AVAILABILITY",
    name: "Resource Availability",
    description: "Assess whether sufficient time, budget, and skills are available to support the change.",
    questions: [
      { question: "How adequate is the budget allocated for this initiative?", lowLabel: "INADEQUATE", highLabel: "FULLY ADEQUATE" },
      { question: "How available are key people to work on the change?", lowLabel: "UNAVAILABLE", highLabel: "FULLY AVAILABLE" },
      { question: "How well do teams have the skills needed for the change?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { question: "How realistic is the timeline given other priorities?", lowLabel: "UNREALISTIC", highLabel: "REALISTIC" },
      { question: "How sufficient are tools and technology to support the change?", lowLabel: "INSUFFICIENT", highLabel: "SUFFICIENT" },
    ],
  },
  {
    key: "PROCESS_SYSTEMS_READINESS",
    name: "Process & Systems Readiness",
    description: "Evaluate the readiness of processes and systems to support the transformation.",
    questions: [
      { question: "How well are current processes documented?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { question: "How ready are systems for the planned changes?", lowLabel: "NOT READY", highLabel: "FULLY READY" },
      { question: "How clear are the process change requirements?", lowLabel: "UNCLEAR", highLabel: "VERY CLEAR" },
      { question: "How integrated are the systems that need to work together?", lowLabel: "NOT INTEGRATED", highLabel: "FULLY INTEGRATED" },
      { question: "How well do workflows support the new way of working?", lowLabel: "POORLY", highLabel: "VERY WELL" },
    ],
  },
  {
    key: "CULTURAL_READINESS",
    name: "Cultural Readiness",
    description: "Assess the organization's culture and readiness to adopt new behaviors and norms.",
    questions: [
      { question: "How open is the culture to trying new approaches?", lowLabel: "RESISTANT", highLabel: "HIGHLY OPEN" },
      { question: "How strong is psychological safety for voicing concerns?", lowLabel: "WEAK", highLabel: "STRONG" },
      { question: "How well does the culture support collaboration across teams?", lowLabel: "POORLY", highLabel: "VERY WELL" },
      { question: "To what extent do employees feel ownership of the change?", lowLabel: "LOW", highLabel: "HIGH" },
      { question: "How aligned is the culture with the desired future state?", lowLabel: "MISALIGNED", highLabel: "ALIGNED" },
    ],
  },
];

function getTotalQuestions(cats: CategoryDef[]) {
  return cats.reduce((sum, c) => sum + c.questions.length, 0);
}

function getInitialResponses(cats: CategoryDef[]): Record<string, (number | "")[]> {
  return cats.reduce(
    (acc, cat) => {
      acc[cat.key] = cat.questions.map(() => "");
      return acc;
    },
    {} as Record<string, (number | "")[]>
  );
}

/** Map API assessment steps to CategoryDef for the form */
function mapStepsToCategories(
  steps: { title: string; questions: string[] }[]
): CategoryDef[] {
  return steps.map((step, i) => ({
    key: `step_${i}`,
    name: step.title || `Step ${i + 1}`,
    description: "",
    questions: (step.questions || []).map((q) => ({
      question: q,
      lowLabel: "Low",
      highLabel: "High",
    })),
  }));
}

export default function AssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const initiativeTitle = (location.state as { initiativeTitle?: string } | null)?.initiativeTitle;
  const initiativeId = (location.state as { initiativeId?: string } | null)?.initiativeId;
  const stateAssessmentId = (location.state as { assessmentId?: string } | null)?.assessmentId;
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryDef[]>(CATEGORIES);
  const [loading, setLoading] = useState(!!(initiativeId || stateAssessmentId));
  const [activeCategory, setActiveCategory] = useState(0);
  const form = useForm({
    initialValues: { responses: getInitialResponses(CATEGORIES) },
  });

  useEffect(() => {
    const loadAssessment = (assessment: { _id: string; steps?: { title: string; questions: string[] }[] } | null) => {
      if (!assessment) return;
      setAssessmentId(assessment._id);
      if (assessment.steps?.length) {
        const mapped = mapStepsToCategories(assessment.steps);
        setCategories(mapped);
        form.setValues({ responses: getInitialResponses(mapped) });
      }
    };
    if (stateAssessmentId) {
      setLoading(true);
      getAssessment(stateAssessmentId)
        .then(loadAssessment)
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }
    if (!initiativeId) return;
    setLoading(true);
    getAssessmentByInitiative(initiativeId)
      .then(loadAssessment)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initiativeId, stateAssessmentId]);

  const cat = categories[activeCategory];
  const responses = form.values.responses;
  const totalQuestions = getTotalQuestions(categories);

  const answeredCount = useMemo(() => {
    let n = 0;
    for (const key of Object.keys(responses)) {
      n += responses[key].filter((v) => v !== "" && v !== undefined).length;
    }
    return n;
  }, [responses]);

  const progressPercent = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  function getCategoryStatus(index: number): "current" | "completed" | "partial" | "not_started" {
    const c = categories[index];
    if (!c) return "not_started";
    const key = c.key;
    const vals = responses[key] ?? [];
    const total = c.questions.length;
    const answered = vals.filter((v) => v !== "" && v !== undefined).length;
    if (index === activeCategory) return "current";
    if (answered === total) return "completed";
    if (answered > 0) return "partial";
    return "not_started";
  }

  const handleNext = () => {
    if (activeCategory < categories.length - 1) {
      setActiveCategory((c) => c + 1);
    } else {
      form.onSubmit(handleSubmit)();
    }
  };

  const handlePrev = () => setActiveCategory((c) => Math.max(0, c - 1));

  function getRiskLevelLabel(score: number): string {
    if (score >= 4.0) return "Low Risk";
    if (score >= 2.5) return "Medium Risk";
    return "High Risk";
  }

  const handleSubmit = async (values?: { responses: Record<string, (number | "")[]> }) => {
    const res = values?.responses ?? form.values.responses;
    const categoryScores = categories.map((c) => {
      const vals = (res[c.key] ?? []).map((v) => Number(v)).filter((n) => !Number.isNaN(n));
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { category: c.name, score: avg };
    });
    const overall =
      categoryScores.length ? categoryScores.reduce((sum, x) => sum + x.score, 0) / categoryScores.length : 0;
    if (assessmentId) {
      try {
        await createSubmission({
          assessmentId,
          overallScore: overall,
          riskLevel: getRiskLevelLabel(overall),
        });
      } catch {
        // still navigate to results
      }
    }
    navigate(ROUTES.ADMIN_ASSESSMENTS, {
      state: { categoryScores, overall, initiativeId, initiativeTitle, dimensionScores: categoryScores.map((x) => ({ label: x.category, score: x.score })) },
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box bg={PAGE_BG} py="xl">
          <Text size="sm" c="dimmed">Loading assessment...</Text>
        </Box>
      </AdminLayout>
    );
  }

  if (!initiativeId) {
    return (
      <AdminLayout>
        <Box bg={PAGE_BG} py="xl">
          <Paper withBorder p="xl" radius="md" bg="white">
            <Stack align="center" gap="md">
              <Text size="sm" c="dimmed" ta="center">
                No assessment selected. Open an assessment from the Assessments page (Pending tab) to take it.
              </Text>
              <Button variant="light" onClick={() => navigate(ROUTES.ADMIN_ASSESSMENTS)}>
                Back to Assessments
              </Button>
            </Stack>
          </Paper>
        </Box>
      </AdminLayout>
    );
  }

  if (!cat) {
    return (
      <AdminLayout>
        <Box bg={PAGE_BG} py="xl">
          <Text size="sm" c="dimmed">No questions in this assessment.</Text>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box bg={PAGE_BG} style={{ minHeight: "100%", paddingBottom: rem(40) }}>
        {/* Initiative context when opened from initiative detail */}
        {initiativeTitle && (
          <Group mb="md" gap="xs">
            <Text size="sm" c="dimmed">
              Assessment for initiative:
            </Text>
            <Text size="sm" fw={700}>
              {initiativeTitle}
            </Text>
          </Group>
        )}
        {/* Survey instruction: rate 1–5 */}
        <Paper withBorder p="md" radius="md" bg="white" mb="lg">
          <Text size="sm" fw={600} c={NAVY}>
            This is a survey. For each statement, choose a rating from <strong>1</strong> to <strong>5</strong> (1 = lowest, 5 = highest).
          </Text>
        </Paper>
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
                {categories.map((c, idx) => {
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
                      <Text size="sm" fw={600} c={NAVY} mb="xs">
                        {q.question}
                      </Text>
                      <Text size="xs" c="dimmed" mb="sm">{RATING_LABEL}</Text>
                      <Group justify="space-between" wrap="nowrap" mb={6}>
                        <Text size="xs" c="dimmed" fw={500}>{q.lowLabel}</Text>
                        <Text size="xs" c="dimmed" fw={500}>{q.highLabel}</Text>
                      </Group>
                      <Group gap="xs">
                        {RATING_SCALE.map((n) => (
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
                  Step {activeCategory + 1} of {categories.length}
                </Text>
                <Button
                  color={NAVY}
                  rightSection={<IconChevronRight size={18} />}
                  onClick={handleNext}
                >
                  {activeCategory === categories.length - 1 ? "Submit Assessment" : "Next Category →"}
                </Button>
              </Group>
            </Group>
          </Grid.Col>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
