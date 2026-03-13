import AdminLayout from "../layout/AdminLayout";
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
  Tooltip,
} from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconCalendar,
  IconShare,
  IconEdit,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState } from "react";

const THEME_BLUE = "#0f2b5c";

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

const INITIATIVES: Record<string, Initiative> = {
  "cloud-migration-phase-2": {
    id: "cloud-migration-phase-2",
    title: "Strategic Digital Transformation",
    status: "In Progress",
    dateRange: "Q4 2023 - Q2 2024",
    lead: "Sarah Chen",
    departments: "IT, Ops, Finance".split(", "),
    description:
      "This initiative focuses on modernizing legacy infrastructure across the organization to support rapid scaling and improve operational efficiency. By migrating core services to a cloud-native architecture, we aim to reduce downtime by 40% and increase developer velocity by streamlining CI/CD pipelines.",
    impactedDepts: [
      "Information Technology",
      "Global Operations",
      "Finance & Accounting",
      "Customer Experience",
    ],
    goals: [
      {
        objective: "Cloud Migration",
        kpi: "90% of legacy apps migrated",
        targetDate: "Dec 2023",
        status: "On Track",
      },
      {
        objective: "Infra Cost Reduction",
        kpi: "25% reduction in yearly spend",
        targetDate: "Mar 2024",
        status: "In Progress",
      },
      {
        objective: "System Performance",
        kpi: "Sub-200ms API response time",
        targetDate: "Jun 2024",
        status: "Planned",
      },
    ],
    progress: 64,
    readiness: "High",
    riskLevel: "Med",
    pendingTasks: { done: 12, total: 28 },
    team: [
      {
        name: "Sarah Chen",
        role: "Change Lead",
        initials: "SC",
        color: THEME_BLUE,
      },
    ],
    teamAvatars: [
      { initials: "M", color: "#1c7ed6" },
      { initials: "AI", color: "#495057" },
      { initials: "R", color: "#e03131" },
      { initials: "+8", color: "#868e96" },
    ],
    milestones: [
      {
        label: "COMPLETED",
        title: "Audit Infrastructure",
        date: "Oct 15, 2023",
        status: "completed",
      },
      {
        label: "CURRENT",
        title: "Security Hardening",
        date: "In Progress (Due Nov 30)",
        status: "current",
      },
      {
        label: "UPCOMING",
        title: "Region Rollout: APAC",
        date: "Jan 12, 2024",
        status: "upcoming",
      },
    ],
  },
  "hr-platform-refresh": {
    id: "hr-platform-refresh",
    title: "HR Platform Refresh",
    status: "Draft",
    dateRange: "Q2 2025 - Q4 2025",
    lead: "Mark Thompson",
    departments: ["HR"],
    description:
      "Modernizing the HR platform to improve efficiency, employee self-service, and compliance tracking across the organization.",
    impactedDepts: ["Human Resources", "IT", "Legal"],
    goals: [
      {
        objective: "Platform Migration",
        kpi: "Full migration to new HRIS",
        targetDate: "Sep 2025",
        status: "Planned",
      },
    ],
    progress: 12,
    readiness: "Medium",
    riskLevel: "Low",
    pendingTasks: { done: 2, total: 18 },
    team: [
      {
        name: "Mark Thompson",
        role: "Change Lead",
        initials: "MT",
        color: THEME_BLUE,
      },
    ],
    teamAvatars: [
      { initials: "J", color: "#2f9e44" },
      { initials: "+3", color: "#868e96" },
    ],
    milestones: [
      {
        label: "UPCOMING",
        title: "Requirements Gathering",
        date: "May 2025",
        status: "upcoming",
      },
    ],
  },
  "customer-success-ai": {
    id: "customer-success-ai",
    title: "Customer Success AI",
    status: "Planning",
    dateRange: "Q2 2025 - Q4 2025",
    lead: "David Chen",
    departments: ["Customer Support", "Product"],
    description:
      "Implementing AI-driven customer success tools to improve response times and customer satisfaction scores.",
    impactedDepts: ["Customer Support", "Product", "Engineering"],
    goals: [
      {
        objective: "AI Chatbot",
        kpi: "50% ticket deflection rate",
        targetDate: "Oct 2025",
        status: "Planned",
      },
    ],
    progress: 4,
    readiness: "Low",
    riskLevel: "High",
    pendingTasks: { done: 1, total: 22 },
    team: [
      {
        name: "David Chen",
        role: "Change Lead",
        initials: "DC",
        color: THEME_BLUE,
      },
    ],
    teamAvatars: [
      { initials: "K", color: "#e64980" },
      { initials: "+5", color: "#868e96" },
    ],
    milestones: [
      {
        label: "UPCOMING",
        title: "Vendor Selection",
        date: "Jun 2025",
        status: "upcoming",
      },
    ],
  },
  "agile-transformation": {
    id: "agile-transformation",
    title: "Agile Transformation",
    status: "Active",
    dateRange: "Q1 2025 - Q2 2025",
    lead: "Elena Rodriguez",
    departments: ["Engineering", "Leadership"],
    description:
      "Transitioning the engineering organization to agile methodologies to increase delivery speed and team autonomy.",
    impactedDepts: ["Engineering", "Leadership", "Product"],
    goals: [
      {
        objective: "Agile Adoption",
        kpi: "100% of teams on Scrum/Kanban",
        targetDate: "Jun 2025",
        status: "On Track",
      },
    ],
    progress: 88,
    readiness: "High",
    riskLevel: "Low",
    pendingTasks: { done: 22, total: 25 },
    team: [
      {
        name: "Elena Rodriguez",
        role: "Change Lead",
        initials: "ER",
        color: THEME_BLUE,
      },
    ],
    teamAvatars: [
      { initials: "T", color: "#7048e8" },
      { initials: "+4", color: "#868e96" },
    ],
    milestones: [
      {
        label: "COMPLETED",
        title: "Training Sessions",
        date: "Feb 2025",
        status: "completed",
      },
      {
        label: "CURRENT",
        title: "Sprint Cadence Rollout",
        date: "In Progress (Due Apr 30)",
        status: "current",
      },
    ],
  },
};

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const defaultData =
    INITIATIVES[id || "cloud-migration-phase-2"] ||
    INITIATIVES["cloud-migration-phase-2"];

  const [initiative, setInitiative] = useState<Initiative>({
    ...defaultData,
    goals: defaultData.goals.map((g) => ({ ...g })),
    team: defaultData.team.map((t) => ({ ...t })),
    teamAvatars: defaultData.teamAvatars.map((a) => ({ ...a })),
    milestones: defaultData.milestones.map((m) => ({ ...m })),
    impactedDepts: [...defaultData.impactedDepts],
    departments: [...defaultData.departments],
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; c: string }> = {
      "In Progress": { bg: "#e6fcf5", c: "#099268" },
      Active: { bg: "#e6fcf5", c: "#099268" },
      Draft: { bg: "#fff4e6", c: "#d9480f" },
      Planning: { bg: "#e7f5ff", c: "#1971c2" },
    };
    return map[status] || map["In Progress"];
  };

  const statusColors = getStatusBadge(initiative.status);

  return (
    <AdminLayout>
      <Group
        gap={6}
        mb="md"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/admin/initiatives")}
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

      <Tabs defaultValue="overview" mb="xl">
        <Tabs.List>
          <Tabs.Tab value="overview" fw={600}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="roadmap" fw={600}>
            Roadmap
          </Tabs.Tab>
          <Tabs.Tab value="assessment" fw={600}>
            Assessment
          </Tabs.Tab>
          <Tabs.Tab value="activity" fw={600}>
            Activity
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="xl">
          <Grid gutter={30}>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap={30}>
                <Card withBorder radius="lg" p="xl" shadow="xs">
                  <Title order={4} fw={700} mb="md">
                    Description
                  </Title>
                  <Text fz="sm" c="dimmed" lh={1.7}>
                    {initiative.description}
                  </Text>
                </Card>

                <Card withBorder radius="lg" p="xl" shadow="xs">
                  <Title order={4} fw={700} mb="lg">
                    Impacted Departments
                  </Title>
                  <Group gap="sm">
                    {initiative.impactedDepts.map((dept) => (
                      <Badge
                        key={dept}
                        variant="outline"
                        color="gray"
                        radius="xl"
                        size="lg"
                        px="lg"
                        fw={600}
                        styles={{
                          root: {
                            textTransform: "none",
                            border: "1px solid #dee2e6",
                            color: "#495057",
                          },
                        }}
                      >
                        {dept}
                      </Badge>
                    ))}
                  </Group>
                </Card>

                <Card withBorder radius="lg" p="xl" shadow="xs">
                  <Title order={4} fw={700} mb="lg">
                    Goals & Success Measures
                  </Title>
                  <Table verticalSpacing="md" horizontalSpacing="lg">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>
                          <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                            OBJECTIVE
                          </Text>
                        </Table.Th>
                        <Table.Th>
                          <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                            KPI / SUCCESS MEASURE
                          </Text>
                        </Table.Th>
                        <Table.Th>
                          <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                            TARGET DATE
                          </Text>
                        </Table.Th>
                        <Table.Th>
                          <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                            STATUS
                          </Text>
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {initiative.goals.map((goal, i) => (
                        <Table.Tr key={i}>
                          <Table.Td>
                            <Text fz="sm" fw={600}>
                              {goal.objective}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm" c="dimmed">
                              {goal.kpi}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm" c="dimmed">
                              {goal.targetDate}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text
                              fz="sm"
                              fw={600}
                              c={
                                goal.status === "On Track"
                                  ? "#099268"
                                  : goal.status === "In Progress"
                                    ? "#e8590c"
                                    : "#1971c2"
                              }
                            >
                              {goal.status}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap={20}>
                +
                <Card withBorder radius="lg" p="xl" shadow="xs">
                  <Title order={5} fw={700} mb="lg">
                    Quick Stats
                  </Title>
                  <Stack gap="md">
                    <Box>
                      <Group justify="space-between" mb={6}>
                        <Text fz="sm" c="dimmed" fw={500}>
                          Overall Progress
                        </Text>
                        <Text fz="lg" fw={800} c={THEME_BLUE}>
                          {initiative.progress}%
                        </Text>
                      </Group>
                      <Progress
                        value={initiative.progress}
                        color={THEME_BLUE}
                        h={8}
                        radius="xl"
                      />
                    </Box>
                    <Grid gutter="md" mt="sm">
                      <Grid.Col span={6}>
                        <Stack gap={2} align="center">
                          <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                            READINESS
                          </Text>
                          <Text fz="xl" fw={800} c={THEME_BLUE}>
                            {initiative.readiness}
                          </Text>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Stack gap={2} align="center">
                          <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                            RISK LEVEL
                          </Text>
                          <Text
                            fz="xl"
                            fw={800}
                            c={
                              initiative.riskLevel === "High"
                                ? "#e03131"
                                : initiative.riskLevel === "Med"
                                  ? "#e8590c"
                                  : "#2f9e44"
                            }
                          >
                            {initiative.riskLevel}
                          </Text>
                        </Stack>
                      </Grid.Col>
                    </Grid>
                    <Divider my={4} />
                    <Group justify="space-between">
                      <Text fz="sm" c="dimmed" fw={500}>
                        Pending Tasks
                      </Text>
                      <Text fz="sm" fw={700}>
                        {initiative.pendingTasks.done} /{" "}
                        {initiative.pendingTasks.total}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
                {/* Team */}
                <Card withBorder radius="lg" p="xl" shadow="xs">
                  <Group justify="space-between" mb="md">
                    <Title order={5} fw={700}>
                      Team
                    </Title>
                    <Box style={{ cursor: "pointer" }} c="dimmed">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                    </Box>
                  </Group>
                  {initiative.team.map((member) => (
                    <Group key={member.name} gap="sm" mb="md">
                      <Avatar radius="xl" size="md" color={member.color}>
                        {member.initials}
                      </Avatar>
                      <Stack gap={0}>
                        <Text fz="sm" fw={700}>
                          {member.name}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {member.role}
                        </Text>
                      </Stack>
                    </Group>
                  ))}
                  <Group gap={6} mt="sm">
                    {initiative.teamAvatars.map((a, i) => (
                      <Tooltip key={i} label={a.initials}>
                        <Avatar radius="xl" size="sm" color={a.color}>
                          {a.initials}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Group>
                </Card>
                <Card withBorder radius="lg" p="xl" shadow="xs">
                  <Title order={5} fw={700} mb="lg">
                    Upcoming Milestones
                  </Title>
                  <Timeline
                    active={initiative.milestones.findIndex(
                      (m) => m.status === "current",
                    )}
                    bulletSize={24}
                    lineWidth={2}
                    color={THEME_BLUE}
                  >
                    {initiative.milestones.map((ms, i) => (
                      <Timeline.Item
                        key={i}
                        bullet={
                          ms.status === "completed" ? (
                            <Box
                              w={12}
                              h={12}
                              bg={THEME_BLUE}
                              style={{ borderRadius: "50%" }}
                            />
                          ) : ms.status === "current" ? (
                            <Box
                              w={12}
                              h={12}
                              style={{
                                borderRadius: "50%",
                                border: `2px solid ${THEME_BLUE}`,
                                backgroundColor: "white",
                              }}
                            />
                          ) : (
                            <Box
                              w={12}
                              h={12}
                              style={{
                                borderRadius: "50%",
                                border: "2px solid #dee2e6",
                                backgroundColor: "white",
                              }}
                            />
                          )
                        }
                      >
                        <Text fz={10} fw={700} c="dimmed" lts={0.8} mb={2}>
                          {ms.label}
                        </Text>
                        <Text fz="sm" fw={700}>
                          {ms.title}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {ms.date}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="roadmap" pt="xl">
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Text c="dimmed">Roadmap content coming soon.</Text>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="assessment" pt="xl">
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Group justify="space-between" align="center">
              <Text fw={700} fz={20}>
                Assessment
              </Text>
              <Button
                bg={THEME_BLUE}
                radius="md"
                fw={700}
                onClick={() =>
                  navigate(
                    `/admin/initiatives/${initiative.id}/assessment-form`,
                  )
                }
              >
                Take Assessment
              </Button>
            </Group>
            <Divider my="md" />
            <Text c="dimmed">
              Complete the assessment to evaluate readiness and view results for
              this initiative.
            </Text>
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
        onSave={(updated) => {
          setInitiative(updated);
          closeEdit();
        }}
      />
    </AdminLayout>
  );
}

function EditInitiativeModal({
  opened,
  onClose,
  initiative,
  onSave,
}: {
  opened: boolean;
  onClose: () => void;
  initiative: Initiative;
  onSave: (updated: Initiative) => void;
}) {
  const [title, setTitle] = useState(initiative.title);
  const [description, setDescription] = useState(initiative.description);
  const [lead, setLead] = useState(initiative.lead);
  const [status, setStatus] = useState(initiative.status);
  const [dateRange, setDateRange] = useState(initiative.dateRange);
  const [progress, setProgress] = useState(initiative.progress);
  const [readiness, setReadiness] = useState(initiative.readiness);
  const [riskLevel, setRiskLevel] = useState(initiative.riskLevel);
  const [impactedDepts, setImpactedDepts] = useState(
    initiative.impactedDepts.join(", "),
  );
  const [goals, setGoals] = useState(initiative.goals.map((g) => ({ ...g })));

  useState(() => {
    setTitle(initiative.title);
    setDescription(initiative.description);
    setLead(initiative.lead);
    setStatus(initiative.status);
    setDateRange(initiative.dateRange);
    setProgress(initiative.progress);
    setReadiness(initiative.readiness);
    setRiskLevel(initiative.riskLevel);
    setImpactedDepts(initiative.impactedDepts.join(", "));
    setGoals(initiative.goals.map((g) => ({ ...g })));
  });

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
      impactedDepts: impactedDepts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
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
              value={lead}
              onChange={(val) => setLead(val || lead)}
              data={[
                "Sarah Chen",
                "Mark Thompson",
                "David Chen",
                "Elena Rodriguez",
              ]}
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

        <TextInput
          label={
            <Text fw={700} fz="sm" mb={4}>
              Impacted Departments (comma separated)
            </Text>
          }
          value={impactedDepts}
          onChange={(e) => setImpactedDepts(e.currentTarget.value)}
          placeholder="Information Technology, Global Operations, Finance & Accounting"
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
