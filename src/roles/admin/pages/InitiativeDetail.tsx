import AdminLayout from "@/roles/admin/layout/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  Grid,
  Card,
  Text,
  Group,
  Title,
  Progress,
  Badge,
  Avatar,
  Stack,
  Box,
  TextInput,
  Button,
  Tabs,
  Textarea,
  Select,
  Modal,
  Divider,
  Timeline,
  Table,
  Paper,
  ThemeIcon,
  MultiSelect,
} from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconCalendar,
  IconShare,
  IconEdit,
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconCircle,
  IconUsers,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { THEME_BLUE, NAVY, ROUTES } from "@/constants";
import { getInitiative, updateInitiative, type InitiativeListItem } from "@/api/initiatives";
import { listOrganizationUsers } from "@/api/auth";
import { getMyOrganization } from "@/api/organizations";
import { listAssessmentsByInitiative, listSubmissions, type Assessment, type AssessmentSubmission } from "@/api/assessments";
import { listTasks, type TaskDto } from "@/api/tasks";

interface Initiative {
  id: string;
  title: string;
  status: "In Progress" | "Active" | "Draft" | "Planning";
  dateRange: string;
  lead: string;
  departments: string[];
  description: string;
  impactedDepts: string[];
  goals: {
    objective: string;
    kpi: string;
    targetDate: string;
    status: "On Track" | "In Progress" | "Planned";
  }[];
  progress: number;
  readiness: "High" | "Medium" | "Low";
  riskLevel: "Low" | "Med" | "High";
  pendingTasks: { done: number; total: number };
  team: { name: string; role: string; initials: string; color: string }[];
  teamAvatars: { initials: string; color: string }[];
  milestones: {
    label: string;
    title: string;
    date: string;
    status: "completed" | "current" | "upcoming";
  }[];
}

/** Map audience value to display label and which roles can take the assessment. */
const AUDIENCE_LABELS: Record<string, string> = {
  "all-roles": "All roles",
  leadership: "Leadership team",
  admin: "Admins only",
  managers: "Managers only",
  "all-employees": "All employees",
};
const AUDIENCE_ROLES: Record<string, string[]> = {
  "all-roles": ["super_admin", "admin", "manager", "employee"],
  leadership: ["admin", "super_admin"],
  admin: ["admin", "super_admin"],
  managers: ["manager"],
  "all-employees": ["employee"],
};
function canUserTakeAssessment(audience: string | undefined, userRole: string): boolean {
  const a = (audience || "").trim();
  if (!a) return true;
  const roles = AUDIENCE_ROLES[a];
  if (!roles) return true;
  return roles.includes(userRole || "");
}
function getAudienceLabel(audience: string | undefined): string {
  return AUDIENCE_LABELS[(audience || "").trim()] ?? (audience || "All");
}

function toId(val: string | { toString?: () => string; $oid?: string } | undefined): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && typeof (val as { $oid?: string }).$oid === "string")
    return (val as { $oid: string }).$oid;
  if (typeof (val as { toString?: () => string }).toString === "function")
    return (val as { toString: () => string }).toString();
  return String(val);
}

function filterTasksByRoleAndDept<T extends { assigneeId?: string; id?: string; _id?: string }>(
  tasks: T[],
  users: { _id: string; departments?: string[] }[],
  currentUserId: string,
  userRole: string | undefined,
  userDepartments: string[]
): T[] {
  const assigneeIdOf = (t: T) => String(t.assigneeId ?? "");
  if (userRole === "employee") {
    return tasks.filter((t) => assigneeIdOf(t) === currentUserId);
  }
  if (userRole === "manager") {
    const myDepts = new Set(userDepartments.map((d) => String(d).toLowerCase()));
    const assigneeIdsInMyDept = new Set(
      users
        .filter(
          (u) =>
            u._id !== currentUserId &&
            u.departments?.some((d) => myDepts.has(String(d).toLowerCase()))
        )
        .map((u) => u._id)
    );
    return tasks.filter(
      (t) =>
        assigneeIdOf(t) === currentUserId ||
        assigneeIdsInMyDept.has(String(t.assigneeId ?? ""))
    );
  }
  return tasks;
}

function mapApiToInitiative(raw: InitiativeListItem): Initiative {
  const goals = (raw.goals ?? []).map((g) => ({
    objective: g.goal ?? "",
    kpi: g.metric ?? "",
    targetDate: "",
    status: "On Track" as const,
  }));
  const depts = raw.departments ?? [];
  const lead = raw.leadName ?? "";
  const initials = lead
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const statusMap: Record<string, Initiative["status"]> = {
    ACTIVE: "Active",
    DRAFT: "Draft",
    PLANNING: "Planning",
  };
  return {
    id: raw.id,
    title: raw.title,
    status: statusMap[raw.status ?? ""] ?? "Draft",
    dateRange: raw.dateRange ?? "",
    lead,
    departments: depts,
    description: raw.description ?? "",
    impactedDepts: depts.length ? depts : ["—"],
    goals: goals.length ? goals : [{ objective: "", kpi: "", targetDate: "", status: "Planned" as const }],
    progress: raw.progress ?? 0,
    readiness: (raw.readiness as Initiative["readiness"]) ?? "Medium",
    riskLevel: "Low",
    pendingTasks: { done: 0, total: 0 },
    team: [{ name: lead, role: "Change Lead", initials, color: THEME_BLUE }],
    teamAvatars: [],
    milestones: [
      { label: "UPCOMING", title: "Initiative started", date: "—", status: "upcoming" as const },
    ],
  };
}

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEditInitiative = user?.role === "admin" || user?.role === "manager";
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<{ name: string; id: string }[]>([]);
  const [orgDepartments, setOrgDepartments] = useState<string[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<Assessment[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<AssessmentSubmission[]>([]);
  const [orgUsers, setOrgUsers] = useState<{ _id: string; name: string; departments?: string[] }[]>([]);
  const [roadmapTasks, setRoadmapTasks] = useState<TaskDto[]>([]);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listOrganizationUsers(), getMyOrganization()])
      .then(([users, org]) => {
        if (cancelled) return;
        setManagers(users.filter((u) => u.role === "manager").map((u) => ({ name: u.name, id: u._id })));
        setOrgDepartments(org.departments ?? []);
        setOrgUsers(users.map((u) => ({ _id: u._id, name: u.name, departments: u.departments })));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getInitiative(id)
      .then((data) => {
        if (!cancelled) setInitiative(mapApiToInitiative(data));
      })
      .catch(() => {
        if (!cancelled) setInitiative(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!initiative?.id) {
      setAssessmentsList([]);
      return;
    }
    setAssessmentsLoading(true);
    let cancelled = false;
    Promise.all([
      listAssessmentsByInitiative(initiative.id),
      listSubmissions({ mine: true }),
    ])
      .then(([list, submissions]) => {
        if (!cancelled) {
          setAssessmentsList(Array.isArray(list) ? list : []);
          setMySubmissions(Array.isArray(submissions) ? submissions : []);
        }
      })
      .catch(() => {
        if (!cancelled) setAssessmentsList([]);
      })
      .finally(() => {
        if (!cancelled) setAssessmentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initiative?.id]);

  useEffect(() => {
    if (!initiative?.id) {
      setRoadmapTasks([]);
      return;
    }
    setRoadmapLoading(true);
    let cancelled = false;
    listTasks(initiative.id)
      .then((list) => {
        if (!cancelled) setRoadmapTasks(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setRoadmapTasks([]);
      })
      .finally(() => {
        if (!cancelled) setRoadmapLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initiative?.id]);

  if (loading) {
    return (
      <AdminLayout>
        <Text c="dimmed" size="sm" py="xl">
          Loading initiative...
        </Text>
      </AdminLayout>
    );
  }
  if (!initiative) {
    return (
      <AdminLayout>
        <Text c="dimmed" mb="md">Initiative not found.</Text>
        <Button variant="light" onClick={() => navigate(ROUTES.ADMIN_INITIATIVES)}>
          Back to Initiatives
        </Button>
      </AdminLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; c: string }> = {
      ACTIVE: { bg: "#e6fcf5", c: "#099268" },
      COMPLETED: { bg: "#e6fcf5", c: "#099268" },
      AT_RISK: { bg: "#fff0f0", c: "#e03131" },
      ON_HOLD: { bg: "#fff4e6", c: "#e8590c" },
      DRAFT: { bg: "#f1f3f5", c: "#868e96" },
      PLANNING: { bg: "#e7f5ff", c: "#1971c2" },
      "In Progress": { bg: "#e6fcf5", c: "#099268" },
      Active: { bg: "#e6fcf5", c: "#099268" },
      Draft: { bg: "#f1f3f5", c: "#868e96" },
      Planning: { bg: "#e7f5ff", c: "#1971c2" },
    };
    return map[status] || map["ACTIVE"];
  };
  const statusColors = getStatusBadge(initiative.status);
  const activeMilestoneIndex = initiative.milestones.findIndex(
    (m) => m.status === "current",
  );
  const timelineActive =
    activeMilestoneIndex >= 0
      ? activeMilestoneIndex
      : initiative.milestones.length - 1;

  return (
    <AdminLayout>
      <Group
        gap={6}
        mb="md"
        style={{ cursor: "pointer" }}
        onClick={() => navigate(ROUTES.ADMIN_INITIATIVES)}
      >
        <IconArrowLeft size={16} color="#868e96" />
        <Text fz="sm" fw={600} c="dimmed">
          Back to Initiatives
        </Text>
      </Group>

      <Group justify="space-between" align="flex-start" mb="xs">
        <Group align="center" gap="md">
          <Title order={1} fw={800} fz={30} c={THEME_BLUE}>
            {initiative.title}
          </Title>
          <Badge
            bg={statusColors.bg}
            c={statusColors.c}
            radius="sm"
            px={10}
            py={4}
            fw={700}
            fz={11}
            styles={{ root: { textTransform: "none" } }}
          >
            ● {initiative.status}
          </Badge>
        </Group>
        <Group gap="sm">
          <Button
            variant="outline"
            radius="md"
            h={40}
            px="lg"
            fw={600}
            color="gray"
            leftSection={<IconShare size={16} />}
          >
            Share
          </Button>
          {canEditInitiative && (
          <Button
            bg={THEME_BLUE}
            radius="md"
            h={40}
            px="lg"
            fw={600}
            leftSection={<IconEdit size={16} />}
            onClick={openEdit}
          >
            Edit Initiative
          </Button>
        )}
        </Group>
      </Group>

      <Group gap="lg" mb="xl">
        <Group gap={6}>
          <IconCalendar size={15} color="#868e96" />
          <Text fz="sm" fw={500} c="dimmed">
            {initiative.dateRange}
          </Text>
        </Group>
        <Group gap={6}>
          <Text fz="sm" fw={500} c="dimmed">
            👤 Lead: {initiative.lead}
          </Text>
        </Group>
        <Group gap={6}>
          <Text fz="sm" fw={500} c="dimmed">
            🏢 {initiative.departments.join(", ")}
          </Text>
        </Group>
      </Group>

      <Tabs defaultValue="overview" mb="xl" color={NAVY}>
        <Tabs.List>
          <Tabs.Tab value="overview" fw={700} style={{ color: NAVY }}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="roadmap" fw={700}>
            Roadmap
          </Tabs.Tab>
          <Tabs.Tab value="assessment" fw={700}>
            Assessment
          </Tabs.Tab>
          <Tabs.Tab value="activity" fw={700}>
            Activity
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="xl">
          <Grid gutter={30}>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper withBorder p="xl" mb="md">
                <Title order={4} fw={800} mb="sm" c={NAVY}>
                  Description
                </Title>
                <Text fz="sm" style={{ lineHeight: 1.6 }}>
                  {initiative.description}
                </Text>
              </Paper>
              <Paper withBorder p="xl" mb="md">
                <Title order={4} fw={800} mb="sm" c={NAVY}>
                  Impacted Departments
                </Title>
                <Group gap="sm">
                  {initiative.impactedDepts.map((d) => (
                    <Badge
                      key={d}
                      variant="light"
                      color="gray"
                      radius="xl"
                      size="lg"
                      fw={600}
                    >
                      {d}
                    </Badge>
                  ))}
                </Group>
              </Paper>
              <Paper withBorder p="xl" mb="md">
                <Title order={4} fw={800} mb="md" c={NAVY}>
                  Goals & Success Measures
                </Title>
                <Table withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th fw={700} fz="xs" c="dimmed" tt="uppercase">
                        Objective
                      </Table.Th>
                      <Table.Th fw={700} fz="xs" c="dimmed" tt="uppercase">
                        KPI / Success Measure
                      </Table.Th>
                      <Table.Th fw={700} fz="xs" c="dimmed" tt="uppercase">
                        Target Date
                      </Table.Th>
                      <Table.Th fw={700} fz="xs" c="dimmed" tt="uppercase">
                        Status
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {initiative.goals.map((g, i) => (
                      <Table.Tr key={i}>
                        <Table.Td fw={600}>{g.objective}</Table.Td>
                        <Table.Td fz="sm">{g.kpi}</Table.Td>
                        <Table.Td fz="sm">{g.targetDate}</Table.Td>
                        <Table.Td>
                          <Text
                            fz="sm"
                            fw={600}
                            c={
                              g.status === "On Track"
                                ? "green.7"
                                : g.status === "In Progress"
                                  ? "orange.7"
                                  : "dimmed"
                            }
                          >
                            {g.status}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                <Paper withBorder p="lg" radius="md">
                  <Title order={5} fw={700} mb="md" c={NAVY}>
                    Quick Stats
                  </Title>
                  <Stack gap="md">
                    <Box>
                      <Text fz="xs" fw={700} c="dimmed" mb={4}>
                        Overall Progress
                      </Text>
                      <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Progress
                            value={initiative.progress}
                            color={THEME_BLUE}
                            h={6}
                            radius="xl"
                          />
                        </Box>
                        <Text fw={700} fz="sm">
                          {initiative.progress}%
                        </Text>
                      </Group>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={700} c="dimmed" mb={4}>
                        READINESS
                      </Text>
                      <Badge
                        variant="light"
                        color="gray"
                        size="sm"
                        fz="xs"
                        fw={600}
                        fullWidth
                        style={{ justifyContent: "center" }}
                      >
                        {initiative.readiness}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={700} c="dimmed" mb={4}>
                        RISK LEVEL
                      </Text>
                      <Badge
                        variant="light"
                        color={initiative.riskLevel === "High" ? "red" : initiative.riskLevel === "Med" ? "yellow" : "gray"}
                        size="sm"
                        fz="xs"
                        fw={600}
                        fullWidth
                        style={{
                          justifyContent: "center",
                          border:
                            initiative.riskLevel === "Med"
                              ? "1px solid #fab005"
                              : undefined,
                        }}
                      >
                        {initiative.riskLevel}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={700} c="dimmed" mb={4}>
                        Pending Tasks
                      </Text>
                      <Text fw={700} fz="md">
                        {initiative.pendingTasks.done} / {initiative.pendingTasks.total}
                      </Text>
                    </Box>
                  </Stack>
                </Paper>

                <Paper withBorder p="lg" radius="md">
                  <Group justify="space-between" mb="md">
                    <Title order={5} fw={700} c={NAVY}>
                      Team
                    </Title>
                    <Button variant="subtle" size="xs" p={4} title="Add team member">
                      <IconUsers size={18} color={THEME_BLUE} />
                    </Button>
                  </Group>
                  <Stack gap="sm">
                    {initiative.team.map((member, i) => (
                      <Group key={i} gap="sm">
                        <Avatar
                          radius="xl"
                          size="md"
                          color={member.color}
                          style={{ fontWeight: 700, fontSize: 12 }}
                        >
                          {member.initials}
                        </Avatar>
                        <Box>
                          <Text fz="sm" fw={700}>
                            {member.name}
                          </Text>
                          <Text fz="xs" c="dimmed">
                            • {member.role}
                          </Text>
                        </Box>
                      </Group>
                    ))}
                    <Group gap={6} mt={4}>
                      {initiative.teamAvatars.map((av, i) => (
                        <Avatar
                          key={i}
                          radius="xl"
                          size="sm"
                          color={av.color}
                          style={{ fontWeight: 700, fontSize: 10 }}
                        >
                          {av.initials}
                        </Avatar>
                      ))}
                    </Group>
                  </Stack>
                </Paper>

                <Paper withBorder p="lg" radius="md">
                  <Title order={5} fw={700} mb="md" c={NAVY}>
                    Upcoming Milestones
                  </Title>
                  <Timeline
                    active={timelineActive}
                    bulletSize={26}
                    lineWidth={2}
                    color={THEME_BLUE}
                  >
                    {initiative.milestones.map((m, i) => {
                      let bullet;
                      if (m.status === "completed") {
                        bullet = (
                          <ThemeIcon
                            radius="xl"
                            size={26}
                            color={THEME_BLUE}
                            variant="filled"
                          >
                            <IconCircleCheck size={16} />
                          </ThemeIcon>
                        );
                      } else if (m.status === "current") {
                        bullet = (
                          <ThemeIcon
                            radius="xl"
                            size={26}
                            color={THEME_BLUE}
                            variant="outline"
                          >
                            <IconClock size={16} />
                          </ThemeIcon>
                        );
                      } else {
                        bullet = (
                          <ThemeIcon
                            radius="xl"
                            size={26}
                            color="gray.3"
                            variant="light"
                          >
                            <IconCircle size={14} />
                          </ThemeIcon>
                        );
                      }

                      return (
                        <Timeline.Item
                          key={i}
                          bullet={bullet}
                          lineVariant="solid"
                        >
                          <Text
                            fz="xs"
                            fw={700}
                            c="dimmed"
                            tt="uppercase"
                            mb={2}
                          >
                            {m.label}
                          </Text>
                          <Text fz="sm" fw={600}>
                            {m.title}
                          </Text>
                          <Text fz="xs" c="dimmed">
                            {m.date}
                          </Text>
                        </Timeline.Item>
                      );
                    })}
                  </Timeline>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="roadmap" pt="xl">
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Title order={4} fw={700} c={NAVY} mb="md">
              Roadmap tasks
            </Title>
            <Text c="dimmed" size="sm" mb="lg">
              Tasks are filtered by your role and department. Employees see only tasks assigned to them; managers see tasks in their department and those assigned to them; admins see all.
            </Text>
            <Group justify="flex-end" mb="md">
              <Button
                variant="light"
                size="sm"
                onClick={() =>
                  navigate(ROUTES.ADMIN_ROADMAP, { state: { initiativeId: initiative?.id } })
                }
              >
                Open full Roadmap
              </Button>
            </Group>
            {roadmapLoading ? (
              <Text size="sm" c="dimmed">Loading tasks…</Text>
            ) : (() => {
              const userById: Record<string, string> = {};
              orgUsers.forEach((u) => {
                userById[toId(u._id)] = u.name;
              });
              const filtered = filterTasksByRoleAndDept(
                roadmapTasks,
                orgUsers,
                user?._id ?? "",
                user?.role,
                user?.departments ?? []
              );
              if (filtered.length === 0) {
                return (
                  <Text size="sm" c="dimmed">
                    {roadmapTasks.length === 0
                      ? "No roadmap tasks for this initiative yet."
                      : "No tasks match your role or department for this initiative."}
                  </Text>
                );
              }
              return (
                <Table withTableBorder withColumnBorders striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th fw={700} fz="xs" c="dimmed">Task</Table.Th>
                      <Table.Th fw={700} fz="xs" c="dimmed">Phase</Table.Th>
                      <Table.Th fw={700} fz="xs" c="dimmed">Assignee</Table.Th>
                      <Table.Th fw={700} fz="xs" c="dimmed">Progress</Table.Th>
                      <Table.Th fw={700} fz="xs" c="dimmed">Due date</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtered.map((t) => (
                      <Table.Tr key={t._id}>
                        <Table.Td fw={500}>{t.title}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {t.phase ?? "Discovery"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{t.assigneeName ?? userById[toId(t.assigneeId)] ?? (t.assigneeId != null ? toId(t.assigneeId) : "—")}</Table.Td>
                        <Table.Td>
                          <Progress value={t.progress ?? 0} size="sm" h={6} radius="xl" />
                          <Text size="xs" c="dimmed" mt={4}>{t.progress ?? 0}%</Text>
                        </Table.Td>
                        <Table.Td>
                          {t.dueDate
                            ? new Date(t.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              );
            })()}
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="assessment" pt="xl">
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Title order={4} fw={700} c={NAVY} mb="md">
              Assessments for this initiative
            </Title>
            <Text c="dimmed" size="sm" mb="lg">
              Each assessment is assigned to specific roles. You can only take assessments that are for your role.
            </Text>
            {assessmentsLoading ? (
              <Text size="sm" c="dimmed">Loading assessments…</Text>
            ) : assessmentsList.length === 0 ? (
              <Text size="sm" c="dimmed">No assessments have been created for this initiative yet.</Text>
            ) : (
              <Table withTableBorder withColumnBorders striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th fw={700} fz="xs" c="dimmed">Assessment</Table.Th>
                    <Table.Th fw={700} fz="xs" c="dimmed">For (roles)</Table.Th>
                    <Table.Th fw={700} fz="xs" c="dimmed">Due date</Table.Th>
                    <Table.Th fw={700} fz="xs" c="dimmed">Your status</Table.Th>
                    <Table.Th fw={700} fz="xs" c="dimmed">Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {assessmentsList.map((a) => {
                    const canTake = canUserTakeAssessment(a.audience, user?.role ?? "");
                    const submitted = mySubmissions.some((s) => String(s.assessmentId) === String(a._id));
                    return (
                      <Table.Tr key={a._id}>
                        <Table.Td fw={600}>{a.name}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="blue" size="sm">
                            {getAudienceLabel(a.audience)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                        </Table.Td>
                        <Table.Td>
                          {!canTake ? (
                            <Text size="xs" c="dimmed">Not for your role</Text>
                          ) : submitted ? (
                            <Badge color="green" variant="light" size="sm">Completed</Badge>
                          ) : (
                            <Badge color="gray" variant="light" size="sm">Not started</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {canTake && !submitted && (
                            <Button
                              size="xs"
                              variant="filled"
                              color={NAVY}
                              onClick={() =>
                                navigate(ROUTES.ADMIN_ASSESSMENTS_FORM, {
                                  state: {
                                    initiativeId: initiative.id,
                                    initiativeTitle: initiative.title,
                                    assessmentId: a._id,
                                  },
                                })
                              }
                            >
                              Take Assessment
                            </Button>
                          )}
                          {canTake && submitted && (
                            <Text size="xs" c="dimmed">Submitted</Text>
                          )}
                          {!canTake && (
                            <Text size="xs" c="dimmed">—</Text>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="activity" pt="xl">
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Text c="dimmed">Activity content coming soon.</Text>
          </Card>
        </Tabs.Panel>
      </Tabs>

      <EditInitiativeModal
        opened={editOpened}
        onClose={closeEdit}
        initiative={initiative}
        managers={managers}
        orgDepartments={orgDepartments}
        onSave={(updated) => {
          const statusToApi = (s: string) =>
            s === "Active" ? "ACTIVE" : s === "Draft" ? "DRAFT" : s === "Planning" ? "PLANNING" : "DRAFT";
          updateInitiative(initiative.id, {
            title: updated.title,
            description: updated.description,
            status: statusToApi(updated.status),
            leadName: updated.lead,
            dateRange: updated.dateRange,
            departments: updated.departments ?? updated.impactedDepts ?? [],
            progress: updated.progress,
            readiness: updated.readiness,
            goals: updated.goals.map((g) => ({ goal: g.objective, metric: g.kpi })),
          })
            .then((data) => setInitiative(mapApiToInitiative(data)))
            .catch(() => {})
            .finally(() => closeEdit());
        }}
      />
    </AdminLayout>
  );
}

const FALLBACK_DEPARTMENTS = ["Engineering", "Operations", "Sales", "Human Resources", "IT"];

function EditInitiativeModal({
  opened,
  onClose,
  initiative,
  onSave,
  managers,
  orgDepartments,
}: {
  opened: boolean;
  onClose: () => void;
  initiative: Initiative;
  onSave: (updated: Initiative) => void;
  managers: { name: string; id: string }[];
  orgDepartments: string[];
}) {
  const departmentOptions = orgDepartments.length > 0 ? orgDepartments : FALLBACK_DEPARTMENTS;
  const leadOptions = managers.map((m) => ({ value: m.name, label: m.name }));
  const [title, setTitle] = useState(initiative.title);
  const [description, setDescription] = useState(initiative.description);
  const [lead, setLead] = useState(initiative.lead);
  const [status, setStatus] = useState(initiative.status);
  const [dateRange, setDateRange] = useState(initiative.dateRange);
  const [progress, setProgress] = useState(initiative.progress);
  const [readiness, setReadiness] = useState(initiative.readiness);
  const [riskLevel, setRiskLevel] = useState(initiative.riskLevel);
  const [departments, setDepartments] = useState<string[]>(
    initiative.departments?.length ? initiative.departments : initiative.impactedDepts ?? [],
  );
  const [goals, setGoals] = useState(initiative.goals.map((g) => ({ ...g })));

  useEffect(() => {
    setTitle(initiative.title);
    setDescription(initiative.description);
    setLead(initiative.lead);
    setStatus(initiative.status);
    setDateRange(initiative.dateRange);
    setProgress(initiative.progress);
    setReadiness(initiative.readiness);
    setRiskLevel(initiative.riskLevel);
    setDepartments(initiative.departments?.length ? initiative.departments : initiative.impactedDepts ?? []);
    setGoals(initiative.goals.map((g) => ({ ...g })));
  }, [initiative]);

  const handleGoalChange = (
    index: number,
    field: keyof Initiative["goals"][0],
    value: string,
  ) => {
    setGoals((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  };

  const handleSave = () => {
    onSave({
      ...initiative,
      title,
      description,
      lead,
      status,
      dateRange,
      progress,
      readiness,
      riskLevel,
      departments,
      impactedDepts: departments,
      goals,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={800} fz="lg">
          Edit Initiative
        </Text>
      }
      size="xl"
      radius="lg"
      padding="xl"
      centered
      styles={{ body: { maxHeight: "75vh", overflowY: "auto" } }}
    >
      <Stack gap="lg">
        <TextInput
          label={
            <Text fw={700} fz="sm" mb={4}>
              Initiative Title
            </Text>
          }
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          radius="md"
          size="md"
        />

        <Textarea
          label={
            <Text fw={700} fz="sm" mb={4}>
              Description
            </Text>
          }
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={4}
          radius="md"
          size="md"
        />

        <Grid gutter="md">
          <Grid.Col span={6}>
            <Select
              label={
                <Text fw={700} fz="sm" mb={4}>
                  Change Lead
                </Text>
              }
              placeholder="Select a manager..."
              value={lead}
              onChange={(val) => setLead(val || lead)}
              data={leadOptions}
              rightSection={<IconChevronDown size={16} />}
              radius="md"
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label={
                <Text fw={700} fz="sm" mb={4}>
                  Status
                </Text>
              }
              value={status}
              onChange={(val) =>
                setStatus((val as Initiative["status"]) || status)
              }
              data={["In Progress", "Active", "Draft", "Planning"]}
              rightSection={<IconChevronDown size={16} />}
              radius="md"
              size="md"
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label={
            <Text fw={700} fz="sm" mb={4}>
              Date Range
            </Text>
          }
          value={dateRange}
          onChange={(e) => setDateRange(e.currentTarget.value)}
          placeholder="e.g. Q4 2023 - Q2 2024"
          radius="md"
          size="md"
        />

        <Grid gutter="md">
          <Grid.Col span={4}>
            <TextInput
              label={
                <Text fw={700} fz="sm" mb={4}>
                  Progress (%)
                </Text>
              }
              type="number"
              min={0}
              max={100}
              value={String(progress)}
              onChange={(e) =>
                setProgress(
                  Math.min(
                    100,
                    Math.max(0, Number(e.currentTarget.value) || 0),
                  ),
                )
              }
              radius="md"
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label={
                <Text fw={700} fz="sm" mb={4}>
                  Readiness
                </Text>
              }
              value={readiness}
              onChange={(val) =>
                setReadiness((val as Initiative["readiness"]) || readiness)
              }
              data={["High", "Medium", "Low"]}
              radius="md"
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label={
                <Text fw={700} fz="sm" mb={4}>
                  Risk Level
                </Text>
              }
              value={riskLevel}
              onChange={(val) =>
                setRiskLevel((val as Initiative["riskLevel"]) || riskLevel)
              }
              data={["Low", "Med", "High"]}
              radius="md"
              size="md"
            />
          </Grid.Col>
        </Grid>

        <MultiSelect
          label={
            <Text fw={700} fz="sm" mb={4}>
              Impacted Departments
            </Text>
          }
          placeholder="Select departments..."
          value={departments}
          onChange={setDepartments}
          data={departmentOptions}
          radius="md"
          size="md"
        />

        <Divider label="Goals & Success Measures" labelPosition="center" />

        {goals.map((goal, i) => (
          <Card key={i} withBorder radius="md" p="md" bg="#f8f9fa">
            <Grid gutter="sm">
              <Grid.Col span={6}>
                <TextInput
                  label={
                    <Text fw={600} fz="xs">
                      Objective
                    </Text>
                  }
                  value={goal.objective}
                  onChange={(e) =>
                    handleGoalChange(i, "objective", e.currentTarget.value)
                  }
                  radius="md"
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={
                    <Text fw={600} fz="xs">
                      KPI / Success Measure
                    </Text>
                  }
                  value={goal.kpi}
                  onChange={(e) =>
                    handleGoalChange(i, "kpi", e.currentTarget.value)
                  }
                  radius="md"
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={
                    <Text fw={600} fz="xs">
                      Target Date
                    </Text>
                  }
                  value={goal.targetDate}
                  onChange={(e) =>
                    handleGoalChange(i, "targetDate", e.currentTarget.value)
                  }
                  radius="md"
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label={
                    <Text fw={600} fz="xs">
                      Status
                    </Text>
                  }
                  value={goal.status}
                  onChange={(val) =>
                    handleGoalChange(i, "status", val || goal.status)
                  }
                  data={["On Track", "In Progress", "Planned"]}
                  radius="md"
                  size="sm"
                />
              </Grid.Col>
            </Grid>
          </Card>
        ))}

        <Divider />

        <Group justify="flex-end" gap="md">
          <Button variant="default" radius="md" fw={600} onClick={onClose}>
            Cancel
          </Button>
          <Button bg={THEME_BLUE} radius="md" fw={600} onClick={handleSave}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
