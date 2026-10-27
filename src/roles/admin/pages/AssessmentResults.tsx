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
  MultiSelect,
  ActionIcon,
  Divider,
  Tabs,
  Table,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { NAVY, TEAL, PAGE_BG } from "@/constants";
import { useAppRoutes } from "@/hooks/useAppRoutes";
import { formatDraftTime, useServerDraft } from "@/hooks/useServerDraft";
import {
  IconCheck,
  IconAlertTriangle,
  IconRoute,
  IconStar,
  IconStarFilled,
  IconPlus,
  IconTrash,
  IconCheckbox,
  IconArchive,
  IconRestore,
} from "@tabler/icons-react";
import { listOrganizationUsers } from "@/api/auth";
import { listInitiatives } from "@/api/initiatives";
import { getMyOrganization } from "@/api/organizations";
import {
  createAssessment,
  createAssessmentDraft,
  deleteAssessmentDraft,
  listAssessmentDrafts,
  publishAssessmentDraft,
  updateAssessmentDraft,
  type CreateAssessmentPayload,
  listAssessments,
  listAssessmentTemplates,
  listSubmissions,
  type Assessment,
  type AssessmentSubmission,
  type AssessmentTemplate,
  listAllAssessmentsForAdmin,
  listArchivedAssessments,
  archiveAssessment,
  restoreAssessment,
  deleteAssessmentPermanently,
} from "@/api/assessments";
import { AssessmentActionModal, type RecordAction } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import AiAssessmentGenerator from "@/components/ai/AiAssessmentGenerator";
import { formatDateOnly, parseDateOnly, toDateOnlyString } from "@/utils";

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
  pillars?: string[];
}

interface AssessmentCreateValues {
  name: string;
  owner: string;
  initiative: string;
  audience: string;
  audienceDepartments: string[];
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
  { value: "department", label: "Department" },
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

/** Final payload for create / publish. */
function toAssessmentPayload(values: AssessmentCreateValues): CreateAssessmentPayload {
  const naviLetters = new Set(["N", "A", "V", "I"]);
  return {
    name: values.name,
    initiativeId: values.initiative.trim(),
    ownerId: values.owner || undefined,
    dueDate: values.dueDate || undefined,
    audience: values.audience || undefined,
    audienceDepartments: values.audience === "department" ? (values.audienceDepartments ?? []) : undefined,
    description: values.description || undefined,
    steps: (values.steps ?? []).map((s) => {
      const questions = s.questions ?? [];
      const pillars = s.pillars;
      const pillarsOk =
        Array.isArray(pillars) &&
        pillars.length === questions.length &&
        pillars.every((p) => naviLetters.has(String(p || "").trim().toUpperCase()));
      return {
        title: s.title ?? "",
        questions,
        ...(pillarsOk ? { pillars: pillars!.map((p) => String(p || "").trim().toUpperCase()) } : {}),
      };
    }),
  };
}

/** Partial payload for saving a draft: whatever has been filled in so far. */
function toDraftPayload(values: AssessmentCreateValues): Partial<CreateAssessmentPayload> {
  const full = toAssessmentPayload(values);
  return {
    ...full,
    initiativeId: full.initiativeId || undefined,
    audienceDepartments: values.audienceDepartments ?? [],
    audience: values.audience ?? "",
    description: values.description ?? "",
    dueDate: values.dueDate ?? "",
    ownerId: values.owner ?? "",
  };
}

const isEmptyAssessment = (v: AssessmentCreateValues) =>
  !v.name?.trim() &&
  !v.description?.trim() &&
  !(v.steps ?? []).some((st) => st.title?.trim() || (st.questions ?? []).some((q) => q?.trim()));

export default function AssessmentResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const appRoutes = useAppRoutes();
  const canCreateAssessment = user?.role === "admin";
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [managers, setManagers] = useState<{ value: string; label: string }[]>([]);
  const [initiatives, setInitiatives] = useState<{ value: string; label: string }[]>([]);
  const [orgDepartments, setOrgDepartments] = useState<string[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<Assessment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<AssessmentSubmission[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [initiativeTitleMap, setInitiativeTitleMap] = useState<Record<string, string>>({});
  const [assessmentTemplates, setAssessmentTemplates] = useState<AssessmentTemplate[]>([]);

  useEffect(() => {
    if (!createOpen) return;
    listOrganizationUsers()
      .then((users) => {
        // Admins + managers can own an assessment. Listing managers only left the required
        // Owner dropdown empty in orgs without managers, so "Create" silently did nothing.
        const list = users
          .filter((u) => u.role === "manager" || u.role === "admin")
          .map((u) => ({
            value: String(u._id),
            label: `${u.name} (${u.role === "admin" ? "Admin" : "Manager"})`,
          }));
        setManagers(list);
      })
      .catch(() => setManagers([]));
    listInitiatives()
      .then((list) => {
        setInitiatives(list.map((i) => ({ value: i.id, label: i.title })));
      })
      .catch(() => setInitiatives([]));
    getMyOrganization()
      .then((org) => setOrgDepartments(org.departments ?? []))
      .catch(() => setOrgDepartments([]));
    listAssessmentTemplates()
      .then((t) => setAssessmentTemplates(Array.isArray(t) ? t : []))
      .catch(() => setAssessmentTemplates([]));
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
      audienceDepartments: [],
      dueDate: "",
      description: "",
      steps: [{ title: "", questions: [""], pillars: undefined }],
    },
    validate: {
      name: (v) => (!v?.trim() ? "Assessment name is required" : null),
      owner: (v) => (!v ? "Owner is required" : null),
      initiative: (v) => (!v ? "Related initiative is required" : null),
    },
  });

  // Drafts are saved to the database as the admin types, so they follow them across devices.
  const assessmentDraft = useServerDraft(createForm.values, {
    enabled: createOpen && canCreateAssessment,
    isEmpty: isEmptyAssessment,
    save: async (v, id) =>
      id
        ? (await updateAssessmentDraft(id, toDraftPayload(v)))._id
        : (await createAssessmentDraft(toDraftPayload(v)))._id,
  });
  const [drafts, setDrafts] = useState<Assessment[]>([]);
  const [draftActionBusy, setDraftActionBusy] = useState(false);

  const refreshDrafts = () => {
    if (!canCreateAssessment) return;
    listAssessmentDrafts()
      .then((list) => setDrafts(Array.isArray(list) ? list : []))
      .catch(() => setDrafts([]));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refreshDrafts, [canCreateAssessment]);

  // Admin management: every active assessment (any audience) plus the archive.
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([]);
  const [archivedAssessments, setArchivedAssessments] = useState<Assessment[]>([]);
  const [assessmentAction, setAssessmentAction] = useState<RecordAction<Assessment & { title: string }> | null>(null);

  const refreshManaged = () => {
    if (!canCreateAssessment) return;
    listAllAssessmentsForAdmin()
      .then((list) => setAllAssessments(Array.isArray(list) ? list : []))
      .catch(() => setAllAssessments([]));
    listArchivedAssessments()
      .then((list) => setArchivedAssessments(Array.isArray(list) ? list : []))
      .catch(() => setArchivedAssessments([]));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refreshManaged, [canCreateAssessment]);

  const runAssessmentAction = async () => {
    if (!assessmentAction) return;
    const { kind, item } = assessmentAction;
    if (kind === "archive") await archiveAssessment(item._id);
    else if (kind === "restore") await restoreAssessment(item._id);
    else await deleteAssessmentPermanently(item._id);
    refreshManaged();
    const list = await listAssessments().catch(() => null);
    if (list) setAssessmentsList(list);
  };

  const openCreateAssessment = (draft?: Assessment) => {
    setCreateError(null);
    if (draft) {
      // Same key order as initialValues so the baseline matches and opening doesn't re-save.
      const values: AssessmentCreateValues = {
        name: draft.name ?? "",
        owner: draft.ownerId ? String(draft.ownerId) : "",
        initiative: draft.initiativeId ? String(draft.initiativeId) : "",
        audience: draft.audience ?? "",
        audienceDepartments: draft.audienceDepartments ?? [],
        dueDate: toDateOnlyString(draft.dueDate) ?? "",
        description: draft.description ?? "",
        steps: draft.steps?.length
          ? draft.steps.map((st) => ({
              title: st.title ?? "",
              questions: st.questions?.length ? st.questions : [""],
              pillars: st.pillars?.some((p) => p) ? st.pillars : undefined,
            }))
          : [{ title: "", questions: [""], pillars: undefined }],
      };
      createForm.setValues(values);
      assessmentDraft.reset(draft._id, values);
    } else {
      createForm.reset();
      assessmentDraft.reset(null);
      if (user?._id && (user.role === "admin" || user.role === "manager")) {
        createForm.setFieldValue("owner", String(user._id));
      }
    }
    setCreateOpen(true);
  };

  /** Close the dialog, saving any last edits to the draft first. */
  const closeCreateAssessment = async () => {
    setCreateOpen(false);
    setCreateError(null);
    await assessmentDraft.flush();
    refreshDrafts();
  };

  const discardDraft = async (id?: string | null) => {
    setDraftActionBusy(true);
    try {
      const target = id ?? (await assessmentDraft.settle());
      if (target) await deleteAssessmentDraft(target);
      if (!id || id === assessmentDraft.draftId) {
        assessmentDraft.reset(null);
        createForm.reset();
      }
      refreshDrafts();
    } catch {
      setCreateError("Could not delete the draft. Please try again.");
    } finally {
      setDraftActionBusy(false);
    }
  };

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
    { title: "Assessments", href: appRoutes.ASSESSMENTS },
    { title: "Results", href: "#" },
  ];

  return (
    <AdminLayout>
      <Box bg={PAGE_BG} style={{ minHeight: "100%", paddingBottom: 40 }}>
        {canCreateAssessment && (
        <Modal
          opened={createOpen}
          onClose={() => void closeCreateAssessment()}
          title={assessmentDraft.draftId ? "Edit Assessment Draft" : "Create Assessment"}
          centered
          size="lg"
          styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
        >
          <form
            onSubmit={createForm.onSubmit(async (values) => {
              setCreateError(null);
              if (!values.initiative?.trim()) {
                setCreateError("Related initiative is required.");
                return;
              }
              try {
                const payload = toAssessmentPayload(values);
                // Let any in-flight autosave finish so we publish the right draft.
                const draftId = await assessmentDraft.settle();
                if (draftId) {
                  await publishAssessmentDraft(draftId, payload);
                } else {
                  await createAssessment(payload);
                }
                setCreateOpen(false);
                setCreateError(null);
                assessmentDraft.reset(null);
                createForm.reset();
                refreshDrafts();
                const list = await listAssessments().catch(() => null);
                if (Array.isArray(list)) setAssessmentsList(list);
              } catch (err) {
                const raw = (err as { message?: string | string[] }).message;
                const msg = Array.isArray(raw)
                  ? raw.join(", ")
                  : (raw ?? "Failed to create assessment. Please try again.");
                setCreateError(msg);
              }
            }, (errors) => {
              // Validation errors sit at the top of a long, scrolling form; say so next to the button.
              const missing = Object.values(errors).filter(Boolean).join(" · ");
              setCreateError(`Please complete the required fields at the top of the form: ${missing}`);
            })}
          >
            <Stack gap="md">
              {(assessmentDraft.draftId || assessmentDraft.status !== "idle") && (
                <Group justify="space-between" gap="xs" wrap="nowrap">
                  <Text size="xs" c={assessmentDraft.status === "error" ? "red" : "dimmed"}>
                    {assessmentDraft.status === "saving"
                      ? "Saving draft…"
                      : assessmentDraft.status === "error"
                        ? `Draft not saved: ${assessmentDraft.error}`
                        : assessmentDraft.savedAt
                          ? `Draft saved to your account at ${formatDraftTime(assessmentDraft.savedAt)}`
                          : "Editing a saved draft. Changes save automatically."}
                  </Text>
                  {assessmentDraft.draftId && (
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      color="red"
                      type="button"
                      loading={draftActionBusy}
                      onClick={() => void discardDraft()}
                    >
                      Discard draft
                    </Button>
                  )}
                </Group>
              )}
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
                    value={parseDateOnly(createForm.values.dueDate)}
                    onChange={(d) => createForm.setFieldValue("dueDate", toDateOnlyString(d) ?? "")}
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
              {createForm.values.audience === "department" && (
                <MultiSelect
                  label="Primary departments"
                  placeholder="Select departments"
                  description="Users in these departments can take this assessment."
                  data={orgDepartments}
                  {...createForm.getInputProps("audienceDepartments")}
                  clearable
                />
              )}
              <Textarea
                label="Description"
                placeholder="Short description so others understand the purpose of this assessment."
                minRows={3}
                autosize
                {...createForm.getInputProps("description")}
              />

              <Divider label="Questions" labelPosition="center" />

              <Select
                label="Start from NAVI template (optional)"
                placeholder="Blank form — build your own"
                clearable
                data={assessmentTemplates.map((t) => ({ value: t.id, label: t.name }))}
                onChange={(id) => {
                  if (!id) return;
                  const t = assessmentTemplates.find((x) => x.id === id);
                  if (!t?.steps?.length) return;
                  createForm.setFieldValue(
                    "steps",
                    t.steps.map((s) => ({
                      title: s.title ?? "",
                      questions: [...(s.questions ?? [])],
                      pillars: s.pillars ? [...s.pillars] : undefined,
                    })),
                  );
                }}
              />
              <Text size="xs" c="dimmed">
                Templates include NAVI pillar tags (N, A, V, I) so submissions can compute organization NAVI scores.
              </Text>
              <AiAssessmentGenerator
                initiativeId={createForm.values.initiative}
                hasQuestions={createForm.values.steps.some((s) => s.questions.some((q) => q.trim()))}
                onSteps={(steps) =>
                  createForm.setFieldValue(
                    "steps",
                    steps.map((s) => ({ title: s.title, questions: [...s.questions], pillars: [...s.pillars] })),
                  )
                }
              />

              <Text size="sm" c="dimmed">
                Add steps (e.g. sections) and questions for each step. Each step can have multiple questions.
              </Text>

              {createForm.values.steps.map((_, stepIdx) => (
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
                          onClick={() => {
                            createForm.removeListItem(`steps.${stepIdx}.questions`, qIdx);
                            const plen = createForm.values.steps[stepIdx]?.pillars?.length ?? 0;
                            if (plen > qIdx) {
                              createForm.removeListItem(`steps.${stepIdx}.pillars`, qIdx);
                            }
                          }}
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
                      onClick={() => {
                        createForm.insertListItem(`steps.${stepIdx}.questions`, "");
                        if (createForm.values.steps[stepIdx]?.pillars != null) {
                          createForm.insertListItem(`steps.${stepIdx}.pillars`, "");
                        }
                      }}
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
                  createForm.insertListItem("steps", { title: "", questions: [""], pillars: undefined })
                }
              >
                Add step
              </Button>

              {createError && (
                <Text c="red" size="sm" fw={600}>
                  {createError}
                </Text>
              )}

              <Group justify="flex-end" mt="md">
                <Button variant="default" type="button" onClick={() => void closeCreateAssessment()}>
                  Close
                </Button>
                <Button
                  variant="light"
                  type="button"
                  loading={assessmentDraft.status === "saving"}
                  onClick={async () => {
                    if (isEmptyAssessment(createForm.values)) {
                      setCreateError("Add a name or some questions before saving a draft.");
                      return;
                    }
                    await assessmentDraft.flush();
                    if ((await assessmentDraft.settle()) == null) {
                      setCreateError("Could not save the draft. Please try again.");
                      return;
                    }
                    await closeCreateAssessment();
                  }}
                >
                  Save draft
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
                  onClick={() => openCreateAssessment()}
                >
                  Create Assessment
                </Button>
              )}
              <Button
                variant="light"
                color="dark"
                leftSection={<IconRoute size={18} />}
                onClick={() => navigate(appRoutes.ROADMAP)}
              >
                View Roadmap
              </Button>
            </Group>
          </Group>
        </Stack>

        {canCreateAssessment && drafts.length > 0 && (
          <Paper withBorder radius="md" bg="white" p="md" mb="lg">
            <Text fw={700} size="sm" c="dimmed" tt="uppercase" lts={0.5} mb="sm">
              Drafts ({drafts.length})
            </Text>
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Initiative</Table.Th>
                  <Table.Th>Last saved</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {drafts.map((d) => (
                  <Table.Tr key={d._id}>
                    <Table.Td fw={500}>{d.name?.trim() || "Untitled draft"}</Table.Td>
                    <Table.Td>{(d.initiativeId && initiativeTitleMap[String(d.initiativeId)]) || "—"}</Table.Td>
                    <Table.Td>{d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "—"}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Button size="xs" variant="light" onClick={() => openCreateAssessment(d)}>
                          Continue editing
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          loading={draftActionBusy}
                          onClick={() => {
                            if (window.confirm(`Delete draft "${d.name?.trim() || "Untitled draft"}"?`)) {
                              void discardDraft(d._id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* No assessments for this role: show single empty state */}
        {!assessmentsLoading &&
        assessmentsList.length === 0 &&
        mySubmissions.length === 0 &&
        allAssessments.length === 0 &&
        archivedAssessments.length === 0 ? (
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
              {canCreateAssessment && (
                <>
                  <Tabs.Tab value="all">All assessments ({allAssessments.length})</Tabs.Tab>
                  <Tabs.Tab value="archived">Archived ({archivedAssessments.length})</Tabs.Tab>
                </>
              )}
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
                      <Table.Th>NAVI</Table.Th>
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
                          {s.naviIndex != null && Number.isFinite(Number(s.naviIndex)) ? (
                            <Stack gap={2}>
                              <Text size="sm" fw={600}>
                                {Number(s.naviIndex).toFixed(2)}
                              </Text>
                              {s.naviClassification && (
                                <Text size="xs" c="dimmed">
                                  {s.naviClassification}
                                </Text>
                              )}
                            </Stack>
                          ) : (
                            "—"
                          )}
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
                            {formatDateOnly(a.dueDate)}
                          </Table.Td>
                          <Table.Td>
                            <Button
                              size="xs"
                              color={NAVY}
                              variant="light"
                              onClick={() =>
                                navigate(appRoutes.ASSESSMENTS_FORM, {
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
            {canCreateAssessment && (
              <>
                <Tabs.Panel value="all" pt="md" px="md" pb="md">
                  {allAssessments.length === 0 ? (
                    <Text size="sm" c="dimmed">No published assessments yet.</Text>
                  ) : (
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Assessment</Table.Th>
                          <Table.Th>Initiative</Table.Th>
                          <Table.Th>Due date</Table.Th>
                          <Table.Th />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {allAssessments.map((a) => (
                          <Table.Tr key={a._id}>
                            <Table.Td fw={500}>{a.name}</Table.Td>
                            <Table.Td>{initiativeTitleMap[toId(a.initiativeId)] ?? "—"}</Table.Td>
                            <Table.Td>{formatDateOnly(a.dueDate)}</Table.Td>
                            <Table.Td>
                              <Group justify="flex-end">
                                <Button
                                  size="xs"
                                  variant="subtle"
                                  color="gray"
                                  leftSection={<IconArchive size={14} />}
                                  onClick={() => setAssessmentAction({ kind: "archive", item: { ...a, title: a.name } })}
                                >
                                  Archive
                                </Button>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </Tabs.Panel>
                <Tabs.Panel value="archived" pt="md" px="md" pb="md">
                  <Text size="xs" c="dimmed" mb="sm">
                    Archived assessments can't be taken, and their submissions don't count toward readiness or NAVI
                    scores. Restore one to bring it back, or delete it permanently.
                  </Text>
                  {archivedAssessments.length === 0 ? (
                    <Text size="sm" c="dimmed">No archived assessments.</Text>
                  ) : (
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Assessment</Table.Th>
                          <Table.Th>Initiative</Table.Th>
                          <Table.Th>Archived</Table.Th>
                          <Table.Th />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {archivedAssessments.map((a) => (
                          <Table.Tr key={a._id}>
                            <Table.Td fw={500}>{a.name}</Table.Td>
                            <Table.Td>{initiativeTitleMap[toId(a.initiativeId)] ?? "—"}</Table.Td>
                            <Table.Td>{a.archivedAt ? new Date(a.archivedAt).toLocaleDateString() : "—"}</Table.Td>
                            <Table.Td>
                              <Group gap="xs" justify="flex-end">
                                <Button
                                  size="xs"
                                  variant="light"
                                  leftSection={<IconRestore size={14} />}
                                  onClick={() => setAssessmentAction({ kind: "restore", item: { ...a, title: a.name } })}
                                >
                                  Restore
                                </Button>
                                <Button
                                  size="xs"
                                  variant="subtle"
                                  color="red"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() => setAssessmentAction({ kind: "delete", item: { ...a, title: a.name } })}
                                >
                                  Delete
                                </Button>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </Tabs.Panel>
              </>
            )}
          </Tabs>
        </Paper>
        )}

        <AssessmentActionModal
          action={assessmentAction}
          onClose={() => setAssessmentAction(null)}
          onConfirm={runAssessmentAction}
        />

        {!hasState && submittedSubmissions.length > 0 && (
          <Paper withBorder radius="md" p="md" mb="lg" bg="var(--mantine-color-default-hover)">
            <Text size="sm" c="dimmed">
              After you submit an assessment, a detailed readiness breakdown appears below for the rest of that visit.
              Your history stays in <strong>My submissions</strong> above.
            </Text>
          </Paper>
        )}

        {hasState && (
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
