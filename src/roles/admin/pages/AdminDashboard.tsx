import React from "react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
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
  ActionIcon,
} from "@mantine/core";
import {
  IconSearch,
  IconCalendarEvent,
  IconRocket,
  IconChartBar,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";
import { THEME_BLUE } from "@/constants";

interface StatCardProps {
  icon: React.FC<IconProps>;
  label: string;
  value: string;
  subValue?: string;
  badgeText?: string;
  badgeColor?: string;
  helperText?: string;
  progress?: number;
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

interface PhaseBarProps {
  label: string;
  value: number;
}

interface ActivityItemProps {
  icon: React.FC<IconProps>;
  color: string;
  title: string;
  sub: string;
  time: string;
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Group justify="space-between" mb={40} align="center">
        <Stack gap={5}>
          <Group gap="lg" wrap="wrap">
            <Title order={2} fw={800} fz={{ base: 20, sm: 24 }}>
              Executive Dashboard
            </Title>
            <Box
              visibleFrom="xs"
              style={{ width: 1.5, height: 20, backgroundColor: "#dee2e6" }}
            />
            <Group gap={8}>
              <IconCalendarEvent size={18} color="#94A3B8" />
              <Text fz="sm" c="dimmed" fw={600}>
                Q3 2024 • Fiscal Year View
              </Text>
            </Group>
          </Group>
        </Stack>

        <Group gap="md" style={{ flexGrow: 1, justifyContent: "flex-end" }}>
          <TextInput
            placeholder="Search insights..."
            leftSection={<IconSearch size={16} color="#adb5bd" />}
            radius="md"
            visibleFrom="md"
            styles={{
              input: {
                backgroundColor: "#FFFFFF",
                border: "1px solid #E9ECEF",
                width: rem(280),
                height: rem(40),
              },
            }}
          />
        </Group>
      </Group>

      <Grid mb={30} gutter="xl">
        <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
          <StatCard
            icon={IconRocket}
            label="Active Initiatives"
            value="7"
            badgeText="+2 this month"
            badgeColor="green"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
          <StatCard
            icon={IconChartBar}
            label="Avg. Readiness Score"
            value="3.4"
            subValue="/ 5"
            helperText="Target: 4.5/5"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
          <StatCard
            icon={IconCircleCheck}
            label="Task Completion Rate"
            value="68%"
            progress={68}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
          <StatCard
            icon={IconAlertTriangle}
            label="Initiatives at Risk"
            value="2"
            badgeText="Action Required"
            badgeColor="red"
          />
        </Grid.Col>
      </Grid>

      <Grid mb={30} gutter="xl">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder radius="lg" p={{ base: "md", sm: "xl" }} shadow="xs">
            <Group justify="space-between" mb={30}>
              <Text fw={800} fz="lg">
                Active Initiatives
              </Text>
              <Text c="blue.7" fw={700} fz="sm" style={{ cursor: "pointer" }}>
                View All
              </Text>
            </Group>

            <Table.ScrollContainer minWidth={600}>
              <Table verticalSpacing="lg">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                      INITIATIVE NAME
                    </Table.Th>
                    <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                      LEAD
                    </Table.Th>
                    <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                      PROGRESS
                    </Table.Th>
                    <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                      READINESS
                    </Table.Th>
                    <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
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
                    color="#40c057"
                  />
                  <TableRow
                    name="HR Digitalization"
                    lead="Mark Smith"
                    progress={40}
                    readiness="Medium"
                    status="At Risk"
                    color="#fa5252"
                  />
                  <TableRow
                    name="Agile Transformation"
                    lead="Elena Rod."
                    progress={20}
                    readiness="Low"
                    status="Delayed"
                    color="#fab005"
                  />
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Text fw={800} fz="lg" mb={30}>
              Readiness Score Overview
            </Text>
            <Stack gap={28}>
              <ReadinessItem label="LEADERSHIP ALIGNMENT" value="4.2" />
              <ReadinessItem label="STAFF COMPETENCY" value="3.1" />
              <ReadinessItem label="CULTURAL READINESS" value="2.8" />
              <ReadinessItem label="TECH INFRASTRUCTURE" value="3.9" />
            </Stack>
            <Text ta="center" fz={11} c="dimmed" fw={600} mt={50}>
              Calculated across all 7 active initiatives
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Group justify="space-between" mb={30} wrap="nowrap">
              <Text fw={800} fz="lg">
                Task Completion by Phase
              </Text>
              <Group gap="md" visibleFrom="xs">
                <Group gap={6}>
                  <Box
                    w={10}
                    h={10}
                    bg={THEME_BLUE}
                    style={{ borderRadius: "2px" }}
                  />
                  <Text fz={11} fw={700} c="dimmed">
                    Done
                  </Text>
                </Group>
                <Group gap={6}>
                  <Box
                    w={10}
                    h={10}
                    bg="#e9ecef"
                    style={{ borderRadius: "2px" }}
                  />
                  <Text fz={11} fw={700} c="dimmed">
                    Pending
                  </Text>
                </Group>
              </Group>
            </Group>
            <Stack gap="xl">
              <PhaseBar label="Planning" value={90} />
              <PhaseBar label="Execution" value={65} />
              <PhaseBar label="Testing" value={30} />
              <PhaseBar label="Launch" value={10} />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Group justify="space-between" mb={30}>
              <Text fw={800} fz="lg">
                Recent Activity
              </Text>
              <Badge variant="light" color="gray" radius="sm" fz={10} px={8}>
                Live Update
              </Badge>
            </Group>
            <Stack gap={25}>
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

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  badgeText,
  badgeColor,
  helperText,
  progress,
}: StatCardProps) {
  return (
    <Card
      withBorder
      radius="lg"
      p="xl"
      h="100%"
      shadow="xs"
      style={{ border: "1px solid #E9ECEF" }}
    >
      <Group justify="space-between" mb="lg" align="flex-start">
        <Box
          p={8}
          bg="#F8F9FA"
          style={{ borderRadius: "8px", display: "flex" }}
        >
          <Icon size={22} color="#475569" stroke={1.5} />
        </Box>
        {badgeText && (
          <Badge
            variant="light"
            color={badgeColor}
            radius="sm"
            fz={10}
            fw={800}
          >
            {badgeText}
          </Badge>
        )}
        {progress && (
          <Text fz="xs" c="dimmed" fw={700}>
            68%
          </Text>
        )}
        {helperText && !progress && (
          <Text fz="xs" c="dimmed" fw={700}>
            {helperText}
          </Text>
        )}
      </Group>
      <Text fz="xs" c="dimmed" fw={700} mb={4} lts={0.5}>
        {label.toUpperCase()}
      </Text>
      <Group align="flex-end" gap={4}>
        <Text fz={28} fw={800} style={{ lineHeight: 1 }}>
          {value}
        </Text>
        {subValue && (
          <Text fz="sm" c="dimmed" fw={700} pb={2}>
            {subValue}
          </Text>
        )}
      </Group>
      {progress && (
        <Progress
          value={progress}
          color={THEME_BLUE}
          h={6}
          mt="xl"
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
      <Table.Td fw={700} fz="sm" py="lg" style={{ whiteSpace: "nowrap" }}>
        {name}
      </Table.Td>
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Avatar size="sm" radius="xl" />
          <Text fz="sm" fw={600} style={{ whiteSpace: "nowrap" }}>
            {lead}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Progress
          value={progress}
          color={THEME_BLUE}
          h={6}
          w={100}
          radius="xl"
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
          radius="xl"
          px="lg"
        >
          {readiness}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={8} wrap="nowrap">
          <Box w={8} h={8} bg={color} style={{ borderRadius: "50%" }} />
          <Text fz="sm" fw={600} style={{ whiteSpace: "nowrap" }}>
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
      <Group justify="space-between" mb={8}>
        <Text fz={11} fw={800} c="dimmed">
          {label}
        </Text>
        <Text fz={13} fw={800}>
          {value}
        </Text>
      </Group>
      <Progress
        value={(parseFloat(value) / 5) * 100}
        color={THEME_BLUE}
        h={12}
        radius="sm"
      />
    </Box>
  );
}

function PhaseBar({ label, value }: PhaseBarProps) {
  return (
    <Group gap="xl" wrap="nowrap">
      <Text fz="sm" fw={700} w={100} style={{ whiteSpace: "nowrap" }}>
        {label}
      </Text>
      <Progress
        value={value}
        color={THEME_BLUE}
        h={34}
        radius="sm"
        style={{ flex: 1, backgroundColor: "#f1f3f5" }}
      />
      <Text fz="xs" fw={800} w={40} ta="right">
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
      <ActionIcon
        variant="light"
        color={color}
        radius="xl"
        size="lg"
        flex="0 0 auto"
      >
        <Icon size={20} />
      </ActionIcon>
      <Stack gap={4}>
        <Text fz="sm" fw={800} style={{ lineHeight: 1.2 }}>
          {title}
        </Text>
        <Text fz="xs" c="dimmed" fw={500}>
          {sub}
        </Text>
        <Text fz={10} c="dimmed" fw={700} mt={4}>
          {time}
        </Text>
      </Stack>
    </Group>
  );
}
