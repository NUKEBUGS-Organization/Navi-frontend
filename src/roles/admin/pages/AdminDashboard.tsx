import React from "react";
import AdminLayout from "../layout/AdminLayout";
import {
  Grid,
  Card,
  Text,
  Group,
  Title,
  Progress,
  Badge,
  Table,
  Avatar,
  Stack,
  Box,
  rem,
  TextInput,
  Button,
  ActionIcon,
  Indicator,
} from "@mantine/core";
import {
  IconSearch,
  IconBell,
  IconPlus,
  IconCalendarEvent,
  IconRocket,
  IconChartBar,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";

const THEME_BLUE = "#0f2b5c";

// --- INTERFACES ---
interface StatCardProps {
  icon: React.FC<React.ComponentProps<"svg">>;
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  target?: string;
  progress?: number;
  color?: string;
}

interface TableRowProps {
  name: string;
  lead: string;
  progress: number;
  readiness: "High" | "Medium" | "Low";
  status: string;
  color: string;
}

interface ReadinessItemProps {
  label: string;
  value: string;
}

interface PhaseProgressProps {
  label: string;
  value: number;
}

interface ActivityItemProps {
  icon: React.FC<React.ComponentProps<"svg">>;
  color: string;
  title: string;
  sub: string;
  time: string;
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* HEADER */}
      <Group justify="space-between" mb={30}>
        <Group gap="xl">
          <Title order={3} fw={700}>
            Executive Dashboard
          </Title>
          <Group gap={8}>
            <IconCalendarEvent size={18} color="#94A3B8" />
            <Text size="sm" c="dimmed" fw={600}>
              Q3 2024 • Fiscal Year View
            </Text>
          </Group>
        </Group>

        <Group gap="md">
          <TextInput
            placeholder="Search insights..."
            leftSection={<IconSearch size={16} />}
            radius="md"
            styles={{
              input: {
                backgroundColor: "#F1F5F9",
                border: "none",
                width: rem(260),
              },
            }}
          />
          <Indicator color="red" offset={3} size={9} withBorder>
            <ActionIcon variant="transparent" c="gray.5">
              <IconBell size={24} />
            </ActionIcon>
          </Indicator>
          <Button
            leftSection={<IconPlus size={18} />}
            bg={THEME_BLUE}
            radius="md"
            px="xl"
          >
            New Initiative
          </Button>
        </Group>
      </Group>

      {/* TOP STATS */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <StatCard
            icon={IconRocket}
            label="Active Initiatives"
            value="7"
            badge="+2 this month"
            color="green"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <StatCard
            icon={IconChartBar}
            label="Avg. Readiness Score"
            value="3.4"
            sub="/ 5"
            target="Target: 4.5/5"
            color="gray"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <StatCard
            icon={IconCircleCheck}
            label="Task Completion Rate"
            value="68%"
            progress={68}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <StatCard
            icon={IconAlertTriangle}
            label="Initiatives at Risk"
            value="2"
            badge="Action Required"
            color="red"
          />
        </Grid.Col>
      </Grid>

      {/* MIDDLE SECTION */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder radius="md" p="xl">
            <Group justify="space-between" mb="xl">
              <Text fw={700} size="lg">
                Active Initiatives
              </Text>
              <Text c="blue" fw={700} size="sm" style={{ cursor: "pointer" }}>
                View All
              </Text>
            </Group>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th c="dimmed" fw={700} fz="xs">
                    INITIATIVE NAME
                  </Table.Th>
                  <Table.Th c="dimmed" fw={700} fz="xs">
                    LEAD
                  </Table.Th>
                  <Table.Th c="dimmed" fw={700} fz="xs">
                    PROGRESS
                  </Table.Th>
                  <Table.Th c="dimmed" fw={700} fz="xs">
                    READINESS
                  </Table.Th>
                  <Table.Th c="dimmed" fw={700} fz="xs">
                    STATUS
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <TableRow
                  name="Cloud Migration"
                  lead="Sarah Chen"
                  progress={75}
                  readiness="High"
                  status="On Track"
                  color="green"
                />
                <TableRow
                  name="HR Digitalization"
                  lead="Mark Smith"
                  progress={40}
                  readiness="Medium"
                  status="At Risk"
                  color="red"
                />
                <TableRow
                  name="Agile Transformation"
                  lead="Elena Rod."
                  progress={20}
                  readiness="Low"
                  status="Delayed"
                  color="orange"
                />
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder radius="md" p="xl">
            <Text fw={700} size="lg" mb="xl">
              Readiness Score Overview
            </Text>
            <Stack gap={25}>
              <ReadinessItem label="LEADERSHIP ALIGNMENT" value="4.2" />
              <ReadinessItem label="STAFF COMPETENCY" value="3.1" />
              <ReadinessItem label="CULTURAL READINESS" value="2.8" />
              <ReadinessItem label="TECH INFRASTRUCTURE" value="3.9" />
            </Stack>
            <Text ta="center" size="xs" c="dimmed" mt={40}>
              Calculated across all 7 active initiatives
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* BOTTOM SECTION */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder radius="md" p="xl">
            <Group justify="space-between" mb="xl">
              <Text fw={700} size="lg">
                Task Completion by Phase
              </Text>
              <Group gap="xs">
                <Badge color={THEME_BLUE} variant="filled" size="xs" circle />{" "}
                <Text size="xs" c="dimmed" fw={700}>
                  Done
                </Text>
                <Badge color="gray.2" variant="filled" size="xs" circle />{" "}
                <Text size="xs" c="dimmed" fw={700}>
                  Pending
                </Text>
              </Group>
            </Group>
            <Stack gap="lg">
              <PhaseProgress label="Planning" value={90} />
              <PhaseProgress label="Execution" value={65} />
              <PhaseProgress label="Testing" value={30} />
              <PhaseProgress label="Launch" value={10} />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder radius="md" p="xl">
            <Group justify="space-between" mb="xl">
              <Text fw={700} size="lg">
                Recent Activity
              </Text>
              <Badge variant="light" color="gray" radius="sm">
                Live Update
              </Badge>
            </Group>
            <Stack gap="xl">
              <ActivityItem
                icon={IconCircleCheck}
                color="green"
                title="Sarah Chen updated Cloud Migration"
                sub="Transitioned to 'Deployment' phase. 12 tasks completed."
                time="24 MINS AGO"
              />
              <ActivityItem
                icon={IconChartBar}
                color="orange"
                title="New Assessment Submitted"
                sub="HR Digitalization readiness assessment by Marketing Dept."
                time="2 HOURS AGO"
              />
              <ActivityItem
                icon={IconAlertTriangle}
                color="red"
                title="Risk Flag: Agile Transformation"
                sub="Critical path delay detected in 'Resource Allocation'."
                time="5 HOURS AGO"
              />
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </AdminLayout>
  );
}

// --- HELPER COMPONENTS WITH PROPER TYPES ---

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  badge,
  target,
  progress,
  color,
}: StatCardProps) {
  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="xs">
        <Box
          p={8}
          bg="#F1F5F9"
          style={{ borderRadius: "8px", display: "flex" }}
        >
          <Icon size={20} color="#64748B" />
        </Box>
        {badge && (
          <Badge variant="light" color={color} radius="sm" size="xs" fw={700}>
            {badge}
          </Badge>
        )}
      </Group>
      <Text size="xs" c="dimmed" fw={700} mb={4}>
        {label.toUpperCase()}
      </Text>
      <Group align="flex-end" gap={5}>
        <Text size={rem(28)} fw={700}>
          {value}
        </Text>
        {sub && (
          <Text size="sm" c="dimmed" pb={5}>
            {sub}
          </Text>
        )}
      </Group>
      {target && (
        <Text size="xs" c="dimmed" fw={500}>
          {target}
        </Text>
      )}
      {progress && (
        <Progress
          value={progress}
          color={THEME_BLUE}
          size="sm"
          mt="md"
          radius="xl"
        />
      )}
    </Card>
  );
}

function TableRow({
  name,
  lead,
  progress,
  readiness,
  status,
  color,
}: TableRowProps) {
  return (
    <Table.Tr>
      <Table.Td fw={700} fz="sm">
        {name}
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Avatar size="xs" radius="xl" />
          <Text size="sm" fw={500}>
            {lead}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Progress
          value={progress}
          color={THEME_BLUE}
          size="xs"
          radius="xl"
          w={100}
        />
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={
            readiness === "High"
              ? "green"
              : readiness === "Medium"
                ? "orange"
                : "red"
          }
        >
          {readiness}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={6}>
          <Box w={6} h={6} bg={color} style={{ borderRadius: "50%" }} />
          <Text size="sm" fw={500}>
            {status}
          </Text>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

function ReadinessItem({ label, value }: ReadinessItemProps) {
  return (
    <Box>
      <Group justify="space-between" mb={6}>
        <Text size="xs" fw={800} c="dimmed">
          {label}
        </Text>
        <Text size="xs" fw={800}>
          {value}
        </Text>
      </Group>
      <Progress
        value={(parseFloat(value) / 5) * 100}
        color={THEME_BLUE}
        size="xl"
        radius="md"
      />
    </Box>
  );
}

function PhaseProgress({ label, value }: PhaseProgressProps) {
  return (
    <Group gap="xl">
      <Text size="sm" fw={600} w={80}>
        {label}
      </Text>
      <Progress
        value={value}
        color={THEME_BLUE}
        size={rem(30)}
        radius="sm"
        style={{ flex: 1, backgroundColor: "#F1F5F9" }}
      />
      <Text size="xs" fw={700} w={30}>
        {value}%
      </Text>
    </Group>
  );
}

function ActivityItem({
  icon: Icon,
  color,
  title,
  sub,
  time,
}: ActivityItemProps) {
  return (
    <Group align="flex-start" wrap="nowrap">
      <ActionIcon variant="light" color={color} radius="xl" size="md">
        <Icon size={16} />
      </ActionIcon>
      <Stack gap={2}>
        <Text size="sm" fw={700}>
          {title}
        </Text>
        <Text size="xs" c="dimmed" fw={500}>
          {sub}
        </Text>
        <Text size="10px" c="dimmed" fw={700} mt={4}>
          {time}
        </Text>
      </Stack>
    </Group>
  );
}
