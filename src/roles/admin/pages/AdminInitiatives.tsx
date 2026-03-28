import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Card,
  Text,
  Group,
  Title,
  Progress,
  Badge,
  Avatar,
  Stack,
  Box,
  rem,
  TextInput,
  Textarea,
  Button,
  ActionIcon,
  Select,
  Modal,
  MultiSelect,
  Divider,
  List,
  ThemeIcon,
  Anchor,
  Breadcrumbs,
  Grid,
} from "@mantine/core";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppRoutes } from "@/hooks/useAppRoutes";
import {
  listInitiatives,
  createInitiative,
  updateInitiative,
  type InitiativeListItem,
  type CreateInitiativePayload,
} from "@/api/initiatives";
import { listOrganizationUsers } from "@/api/auth";
import { getMyOrganization, updateMyOrganization } from "@/api/organizations";
import { listTasks } from "@/api/tasks";
import { listSubmissions, type AssessmentSubmission } from "@/api/assessments";
import type { ApiError } from "@/api/client";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { PageHeader } from "@/components";
import { IconSearch } from "@tabler/icons-react";
import { IconPlus } from "@tabler/icons-react";
import { IconCalendar } from "@tabler/icons-react";
import { IconChevronDown } from "@tabler/icons-react";
import { IconInfoCircle } from "@tabler/icons-react";
import { IconUsers } from "@tabler/icons-react";
import { IconTarget } from "@tabler/icons-react";
import { IconHelp, IconHistory } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { IconBulb } from "@tabler/icons-react";
import { IconRocket } from "@tabler/icons-react";
import { IconCheck } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { THEME_BLUE, TEAL_BLUE } from "@/constants";
import type { InitiativeFaq, InitiativeSummary, InitiativeStatus } from "@/types";

function toBackendStatus(status: InitiativeStatus): CreateInitiativePayload["status"] {
  if (status === "In Progress" || status === "Active") return "ACTIVE";
  if (status === "Draft") return "DRAFT";
  if (status === "Planning") return "PLANNING";
  return status as CreateInitiativePayload["status"];
}

function parseDateRange(range: string): { start: Date; end: Date } | null {
  const r = (range ?? "").replace(/\s+/g, " ").trim();
  if (!r || r.toLowerCase() === "—") return null;

  const quarterMatch = r.match(/^Q([1-4])\s*(\d{4})\s*(?:-|–)\s*Q([1-4])\s*(\d{4})$/i);
  if (quarterMatch) {
    const q1 = Number(quarterMatch[1]);
    const y1 = Number(quarterMatch[2]);
    const q2 = Number(quarterMatch[3]);
    const y2 = Number(quarterMatch[4]);
    const startMonth = (q1 - 1) * 3;
    const endMonth = q2 * 3 - 1;
    return {
      start: new Date(y1, startMonth, 1),
      end: new Date(y2, endMonth + 1, 0),
    };
  }

  const monthMap: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  const mMatch = r.match(
    /^([A-Za-z]{3,9})\s+(\d{1,2})(?:,\s*(\d{4}))?\s*(?:-|–)\s*([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})$/
  );
  if (!mMatch) return null;

  const m1 = monthMap[String(mMatch[1]).toLowerCase()] ?? null;
  const d1 = Number(mMatch[2]);
  const yEnd = Number(mMatch[6]);
  const m2 = monthMap[String(mMatch[4]).toLowerCase()] ?? null;
  const d2 = Number(mMatch[5]);
  if (m1 == null || m2 == null) return null;

  const y1 = mMatch[3] ? Number(mMatch[3]) : yEnd;
  return {
    start: new Date(y1, m1, d1),
    end: new Date(yEnd, m2, d2),
  };
}

function toId(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (typeof x === "object" && x !== null && "toString" in x) {
    return (x as { toString(): string }).toString();
  }
  return String(x);
}

/** Old create flow saved a fake "3.0/5" for every initiative; treat as no data without submissions. */
function isPlaceholderNumericReadiness(s: string | undefined): boolean {
  return /^\d+(\.\d+)?\s*\/\s*5$/i.test((s ?? "").trim());
}

function readinessLabelForCard(
  initiative: InitiativeListItem,
  avgFromSubmissions: number | undefined,
  submissionCount: number,
): string {
  if (submissionCount > 0 && avgFromSubmissions != null) {
    return `${avgFromSubmissions.toFixed(1)}/5`;
  }
  const stored = (initiative.readiness ?? "").trim();
  if (!stored || isPlaceholderNumericReadiness(stored)) return "—";
  return stored;
}

export default function AdminInitiatives() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const appRoutes = useAppRoutes();
  const canCreateInitiatives = user?.role === "admin" || user?.role === "manager";
  const [opened, { open, close }] = useDisclosure(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [initiatives, setInitiatives] = useState<InitiativeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<{ name: string; id: string }[]>([]);
  const [orgDepartments, setOrgDepartments] = useState<string[]>([]);
  const [tasksByInitiative, setTasksByInitiative] = useState<Record<string, { total: number; completed: number }>>({});
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const leadEnrollmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const isDraftStatus = (s?: string) => {
      const v = (s ?? "").toLowerCase();
      return v === "draft" || v.includes("draft");
    };
    (initiatives ?? []).forEach((i: any) => {
      const lead = i.leadName as string | undefined;
      if (!lead) return;
      if (isDraftStatus(i.status as string | undefined)) return;
      counts[lead] = (counts[lead] ?? 0) + 1;
    });
    return counts;
  }, [initiatives]);

  const leadEnrollmentInitiativesByLead = useMemo(() => {
    const out: Record<string, InitiativeListItem[]> = {};
    const isDraftStatus = (s?: string) => {
      const v = (s ?? "").toLowerCase();
      return v === "draft" || v.includes("draft");
    };
    (initiatives ?? []).forEach((i: any) => {
      const lead = i.leadName as string | undefined;
      if (!lead) return;
      if (isDraftStatus(i.status as string | undefined)) return;
      if (!out[lead]) out[lead] = [];
      out[lead].push(i);
    });
    return out;
  }, [initiatives]);

  const readinessStatsByInitiative = useMemo(() => {
    const acc: Record<string, { sum: number; count: number; avg: number }> = {};
    (submissions ?? []).forEach((s) => {
      const id = toId(s.initiativeId);
      if (!id) return;
      if (!acc[id]) acc[id] = { sum: 0, count: 0, avg: 0 };
      acc[id].sum += s.overallScore;
      acc[id].count += 1;
      acc[id].avg = acc[id].sum / acc[id].count;
    });
    return acc;
  }, [submissions]);

  const fetchInitiatives = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listInitiatives();
      setInitiatives(data);
      try {
        const subs = await listSubmissions();
        setSubmissions(Array.isArray(subs) ? subs : []);
      } catch {
        setSubmissions([]);
      }
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load initiatives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitiatives();
  }, []);

  useEffect(() => {
    listTasks()
      .then((list) => {
        const byInit: Record<string, { total: number; completed: number }> = {};
        (list ?? []).forEach((t) => {
          const id = String(t.initiativeId ?? "");
          if (!byInit[id]) byInit[id] = { total: 0, completed: 0 };
          byInit[id].total += 1;
          if ((t.progress ?? 0) >= 100) byInit[id].completed += 1;
        });
        setTasksByInitiative(byInit);
      })
      .catch(() => setTasksByInitiative({}));
  }, []);

  const fetchManagersAndOrg = useCallback(async () => {
    const [users, org] = await Promise.all([listOrganizationUsers(), getMyOrganization()]);
    const allStaff = (users ?? [])
      .filter((u) => u && u._id && u.name)
      .map((u) => ({ name: u.name, id: String(u._id) }));
    const currentUserId = user?._id != null ? String(user._id) : "";
    if (currentUserId && !allStaff.some((m) => m.id === currentUserId) && user?.name) {
      allStaff.push({ name: user.name, id: currentUserId });
    }
    setManagers(allStaff);
    setOrgDepartments(org.departments ?? []);
  }, [user?._id, user?.name]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listOrganizationUsers(), getMyOrganization()])
      .then(([users, org]) => {
        if (cancelled) return;
        // Any staff member (admins, managers, employees) can be selected as Change Lead
        const allStaff = (users ?? [])
          .filter((u) => u && u._id && u.name)
          .map((u) => ({ name: u.name, id: String(u._id) }));
        const currentUserId = user?._id != null ? String(user._id) : "";
        if (currentUserId && !allStaff.some((m) => m.id === currentUserId) && user?.name) {
          allStaff.push({ name: user.name, id: currentUserId });
        }
        setManagers(allStaff);
        setOrgDepartments(org.departments ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?._id, user?.role, user?.name]);

  const handleOpenCreateModal = useCallback(() => {
    fetchManagersAndOrg().catch(() => {});
    open();
  }, [fetchManagersAndOrg, open]);

  const handleAddDepartment = useCallback(
    async (newDept: string) => {
      const trimmed = newDept?.trim();
      if (!trimmed) return;
      if (orgDepartments.includes(trimmed)) return;
      try {
        await updateMyOrganization({ departments: [...orgDepartments, trimmed] });
        const org = await getMyOrganization();
        setOrgDepartments(org.departments ?? []);
      } catch {
        // leave orgDepartments unchanged on error
      }
    },
    [orgDepartments]
  );

  const handleSave = async (data: InitiativeSummary) => {
    if (editIndex === null) return;
    const initiative = initiatives[editIndex];
    const id = initiative?.id ?? (initiative as InitiativeListItem).id;
    if (!id) return;
    setError(null);
    try {
      await updateInitiative(id, {
        title: data.title,
        leadName: data.leadName,
        status: toBackendStatus(data.status),
        dateRange: data.dateRange,
        departments: data.departments,
        progress: data.progress ?? 0,
        goals: data.goals,
        faqs: data.faqs,
        readiness: data.readiness,
        changeType: data.changeType,
        raciAccountableIds: data.raciAccountableIds ?? [],
        raciResponsibleIds: data.raciResponsibleIds ?? [],
        raciConsultedIds: data.raciConsultedIds ?? [],
        raciInformedIds: data.raciInformedIds ?? [],
      });
      await fetchInitiatives();
      setEditIndex(null);
      close();
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to update initiative");
    }
  };

  const handleAdd = async (data: InitiativeSummary & { description?: string }) => {
    setError(null);
    try {
      const payload: CreateInitiativePayload = {
        title: data.title,
        description: data.description,
        leadName: data.leadName,
        status: user?.role === "manager" ? "WAITING_FOR_APPROVAL" : toBackendStatus(data.status),
        dateRange: data.dateRange,
        departments: data.departments ?? [],
        progress: data.progress ?? 0,
        goals: data.goals ?? [],
        faqs: data.faqs ?? [],
        readiness: data.readiness,
        changeType: data.changeType,
        raciAccountableIds: data.raciAccountableIds ?? [],
        raciResponsibleIds: data.raciResponsibleIds ?? [],
        raciConsultedIds: data.raciConsultedIds ?? [],
        raciInformedIds: data.raciInformedIds ?? [],
      };
      await createInitiative(payload);
      await fetchInitiatives();
      close();
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to create initiative");
    }
  };

  // Filter by search
  const filtered = initiatives.filter((i) => {
    // Managers should only see initiatives they are "part of":
    // - either they are explicitly the lead (leadName)
    // - or the initiative impacts one of their departments
    if (user?.role === "manager") {
      const managerName = String(user.name ?? "").toLowerCase();
      const leadMatch = String(i.leadName ?? "").toLowerCase() === managerName;
      const managerDepts = new Set((user.departments ?? []).map((d) => String(d).toLowerCase()));
      // If `departments` is empty, it means the initiative impacts the whole organization.
      const deptMatch =
        (i.departments ?? []).length === 0 ||
        (i.departments ?? []).some((d) => managerDepts.has(String(d).toLowerCase()));
      if (!leadMatch && !deptMatch) return false;
    }

    return (
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.leadName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Change Initiatives"
        subtitle="Manage and track all organizational change initiatives"
        actions={
          canCreateInitiatives ? (
            <Button
              onClick={() => {
                setEditIndex(null);
                handleOpenCreateModal();
              }}
              leftSection={<IconPlus size={18} />}
              bg={THEME_BLUE}
              radius="md"
              h={45}
              px="xl"
              fw={700}
            >
              New Initiative
            </Button>
          ) : undefined
        }
      />

      {error && (
        <Text c="red" size="sm" mb="md">
          {error}
        </Text>
      )}

      <Card withBorder radius="md" p="md" mb={40} shadow="xs">
        <Group grow>
          <TextInput
            placeholder="Search initiatives..."
            leftSection={<IconSearch size={16} />}
            variant="default"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </Group>
      </Card>

      <Grid gutter={32} mb={40}>
        {loading ? (
          <Grid.Col span={12}>
            <Text c="dimmed" size="sm" py="xl" ta="center">
              Loading initiatives...
            </Text>
          </Grid.Col>
        ) : (
          <>
            {filtered.map((i) => {
              const initId = String(i.id ?? "");
              const rs = readinessStatsByInitiative[initId];
              const readinessText = readinessLabelForCard(i, rs?.avg, rs?.count ?? 0);
              return (
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={i.id}>
            <Card
              withBorder
              radius="md"
              p="lg"
              shadow="xs"
              style={{
                minHeight: 340,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Group justify="space-between" align="flex-start" mb={8}>
                <Badge
                  color={
                    i.status === "ACTIVE"
                      ? "teal"
                      : i.status === "DRAFT"
                        ? "yellow"
                        : "blue"
                  }
                  variant="filled"
                  radius="sm"
                  fw={700}
                  size="md"
                >
                  {i.status}
                </Badge>
                <Group gap={4} align="center">
                  <Box
                    w={8}
                    h={8}
                    bg={
                      i.status === "ACTIVE"
                        ? "#40c057"
                        : i.status === "DRAFT"
                          ? "#fab005"
                          : "#228be6"
                    }
                    style={{ borderRadius: "50%" }}
                  />
                  <Text fz={12} fw={700} c="dimmed">
                    Readiness: {readinessText}
                  </Text>
                </Group>
              </Group>
              <Title order={3} fz={20} fw={800} mb={4}>
                {i.title}
              </Title>
              <Group gap={8} align="center" mb={4}>
                <Avatar size={32} radius="md" />
                <Box>
                  <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                    Change Lead
                  </Text>
                  <Text fz={14} fw={800}>
                    {i.leadName}
                  </Text>
                </Box>
              </Group>
              <Group gap={8} mb={4}>
                <IconCalendar size={16} color="#adb5bd" />
                <Text fz={12} fw={600} c="dimmed">
                  {i.dateRange}
                </Text>
              </Group>
              <Group gap={4} wrap="wrap" mb={8}>
                {i.departments?.map((d: string) => (
                  <Badge
                    key={d}
                    color="gray"
                    variant="light"
                    radius="xs"
                    fz={10}
                    fw={700}
                  >
                    {d}
                  </Badge>
                ))}
              </Group>
              <Box mb={8}>
                <Text fz={11} fw={700} c="dimmed" mb={2}>
                  Overall Progress
                </Text>
                <Progress
                  value={i.progress}
                  color={THEME_BLUE}
                  h={6}
                  radius="xl"
                />
                <Text fz={11} c="dimmed" mt={2}>
                  {i.progress}%
                </Text>
              </Box>
              {(() => {
                const road = tasksByInitiative[String(i.id)] ?? { total: 0, completed: 0 };
                return road.total > 0 ? (
                  <Group gap={6} mb={8}>
                    <IconRocket size={14} color={THEME_BLUE} />
                    <Text fz={11} fw={600} c="dimmed">
                      Roadmap: {road.total} task{road.total !== 1 ? "s" : ""}
                      {road.completed > 0 ? ` · ${road.completed} completed` : ""}
                    </Text>
                  </Group>
                ) : null;
              })()}
              {(i.status === "WAITING_FOR_APPROVAL" || i.status === "PLANNING") && user?.role === "admin" && (
                <Button
                  fullWidth
                  variant="filled"
                  color="teal"
                  fw={700}
                  radius="md"
                  h={38}
                  mb={8}
                  leftSection={<IconCheck size={16} />}
                  onClick={async () => {
                    try {
                      await updateInitiative(i.id, { status: "ACTIVE" });
                      await fetchInitiatives();
                    } catch {
                      // keep state
                    }
                  }}
                >
                  Approve initiative
                </Button>
              )}
              <Group grow mt={8}>
                <Button
                  variant="subtle"
                  color={THEME_BLUE}
                  fw={700}
                  radius="md"
                  h={38}
                  style={{ fontSize: 14 }}
                  onClick={() =>
                    navigate(appRoutes.INITIATIVE_DETAIL(i.id))
                  }
                >
                  View Details
                </Button>
                <Button
                  variant="subtle"
                  color={THEME_BLUE}
                  fw={700}
                  radius="md"
                  h={38}
                  style={{ fontSize: 14 }}
                  onClick={() =>
                    navigate(appRoutes.ROADMAP, { state: { initiativeId: i.id } })
                  }
                >
                  View Roadmap
                </Button>
              </Group>
            </Card>
          </Grid.Col>
              );
            })}
        {!loading && filtered.length === 0 && (
          <Grid.Col span={12}>
            <Text c="dimmed" size="md" py="xl" ta="center">
              All initiatives will display here.
            </Text>
          </Grid.Col>
        )}
          </>
        )}
      </Grid>

      {editIndex === null ? (
        <CreateInitiativeModal
          opened={opened}
          onClose={() => {
            setEditIndex(null);
            close();
          }}
          onAdd={handleAdd}
          managers={managers}
          orgDepartments={orgDepartments}
          onAddDepartment={handleAddDepartment}
          leadEnrollmentCounts={leadEnrollmentCounts}
          leadEnrollmentInitiativesByLead={leadEnrollmentInitiativesByLead}
        />
      ) : (
        <InitiativeModal
          opened={opened}
          onClose={() => {
            setEditIndex(null);
            close();
          }}
          onSave={handleSave}
          initial={initiatives[editIndex]}
          managers={managers}
          orgDepartments={orgDepartments}
          onAddDepartment={handleAddDepartment}
          leadEnrollmentCounts={leadEnrollmentCounts}
          leadEnrollmentInitiativesByLead={leadEnrollmentInitiativesByLead}
        />
      )}
    </AdminLayout>
  );
}

// Modal with repeater for goals, Mantine form
interface InitiativeModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (data: InitiativeSummary) => void;
  initial: InitiativeSummary | null;
  managers: { name: string; id: string }[];
  orgDepartments: string[];
  onAddDepartment: (name: string) => void | Promise<void>;
  leadEnrollmentCounts: Record<string, number>;
  leadEnrollmentInitiativesByLead: Record<string, InitiativeListItem[]>;
}

function InitiativeModal({
  opened,
  onClose,
  onSave,
  initial,
  managers,
  orgDepartments,
  onAddDepartment,
  leadEnrollmentCounts,
  leadEnrollmentInitiativesByLead,
}: InitiativeModalProps) {
  const [addDeptOpen, { open: openAddDept, close: closeAddDept }] = useDisclosure(false);
  const [newDeptName, setNewDeptName] = useState("");
  const departmentOptions = orgDepartments;
  const leadOptions = managers.map((m) => ({
    value: m.name,
    label: `${m.name} (${leadEnrollmentCounts[m.name] ?? 0})`,
  }));

  type ImpactScope = "departments" | "organization";
  const [impactScope, setImpactScope] = useState<ImpactScope>(
    (initial?.departments?.length ?? 0) > 0 ? "departments" : "organization",
  );
  const impactScopeRef = useRef<ImpactScope>(impactScope);
  useEffect(() => {
    impactScopeRef.current = impactScope;
  }, [impactScope]);

  const form = useForm({
    initialValues: {
      title: initial?.title || "",
      leadName: initial?.leadName || "",
      status: initial?.status || "ACTIVE",
      dateRange: initial?.dateRange || "",
      departments: initial?.departments || [],
      progress: initial?.progress || 0,
      goals: initial?.goals?.length
        ? initial.goals
        : [{ goal: "", metric: "" }],
      faqs:
        initial?.faqs?.length && initial.faqs.some((f) => f.question?.trim() || f.answer?.trim())
          ? initial.faqs.map((f) => ({
              question: f.question ?? "",
              answer: f.answer ?? "",
            }))
          : [{ question: "", answer: "" }],
      changeType: (initial as InitiativeSummary | null)?.changeType ?? "Other",
      raciAccountableIds: (initial as InitiativeSummary | null)?.raciAccountableIds ?? [],
      raciResponsibleIds: (initial as InitiativeSummary | null)?.raciResponsibleIds ?? [],
      raciConsultedIds: (initial as InitiativeSummary | null)?.raciConsultedIds ?? [],
      raciInformedIds: (initial as InitiativeSummary | null)?.raciInformedIds ?? [],
    },
    validate: {
      title: (v) => (!v ? "Title required" : null),
      leadName: (v) => (!v ? "Lead required" : null),
      status: (v) => (!v ? "Status required" : null),
      departments: (v) =>
        impactScopeRef.current === "departments" && v.length === 0
          ? "Select at least one department"
          : null,
    },
  });

  const selectedLeadInitiatives =
    leadEnrollmentInitiativesByLead[form.values.leadName ?? ""] ?? [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>Initiative Details</Title>}
      size="lg"
      centered
    >
      <form
        onSubmit={form.onSubmit((values) => {
          const faqsClean = (values.faqs as InitiativeFaq[])
            .filter((f) => f.question.trim() || f.answer.trim())
            .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));
          onSave({ ...values, faqs: faqsClean });
          form.reset();
        })}
      >
        <Stack gap="md">
          <TextInput label="Title" {...form.getInputProps("title")} />
          <Select
            label="Change Lead"
            placeholder="Select a manager..."
            data={leadOptions}
            {...form.getInputProps("leadName")}
          />
          {selectedLeadInitiatives.length > 0 && (
            <Box style={{ border: "1px solid #e9ecef", borderRadius: 8, padding: 10 }}>
              <Text fz="xs" c="dimmed" fw={700} mb={6}>
                Current enrollments
              </Text>
              {(() => {
                const parsed = selectedLeadInitiatives
                  .map((ini) => {
                    const bounds = parseDateRange(ini.dateRange);
                    if (!bounds) return null;
                    return { initiative: ini, startMs: bounds.start.getTime(), endMs: bounds.end.getTime() };
                  })
                  .filter((x): x is { initiative: InitiativeListItem; startMs: number; endMs: number } => x != null);
                if (parsed.length === 0) {
                  return (
                    <Stack gap={4}>
                      {selectedLeadInitiatives.slice(0, 4).map((ini) => (
                        <Text key={ini.id ?? ini._id ?? ini.title} fz={12} c="dimmed">
                          {ini.title}: {ini.dateRange}
                        </Text>
                      ))}
                    </Stack>
                  );
                }
                const minStart = Math.min(...parsed.map((p) => p.startMs));
                const maxEnd = Math.max(...parsed.map((p) => p.endMs));
                if (!Number.isFinite(minStart) || !Number.isFinite(maxEnd) || maxEnd <= minStart) {
                  return (
                    <Stack gap={4}>
                      {selectedLeadInitiatives.slice(0, 4).map((ini) => (
                        <Text key={ini.id ?? ini._id ?? ini.title} fz={12} c="dimmed">
                          {ini.title}: {ini.dateRange}
                        </Text>
                      ))}
                    </Stack>
                  );
                }
                return (
                  <Stack gap={8}>
                    {parsed
                      .slice()
                      .sort((a, b) => a.startMs - b.startMs)
                      .map((p) => {
                        const leftPct = ((p.startMs - minStart) / (maxEnd - minStart)) * 100;
                        const widthPct = ((p.endMs - p.startMs) / (maxEnd - minStart)) * 100;
                        return (
                          <Box key={p.initiative.id ?? p.initiative._id ?? p.initiative.title}>
                            <Text fz={11} fw={700} c="dimmed" style={{ marginBottom: 4 }}>
                              {p.initiative.title}
                            </Text>
                            <Box
                              style={{
                                position: "relative",
                                height: 10,
                                background: "#f1f3f5",
                                borderRadius: 999,
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                style={{
                                  position: "absolute",
                                  left: `${Math.max(0, leftPct)}%`,
                                  width: `${Math.max(2, widthPct)}%`,
                                  top: 0,
                                  bottom: 0,
                                  background: THEME_BLUE,
                                  opacity: 0.9,
                                }}
                                title={p.initiative.dateRange}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                  </Stack>
                );
              })()}
            </Box>
          )}
          <Select
            label="Status"
            data={["ACTIVE", "WAITING_FOR_APPROVAL", "DRAFT", "COMPLETED"]}
            {...form.getInputProps("status")}
          />
          <TextInput
            label="Timeline (e.g., Mar 1 – Sep 30, 2025)"
            {...form.getInputProps("dateRange")}
          />
          <Select
            label="Impact Scope"
            data={[
              { value: "organization", label: "Whole organization impacted" },
              { value: "departments", label: "Department(s) impacted" },
            ]}
            value={impactScope}
            radius="md"
            size="md"
            onChange={(val) => {
              const next = (val as ImpactScope) ?? "departments";
              setImpactScope(next);
              if (next === "organization") {
                closeAddDept();
                setNewDeptName("");
                form.setFieldValue("departments", []);
              }
            }}
          />
          {impactScope === "organization" ? (
            <Text c="dimmed" fw={600} fz="sm">
              This initiative impacts the whole organization.
            </Text>
          ) : (
            <>
              <Group align="flex-end" gap="xs">
                <MultiSelect
                  label="Departments Impacted"
                  data={departmentOptions}
                  {...form.getInputProps("departments")}
                  style={{ flex: 1 }}
                />
                <Button
                  type="button"
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={openAddDept}
                  mb={4}
                >
                  Add Dept
                </Button>
              </Group>
              <Modal
                opened={addDeptOpen}
                onClose={() => {
                  closeAddDept();
                  setNewDeptName("");
                }}
                title="Add Department"
                size="sm"
              >
                <Stack gap="md">
                  <TextInput
                    placeholder="Department name"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = newDeptName.trim();
                        if (trimmed) {
                          onAddDepartment(trimmed);
                          form.setFieldValue("departments", [...form.values.departments, trimmed]);
                          closeAddDept();
                          setNewDeptName("");
                        }
                      }
                    }}
                  />
                  <Group justify="flex-end">
                    <Button
                      variant="subtle"
                      onClick={() => {
                        closeAddDept();
                        setNewDeptName("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const trimmed = newDeptName.trim();
                        if (trimmed) {
                          onAddDepartment(trimmed);
                          form.setFieldValue("departments", [...form.values.departments, trimmed]);
                          closeAddDept();
                          setNewDeptName("");
                        }
                      }}
                      disabled={!newDeptName.trim()}
                    >
                      Add
                    </Button>
                  </Group>
                </Stack>
              </Modal>
            </>
          )}
          <TextInput
            label="Progress (%)"
            type="number"
            min={0}
            max={100}
            {...form.getInputProps("progress")}
          />
          <Divider
            label="Goals & Success Measures"
            labelPosition="center"
            my="sm"
          />
          <Stack gap="xs">
            {form.values.goals.map((_item: unknown, idx: number) => (
              <Group key={idx} align="center">
                <TextInput
                  placeholder="Goal (e.g., Reduce latency)"
                  {...form.getInputProps(`goals.${idx}.goal`)}
                  flex={2}
                />
                <TextInput
                  placeholder="Success Metric"
                  {...form.getInputProps(`goals.${idx}.metric`)}
                  flex={2}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => {
                    const updated = [...form.values.goals];
                    updated.splice(idx, 1);
                    form.setFieldValue(
                      "goals",
                      updated.length ? updated : [{ goal: "", metric: "" }],
                    );
                  }}
                  disabled={form.values.goals.length === 1}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              color={TEAL_BLUE}
              onClick={() =>
                form.setFieldValue("goals", [
                  ...form.values.goals,
                  { goal: "", metric: "" },
                ])
              }
              mt={4}
            >
              Add Goal
            </Button>
          </Stack>
          <Divider label="FAQs (optional)" labelPosition="center" my="sm" />
          <Stack gap="xs">
            {(form.values.faqs as InitiativeFaq[]).map((_item: InitiativeFaq, idx: number) => (
              <Group key={idx} align="flex-start" wrap="nowrap">
                <TextInput
                  placeholder="Question"
                  {...form.getInputProps(`faqs.${idx}.question`)}
                  style={{ flex: 1, minWidth: 120 }}
                />
                <Textarea
                  placeholder="Answer"
                  minRows={2}
                  {...form.getInputProps(`faqs.${idx}.answer`)}
                  style={{ flex: 2, minWidth: 160 }}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  mt={4}
                  onClick={() => {
                    const updated = [...(form.values.faqs as InitiativeFaq[])];
                    updated.splice(idx, 1);
                    form.setFieldValue(
                      "faqs",
                      updated.length ? updated : [{ question: "", answer: "" }],
                    );
                  }}
                  disabled={(form.values.faqs as InitiativeFaq[]).length === 1}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              color={TEAL_BLUE}
              onClick={() =>
                form.setFieldValue("faqs", [
                  ...(form.values.faqs as InitiativeFaq[]),
                  { question: "", answer: "" },
                ])
              }
              mt={4}
            >
              Add FAQ
            </Button>
          </Stack>
        </Stack>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose} mr="sm">
            Cancel
          </Button>
          <Button type="submit" bg={THEME_BLUE} c="white">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

const DEPT_ABBREV: Record<string, string> = {
  Engineering: "ENG",
  Marketing: "MKT",
  Operations: "OPS",
  Sales: "SAL",
  "Human Resources": "HR",
};

interface CreateInitiativeModalProps {
  opened: boolean;
  onClose: () => void;
  onAdd: (data: InitiativeSummary) => void;
  managers: { name: string; id: string }[];
  orgDepartments: string[];
  onAddDepartment: (name: string) => void | Promise<void>;
  leadEnrollmentCounts: Record<string, number>;
  leadEnrollmentInitiativesByLead: Record<string, InitiativeListItem[]>;
}

function CreateInitiativeModal({
  opened,
  onClose,
  onAdd,
  managers,
  orgDepartments,
  onAddDepartment,
  leadEnrollmentCounts,
  leadEnrollmentInitiativesByLead,
}: CreateInitiativeModalProps) {
  const departmentOptions = orgDepartments;
  const leadOptions = managers.map((m) => ({
    value: m.name,
    label: `${m.name} (${leadEnrollmentCounts[m.name] ?? 0})`,
  }));
  const collaboratorOptions = managers.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  type ChangeType =
    | "Tech/Digital"
    | "ERP system change"
    | "Cultural transformation"
    | "Department restructuring"
    | "Full company restructuring"
    | "Merger/acquisition"
    | "Other";
  const CHANGE_TYPES: ChangeType[] = [
    "Tech/Digital",
    "ERP system change",
    "Cultural transformation",
    "Department restructuring",
    "Full company restructuring",
    "Merger/acquisition",
    "Other",
  ];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lead, setLead] = useState("");
  const [changeType, setChangeType] = useState<ChangeType>("Other");
  const [raciAccountableId, setRaciAccountableId] = useState<string>("");
  const [raciResponsibleIds, setRaciResponsibleIds] = useState<string[]>([]);
  const [raciConsultedIds, setRaciConsultedIds] = useState<string[]>([]);
  const [raciInformedIds, setRaciInformedIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 9, 12));
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  type ImpactScope = "departments" | "organization";
  const [impactScope, setImpactScope] = useState<ImpactScope>("departments");
  const [addDeptOpen, { open: openAddDept, close: closeAddDept }] = useDisclosure(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [goals, setGoals] = useState<{ goal: string; metric: string }[]>([
    { goal: "Reduce latency", metric: "<200ms" },
    { goal: "Staff Training", metric: "90% completion" },
  ]);
  const [faqs, setFaqs] = useState<InitiativeFaq[]>([{ question: "", answer: "" }]);
  type InitialStatus = "Drafting" | "Pending Review" | "Published";
  const [initialStatus, setInitialStatus] = useState<InitialStatus>("Drafting");

  const selectedLeadInitiatives = leadEnrollmentInitiativesByLead[lead] ?? [];

  const toggleDept = (dept: string) => {
    if (impactScope !== "departments") return;
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const faqsPayload = faqs
    .filter((f) => f.question.trim() || f.answer.trim())
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));

  const nonAccountableUniqueCount = new Set(
    [
      ...raciResponsibleIds,
      ...raciConsultedIds,
      ...raciInformedIds,
    ].filter((id) => id && id !== raciAccountableId),
  ).size;
  const raciOverLimit = nonAccountableUniqueCount > 10;
  const raciAccountableMissing = !raciAccountableId;

  const breadcrumbs = [
    { title: "Initiatives", href: "#" },
    { title: "Create New Initiative", href: "#" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} fz="xs" c="dimmed" fw={600}>
      {item.title}
    </Anchor>
  ));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      radius={0}
      padding={0}
      withCloseButton={true}
      styles={{
        header: {
          position: "absolute",
          right: 20,
          top: 20,
          zIndex: 2000,
          backgroundColor: "transparent",
        },
        content: { backgroundColor: "#f8f9fa" },
        body: { padding: 0 },
      }}
    >
      <Box
        style={{
          height: "100vh",
          overflowY: "auto",
          paddingTop: rem(60),
          paddingBottom: rem(100),
        }}
      >
        <Box
          style={{ maxWidth: rem(1240), margin: "0 auto", padding: "0 20px" }}
        >
          <Stack gap={4} mb={40}>
            <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
            <Title order={1} fw={900} fz={rem(38)} c="#1A1D1E">
              New Strategic Initiative
            </Title>
            <Text c="dimmed" fw={500} fz="md">
              Define the scope, goals, and stakeholders for your transformation
              project.
            </Text>
          </Stack>

          <Grid gutter={50}>
            <Grid.Col span={{ base: 12, md: 7.5 }}>
              <Stack gap={50}>
                <Box>
                  <Group gap="xs" mb="md">
                    <IconInfoCircle size={22} color={THEME_BLUE} stroke={2} />
                    <Title order={4} fw={800} fz="lg">
                      Basic Information
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Stack gap="xl">
                    <TextInput
                      label={
                        <Text fw={700} fz="sm" mb={5}>
                          Initiative Title
                        </Text>
                      }
                      placeholder="e.g., Q4 Operational Efficiency Overhaul"
                      radius="md"
                      size="md"
                      value={title}
                      onChange={(e) => setTitle(e.currentTarget.value)}
                    />
                    <Box>
                      <Text fw={700} fz="sm" mb={5}>Description</Text>
                      <Textarea
                        placeholder="Briefly describe the purpose and desired outcome..."
                        radius="md"
                        size="md"
                        minRows={3}
                        value={description}
                        onChange={(e) => setDescription(e.currentTarget.value)}
                      />
                    </Box>
                    <Select
                      label={
                        <Text fw={700} fz="sm" mb={5}>
                          Change Lead
                        </Text>
                      }
                      placeholder="Select a manager..."
                      rightSection={<IconChevronDown size={18} />}
                      data={leadOptions}
                      radius="md"
                      size="md"
                      value={lead}
                      onChange={(value) => setLead(value || "")}
                    />

                    {selectedLeadInitiatives.length > 0 && (
                      <Box style={{ border: "1px solid #e9ecef", borderRadius: 8, padding: 10 }}>
                        <Text fz="xs" c="dimmed" fw={700} mb={6}>
                          Current enrollments
                        </Text>
                        {(() => {
                          const parsed = selectedLeadInitiatives
                            .map((ini) => {
                              const bounds = parseDateRange(ini.dateRange);
                              if (!bounds) return null;
                              return {
                                initiative: ini,
                                startMs: bounds.start.getTime(),
                                endMs: bounds.end.getTime(),
                              };
                            })
                            .filter(
                              (x): x is { initiative: InitiativeListItem; startMs: number; endMs: number } => x != null
                            );

                          if (parsed.length === 0) {
                            return (
                              <Stack gap={4}>
                                {selectedLeadInitiatives.slice(0, 4).map((ini) => (
                                  <Text key={ini.id ?? ini._id ?? ini.title} fz={12} c="dimmed">
                                    {ini.title}: {ini.dateRange}
                                  </Text>
                                ))}
                              </Stack>
                            );
                          }

                          const minStart = Math.min(...parsed.map((p) => p.startMs));
                          const maxEnd = Math.max(...parsed.map((p) => p.endMs));
                          if (!Number.isFinite(minStart) || !Number.isFinite(maxEnd) || maxEnd <= minStart) {
                            return (
                              <Stack gap={4}>
                                {selectedLeadInitiatives.slice(0, 4).map((ini) => (
                                  <Text key={ini.id ?? ini._id ?? ini.title} fz={12} c="dimmed">
                                    {ini.title}: {ini.dateRange}
                                  </Text>
                                ))}
                              </Stack>
                            );
                          }

                          return (
                            <Stack gap={8}>
                              {parsed
                                .slice()
                                .sort((a, b) => a.startMs - b.startMs)
                                .map((p) => {
                                  const leftPct = ((p.startMs - minStart) / (maxEnd - minStart)) * 100;
                                  const widthPct = ((p.endMs - p.startMs) / (maxEnd - minStart)) * 100;
                                  return (
                                    <Box key={p.initiative.id ?? p.initiative._id ?? p.initiative.title}>
                                      <Text fz={11} fw={700} c="dimmed" style={{ marginBottom: 4 }}>
                                        {p.initiative.title}
                                      </Text>
                                      <Box
                                        style={{
                                          position: "relative",
                                          height: 10,
                                          background: "#f1f3f5",
                                          borderRadius: 999,
                                          overflow: "hidden",
                                        }}
                                      >
                                        <Box
                                          style={{
                                            position: "absolute",
                                            left: `${Math.max(0, leftPct)}%`,
                                            width: `${Math.max(2, widthPct)}%`,
                                            top: 0,
                                            bottom: 0,
                                            background: THEME_BLUE,
                                            opacity: 0.9,
                                          }}
                                          title={p.initiative.dateRange}
                                        />
                                      </Box>
                                    </Box>
                                  );
                                })}
                            </Stack>
                          );
                        })()}
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <Group gap="xs" mb="md">
                    <IconCalendar size={22} color={THEME_BLUE} stroke={2} />
                    <Title order={4} fw={800} fz="lg">
                      Timeline
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Grid gutter="md">
                    <Grid.Col span={6}>
                      <DateInput
                        label={
                          <Text fw={700} fz="sm" mb={5}>
                            Start Date
                          </Text>
                        }
                        placeholder="mm/dd/yyyy"
                        radius="md"
                        size="md"
                        value={startDate}
                        onChange={(v) => setStartDate(v != null ? new Date(v as string | Date) : null)}
                        popoverProps={{ withinPortal: true, zIndex: 10000 }}
                        clearable
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <DateInput
                        label={
                          <Text fw={700} fz="sm" mb={5}>
                            Target End Date
                          </Text>
                        }
                        placeholder="mm/dd/yyyy"
                        radius="md"
                        size="md"
                        value={endDate}
                        onChange={(v) => setEndDate(v != null ? new Date(v as string | Date) : null)}
                        popoverProps={{ withinPortal: true, zIndex: 10000 }}
                        clearable
                      />
                    </Grid.Col>
                  </Grid>
                </Box>

                <Box>
                  <Group gap="xs" mb="md">
                    <IconUsers size={22} color={THEME_BLUE} stroke={2} />
                    <Title order={4} fw={800} fz="lg">
                      Impact Scope
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Select
                    label="Impacted by this initiative"
                    data={[
                      { value: "organization", label: "Whole organization impacted" },
                      { value: "departments", label: "Department(s) impacted" },
                    ]}
                    value={impactScope}
                    radius="md"
                    size="md"
                    onChange={(val) => {
                      const next = (val as ImpactScope) ?? "departments";
                      setImpactScope(next);
                      if (next === "organization") {
                        setSelectedDepts([]);
                        closeAddDept();
                        setNewDeptName("");
                      }
                    }}
                  />

                  {impactScope === "organization" ? (
                    <Text c="dimmed" fw={600} fz="sm">
                      This initiative impacts the whole organization.
                    </Text>
                  ) : (
                    <>
                      <Group gap="sm">
                        {departmentOptions.map((dept) => {
                          const selected = selectedDepts.includes(dept);
                          return (
                            <Button
                              key={dept}
                              variant="outline"
                              radius="xl"
                              size="sm"
                              fw={700}
                              px="xl"
                              onClick={() => toggleDept(dept)}
                              styles={{
                                root: {
                                  border: selected ? `2px solid ${THEME_BLUE}` : "1px solid #dee2e6",
                                  color: selected ? THEME_BLUE : "#495057",
                                  backgroundColor: selected ? "#f1f3f9" : "white",
                                },
                              }}
                            >
                              {dept}
                            </Button>
                          );
                        })}
                        <Button
                          type="button"
                          variant="subtle"
                          color="blue"
                          leftSection={<IconPlus size={16} />}
                          size="sm"
                          fw={700}
                          onClick={openAddDept}
                        >
                          + Add Dept
                        </Button>
                      </Group>
                      <Modal
                        opened={addDeptOpen}
                        onClose={() => {
                          closeAddDept();
                          setNewDeptName("");
                        }}
                        title="Add Department"
                        size="sm"
                      >
                        <Stack gap="md">
                          <TextInput
                            placeholder="Department name"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.currentTarget.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const trimmed = newDeptName.trim();
                                if (trimmed) {
                                  onAddDepartment(trimmed);
                                  setSelectedDepts((prev) => [...prev, trimmed]);
                                  closeAddDept();
                                  setNewDeptName("");
                                }
                              }
                            }}
                          />
                          <Group justify="flex-end">
                            <Button
                              variant="subtle"
                              onClick={() => {
                                closeAddDept();
                                setNewDeptName("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                const trimmed = newDeptName.trim();
                                if (trimmed) {
                                  onAddDepartment(trimmed);
                                  setSelectedDepts((prev) => [...prev, trimmed]);
                                  closeAddDept();
                                  setNewDeptName("");
                                }
                              }}
                              disabled={!newDeptName.trim()}
                            >
                              Add
                            </Button>
                          </Group>
                        </Stack>
                      </Modal>
                    </>
                  )}
                </Box>

                <Box>
                  <Group gap="xs" mb="md">
                    <IconUsers size={22} color={THEME_BLUE} stroke={2} />
                    <Title order={4} fw={800} fz="lg">
                      Change Type & RACI
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Stack gap="md">
                    <Select
                      label="Type of change"
                      data={CHANGE_TYPES.map((t) => ({ value: t, label: t }))}
                      value={changeType}
                      onChange={(v) => setChangeType((v as ChangeType) ?? "Other")}
                      radius="md"
                      size="md"
                    />

                    <Select
                      label="Accountable (1)"
                      placeholder="Select an internal collaborator..."
                      data={collaboratorOptions}
                      clearable
                      value={raciAccountableId || null}
                      onChange={(v) => {
                        const next = v ?? "";
                        setRaciAccountableId(next);
                        // Prevent the same person from appearing in non-accountable buckets.
                        setRaciResponsibleIds((prev) => prev.filter((id) => id !== next));
                        setRaciConsultedIds((prev) => prev.filter((id) => id !== next));
                        setRaciInformedIds((prev) => prev.filter((id) => id !== next));
                      }}
                      radius="md"
                      size="md"
                    />

                    <MultiSelect
                      label="Responsible (max total 10)"
                      placeholder="Select up to 10 total across Responsible/Consulted/Informed..."
                      data={collaboratorOptions}
                      value={raciResponsibleIds}
                      onChange={(v) => setRaciResponsibleIds(v.filter((id) => id !== raciAccountableId))}
                      radius="md"
                      searchable
                      clearable
                    />

                    <MultiSelect
                      label="Consulted"
                      placeholder="Select internal collaborators..."
                      data={collaboratorOptions}
                      value={raciConsultedIds}
                      onChange={(v) => setRaciConsultedIds(v.filter((id) => id !== raciAccountableId))}
                      radius="md"
                      searchable
                      clearable
                    />

                    <MultiSelect
                      label="Informed"
                      placeholder="Select internal collaborators..."
                      data={collaboratorOptions}
                      value={raciInformedIds}
                      onChange={(v) => setRaciInformedIds(v.filter((id) => id !== raciAccountableId))}
                      radius="md"
                      searchable
                      clearable
                    />

                    <Text size="xs" c={raciOverLimit ? "red" : "dimmed"}>
                      Non-accountable total (Responsible + Consulted + Informed): {nonAccountableUniqueCount}/10
                    </Text>
                  </Stack>
                </Box>

                <Box>
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconTarget size={22} color={THEME_BLUE} stroke={2} />
                      <Title order={4} fw={800} fz="lg">
                        Goals & Success Measures
                      </Title>
                    </Group>
                    <Anchor
                      component="button"
                      type="button"
                      size="sm"
                      fw={700}
                      c={THEME_BLUE}
                      onClick={() => setGoals((g) => [...g, { goal: "", metric: "" }])}
                    >
                      Add Goal
                    </Anchor>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Stack gap="md">
                    {goals.map((item, idx) => (
                      <Group key={idx} grow align="center">
                        <TextInput
                          placeholder="Goal (e.g., Reduce latency)"
                          radius="md"
                          size="md"
                          value={item.goal}
                          onChange={(e) => {
                            const next = [...goals];
                            next[idx] = { ...next[idx], goal: e.currentTarget.value };
                            setGoals(next);
                          }}
                        />
                        <TextInput
                          placeholder="Success Metric (e.g., <200ms)"
                          radius="md"
                          size="md"
                          value={item.metric}
                          onChange={(e) => {
                            const next = [...goals];
                            next[idx] = { ...next[idx], metric: e.currentTarget.value };
                            setGoals(next);
                          }}
                        />
                        <ActionIcon
                          variant="subtle"
                          color="gray.4"
                          size="lg"
                          mt={5}
                          onClick={() =>
                            setGoals((g) =>
                              g.length > 1 ? g.filter((_, i) => i !== idx) : g
                            )
                          }
                        >
                          <IconTrash size={20} />
                        </ActionIcon>
                      </Group>
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconHelp size={22} color={THEME_BLUE} stroke={2} />
                      <Title order={4} fw={800} fz="lg">
                        FAQs (optional)
                      </Title>
                    </Group>
                    <Anchor
                      component="button"
                      type="button"
                      size="sm"
                      fw={700}
                      c={THEME_BLUE}
                      onClick={() => setFaqs((f) => [...f, { question: "", answer: "" }])}
                    >
                      Add FAQ
                    </Anchor>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Stack gap="md">
                    {faqs.map((item, idx) => (
                      <Card key={idx} withBorder radius="md" p="md" bg="#fafafa">
                        <Stack gap="sm">
                          <TextInput
                            label="Question"
                            placeholder="e.g., When does training start?"
                            radius="md"
                            size="md"
                            value={item.question}
                            onChange={(e) => {
                              const next = [...faqs];
                              next[idx] = { ...next[idx], question: e.currentTarget.value };
                              setFaqs(next);
                            }}
                          />
                          <Textarea
                            label="Answer"
                            placeholder="Short answer for the Knowledge Hub FAQ tab…"
                            minRows={2}
                            radius="md"
                            size="md"
                            value={item.answer}
                            onChange={(e) => {
                              const next = [...faqs];
                              next[idx] = { ...next[idx], answer: e.currentTarget.value };
                              setFaqs(next);
                            }}
                          />
                          <Group justify="flex-end">
                            <Button
                              variant="subtle"
                              color="red"
                              size="xs"
                              disabled={faqs.length === 1}
                              onClick={() =>
                                setFaqs((f) => (f.length > 1 ? f.filter((_, i) => i !== idx) : f))
                              }
                            >
                              Remove
                            </Button>
                          </Group>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Group gap="xs" mb="md">
                    <IconHistory size={22} color={THEME_BLUE} stroke={2} />
                    <Title order={4} fw={800} fz="lg">
                      Initial Status
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Grid gutter="md">
                    <Grid.Col span={4}>
                      <Box onClick={() => setInitialStatus("Drafting")}>
                        <StatusCard
                          active={initialStatus === "Drafting"}
                          title="Drafting"
                          desc="Not visible to teams yet."
                        />
                      </Box>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Box onClick={() => setInitialStatus("Pending Review")}>
                        <StatusCard
                          active={initialStatus === "Pending Review"}
                          title="Pending Review"
                          desc="Submit for stakeholder approval."
                        />
                      </Box>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Box onClick={() => setInitialStatus("Published")}>
                        <StatusCard
                          active={initialStatus === "Published"}
                          title="Published"
                          desc="Live and active initiative."
                        />
                      </Box>
                    </Grid.Col>
                  </Grid>
                </Box>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4.5 }}>
              <Stack gap={30} style={{ position: "sticky", top: 20 }}>
                <Card
                  withBorder
                  radius="lg"
                  p={0}
                  shadow="md"
                  style={{ border: "none" }}
                >
                  <Box p="md" bg={THEME_BLUE} c="white">
                    <Text fz={11} fw={800} lts={1.5}>
                      LIVE PREVIEW
                    </Text>
                    <Title order={4} mt={5} fw={800} fz="lg" lineClamp={1}>
                      {title
                        ? title.length > 28
                          ? title.slice(0, 28) + "..."
                          : title
                        : "Q4 Operational Efficiency..."}
                    </Title>
                  </Box>
                  <Stack p="xl" gap="xl">
                    <Group>
                      <Avatar radius="md" size="lg" />
                      <Stack gap={0}>
                        <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                          Lead
                        </Text>
                        <Text fw={800} fz="md">
                          {lead || "—"}
                        </Text>
                      </Stack>
                    </Group>
                    <Group grow>
                      <Stack gap={0}>
                        <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                          Start
                        </Text>
                        <Text fw={800} fz="md">
                          {startDate
                            ? startDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </Text>
                      </Stack>
                      <Stack gap={0}>
                        <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                          Status
                        </Text>
                        <Badge
                          variant="filled"
                          color="gray.2"
                          c="gray.7"
                          radius="sm"
                          fw={800}
                        >
                          {initialStatus === "Drafting"
                            ? "DRAFT"
                            : initialStatus === "Pending Review"
                              ? "PENDING"
                              : "PUBLISHED"}
                        </Badge>
                      </Stack>
                    </Group>
                    <Stack gap={8}>
                      <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                        Impacted
                      </Text>
                      <Group gap={6}>
                        {impactScope === "organization" ? (
                          <Badge
                            bg="#e9ecef"
                            c="#495057"
                            radius="xs"
                            fz={9}
                            fw={800}
                          >
                            Whole org
                          </Badge>
                        ) : selectedDepts.length > 0 ? (
                          selectedDepts.map((d) => (
                            <Badge
                              key={d}
                              bg="#e9ecef"
                              c="#495057"
                              radius="xs"
                              fz={9}
                              fw={800}
                            >
                              {DEPT_ABBREV[d] || d.slice(0, 3).toUpperCase()}
                            </Badge>
                          ))
                        ) : (
                          "—"
                        )}
                      </Group>
                    </Stack>
                  </Stack>
                </Card>

                <Card
                  withBorder
                  radius="lg"
                  p="xl"
                  bg="#f1f3f9"
                  style={{ border: "1px solid #d0d7e7" }}
                >
                  <Group mb="md">
                    <IconBulb size={24} color={THEME_BLUE} stroke={2} />
                    <Title order={5} fw={800} c={THEME_BLUE} fz="md">
                      Tips for Success
                    </Title>
                  </Group>
                  <List
                    spacing="md"
                    size="sm"
                    center
                    icon={<ThemeIcon color={THEME_BLUE} size={6} radius="xl" />}
                  >
                    <List.Item>
                      <Text fz="sm" c="dimmed" fw={500}>
                        Be specific with your goals. Use measurable KPIs like
                        "reduce churn by 5%".
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="sm" c="dimmed" fw={500}>
                        Ensure the Change Lead is a person who has direct
                        influence over the impacted departments.
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="sm" c="dimmed" fw={500}>
                        Timeline should include a 2-week buffer for review and
                        adjustments.
                      </Text>
                    </List.Item>
                  </List>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Box>
      </Box>

      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: "1px solid #dee2e6",
          padding: "20px 0",
          zIndex: 1000,
        }}
      >
        <Box
          style={{ maxWidth: rem(1240), margin: "0 auto", padding: "0 20px" }}
        >
            <Group justify="space-between">
            <Button
              variant="transparent"
              c="gray.6"
              fw={700}
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Group gap="md">
              <Button
                variant="filled"
                bg="#f1f3f5"
                c="#495057"
                radius="md"
                fw={700}
                px={30}
                h={45}
                disabled={!title || !lead || raciOverLimit || raciAccountableMissing}
                onClick={() => {
                  const dateRange =
                    startDate && endDate
                      ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
                      : startDate
                        ? startDate.toLocaleDateString() + " – —"
                        : "—";
                  onAdd({
                    status: "DRAFT",
                    title: title || "Untitled Initiative",
                    description,
                    leadName: lead,
                    changeType,
                    raciAccountableIds: raciAccountableId ? [raciAccountableId] : [],
                    raciResponsibleIds: raciResponsibleIds,
                    raciConsultedIds: raciConsultedIds,
                    raciInformedIds: raciInformedIds,
                    dateRange,
                    departments: impactScope === "organization" ? [] : selectedDepts,
                    goals,
                    faqs: faqsPayload,
                    progress: 0,
                  });
                  setTitle("");
                  setDescription("");
                  setLead("");
                  setStartDate(null);
                  setEndDate(null);
                  setSelectedDepts([]);
                  setImpactScope("departments");
                  setGoals([{ goal: "", metric: "" }]);
                  setFaqs([{ question: "", answer: "" }]);
                  setChangeType("Other");
                  setRaciAccountableId("");
                  setRaciResponsibleIds([]);
                  setRaciConsultedIds([]);
                  setRaciInformedIds([]);
                  setInitialStatus("Drafting");
                  onClose();
                }}
              >
                Save as Draft
              </Button>
              <Button
                leftSection={<IconRocket size={18} />}
                bg={THEME_BLUE}
                radius="md"
                fw={700}
                px={30}
                h={45}
                c="white"
                disabled={!title || !lead || !raciAccountableId || raciOverLimit}
                onClick={() => {
                  if (!title || !lead || !raciAccountableId || raciOverLimit) return;
                  const dateRange =
                    startDate && endDate
                      ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
                      : startDate
                        ? startDate.toLocaleDateString() + " – —"
                        : "—";
                  const statusMap: Record<InitialStatus, InitiativeStatus> = {
                    Drafting: "DRAFT",
                    "Pending Review": "WAITING_FOR_APPROVAL",
                    Published: "ACTIVE",
                  };
                  onAdd({
                    status: statusMap[initialStatus],
                    title,
                    description,
                    leadName: lead,
                    changeType,
                    raciAccountableIds: raciAccountableId ? [raciAccountableId] : [],
                    raciResponsibleIds: raciResponsibleIds,
                    raciConsultedIds: raciConsultedIds,
                    raciInformedIds: raciInformedIds,
                    dateRange,
                    departments: impactScope === "organization" ? [] : selectedDepts,
                    goals,
                    faqs: faqsPayload,
                    progress: 0,
                  });
                  setTitle("");
                  setDescription("");
                  setLead("");
                  setStartDate(null);
                  setEndDate(null);
                  setSelectedDepts([]);
                  setImpactScope("departments");
                  setGoals([{ goal: "", metric: "" }]);
                  setFaqs([{ question: "", answer: "" }]);
                  setChangeType("Other");
                  setRaciAccountableId("");
                  setRaciResponsibleIds([]);
                  setRaciConsultedIds([]);
                  setRaciInformedIds([]);
                  setInitialStatus("Drafting");
                  onClose();
                }}
              >
                Create Initiative
              </Button>
            </Group>
          </Group>
        </Box>
      </Box>
    </Modal>
  );
}

interface StatusCardProps {
  title: string;
  desc: string;
  active?: boolean;
}

function StatusCard({ title, desc, active }: StatusCardProps) {
  return (
    <Card
      withBorder
      radius="md"
      p="md"
      style={{
        border: active ? `2px solid ${THEME_BLUE}` : "1px solid #dee2e6",
        backgroundColor: active ? "#f1f3f9" : "white",
        cursor: "pointer",
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Box
          w={12}
          h={12}
          mt={4}
          style={{
            borderRadius: "50%",
            border: "1px solid #ced4da",
            backgroundColor: active ? THEME_BLUE : "transparent",
          }}
        />
        <Stack gap={2}>
          <Text fw={800} fz="sm">
            {title}
          </Text>
          <Text fz={11} c="dimmed" fw={500}>
            {desc}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
