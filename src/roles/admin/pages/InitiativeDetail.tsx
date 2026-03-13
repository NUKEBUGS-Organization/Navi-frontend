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
import { useState } from "react";
import { THEME_BLUE, NAVY, ROUTES } from "@/constants";

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
                            size="md"
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
                        size="lg"
                        fw={700}
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
                        size="lg"
                        fw={700}
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
