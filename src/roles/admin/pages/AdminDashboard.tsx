import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Button,
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
import { THEME_BLUE, ROUTES } from "@/constants";
import { listInitiatives, type InitiativeListItem } from "@/api/initiatives";
import { listAssessments, listSubmissions, type Assessment, type AssessmentSubmission } from "@/api/assessments";
import { getMyOrganization, type MyOrganization } from "@/api/organizations";
import { getRiskSummary, type RiskSummary } from "@/api/risks";

/** Normalize backend _id/ObjectId to string for consistent lookup. */
function toId(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (typeof x === "object" && "toString" in x) return (x as { toString(): string }).toString();
  return String(x);
}

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
  initiativeId?: string;
  name: string;
  lead: string;
  progress: number;
  readiness: "High" | "Medium" | "Low";
  submissionCount?: number;
  status: string;
  color: string;
  onRowClick?: () => void;
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

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const ms = now.getTime() - date.getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [initiatives, setInitiatives] = useState<InitiativeListItem[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [org, setOrg] = useState<MyOrganization | null>(null);
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listInitiatives(),
      listAssessments(),
      listSubmissions(),
      getMyOrganization().catch(() => null),
      getRiskSummary().catch(() => null),
    ])
      .then(([initList, assessList, subList, orgData, riskData]) => {
        setInitiatives(Array.isArray(initList) ? initList : []);
        setAssessments(Array.isArray(assessList) ? assessList : []);
        setSubmissions(Array.isArray(subList) ? subList : []);
        setOrg(orgData ?? null);
        setRiskSummary(riskData ?? null);
      })
      .catch(() => {
        setInitiatives([]);
        setAssessments([]);
        setSubmissions([]);
        setOrg(null);
        setRiskSummary(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeInitiatives = initiatives.filter((i) => i.status === "ACTIVE");
  const activeCount = activeInitiatives.length;
  const avgReadiness =
    submissions.length > 0
      ? submissions.reduce((s, sub) => s + sub.overallScore, 0) / submissions.length
      : null;
  const avgProgress =
    initiatives.length > 0
      ? Math.round(
          initiatives.reduce((s, i) => s + (i.progress ?? 0), 0) / initiatives.length
        )
      : 0;
  const submissionsByInitiative = submissions.reduce<Record<string, { sum: number; count: number; avg: number }>>((acc, s) => {
    const id = toId(s.initiativeId);
    if (!id) return acc;
    if (!acc[id]) acc[id] = { sum: 0, count: 0, avg: 0 };
    acc[id].sum += s.overallScore;
    acc[id].count += 1;
    acc[id].avg = acc[id].sum / acc[id].count;
    return acc;
  }, {});
  const atRiskCount = initiatives.filter((i) => {
    const initId = toId(i.id) || toId((i as { _id?: unknown })._id);
    const fromSubs = initId ? submissionsByInitiative[initId]?.avg : undefined;
    if (fromSubs != null) return fromSubs < 2.5;
    return (i.readiness || "").toLowerCase() === "low";
  }).length;
  const recentSubmissions = [...submissions]
    .sort((a, b) => {
      const da = a.updatedAt ?? a.createdAt ?? "";
      const db = b.updatedAt ?? b.createdAt ?? "";
      return new Date(db).getTime() - new Date(da).getTime();
    })
    .slice(0, 5);
  const displayInitiatives = initiatives.slice(0, 8);
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const newThisMonth = initiatives.filter((i) => {
    const d = new Date((i as { createdAt?: string }).createdAt ?? 0);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  function getReadinessForInitiative(i: InitiativeListItem): "High" | "Medium" | "Low" {
    const initId = toId(i.id) || toId((i as { _id?: unknown })._id);
    const avg = initId ? submissionsByInitiative[initId]?.avg : undefined;
    if (avg != null) {
      if (avg >= 4) return "High";
      if (avg >= 2.5) return "Medium";
      return "Low";
    }
    const r = (i.readiness || "").toLowerCase();
    if (r === "high") return "High";
    if (r === "low") return "Low";
    return "Medium";
  }

  function getSubmissionCountForInitiative(i: InitiativeListItem): number {
    const initId = toId(i.id) || toId((i as { _id?: unknown })._id);
    return initId ? submissionsByInitiative[initId]?.count ?? 0 : 0;
  }

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
                {thisYear} • Fiscal Year View
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

      {org && (
        <Card withBorder radius="lg" p="md" mb="lg" shadow="xs">
          <Group justify="space-between" wrap="wrap">
            <Group gap="md" wrap="wrap">
              <Text fw={700} fz="lg">{org.name}</Text>
              {org.departments?.length != null && (
                <Badge variant="light" color="gray" size="sm">
                  {org.departments.length} department{org.departments.length === 1 ? "" : "s"}
                </Badge>
              )}
              {org.employeeCount != null && (
                <Badge variant="light" color="blue" size="sm">
                  {org.employeeCount} employee{org.employeeCount === 1 ? "" : "s"}
                </Badge>
              )}
              {!loading && (
                <>
                  <Badge variant="light" color="teal" size="sm">
                    {assessments.length} assessment{assessments.length === 1 ? "" : "s"}
                  </Badge>
                  <Badge variant="light" color="green" size="sm">
                    {submissions.length} submission{submissions.length === 1 ? "" : "s"}
                  </Badge>
                </>
              )}
            </Group>
            {org.country && (
              <Text size="sm" c="dimmed">{org.country}</Text>
            )}
          </Group>
        </Card>
      )}

      <Grid mb={30} gutter="xl">
        <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
          <StatCard
            icon={IconRocket}
            label="Initiatives"
            value={loading ? "—" : String(initiatives.length)}
            badgeText={
              !loading && activeCount > 0
                ? `${activeCount} active`
                : !loading && newThisMonth > 0
                  ? `+${newThisMonth} this month`
                  : undefined
            }
            badgeColor="green"
            helperText={!loading && initiatives.length > 0 && activeCount < initiatives.length ? `${initiatives.length - activeCount} draft` : undefined}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
          <StatCard
            icon={IconChartBar}
            label="Avg. Readiness Score"
            value={loading ? "—" : avgReadiness != null ? avgReadiness.toFixed(1) : "—"}
            subValue={avgReadiness != null ? "/ 5" : undefined}
            helperText={
              !loading
                ? submissions.length > 0
                  ? `${submissions.length} submission${submissions.length === 1 ? "" : "s"}`
                  : "No submissions yet · Target: 4.5/5"
                : "Target: 4.5/5"
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
          <StatCard
            icon={IconCircleCheck}
            label="Task Completion Rate"
            value={loading ? "—" : `${avgProgress}%`}
            progress={avgProgress}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
          <StatCard
            icon={IconAlertTriangle}
            label="Initiatives at Risk"
            value={loading ? "—" : String(atRiskCount)}
            badgeText={atRiskCount > 0 ? "Action Required" : undefined}
            badgeColor="red"
          />
        </Grid.Col>
      </Grid>

      {riskSummary && (riskSummary.open > 0 || riskSummary.high > 0 || riskSummary.critical > 0) && (
        <Card withBorder radius="lg" p="md" mb="xl" style={{ cursor: "pointer" }} onClick={() => navigate(ROUTES.ADMIN_RISKS)}>
          <Group justify="space-between">
            <Group>
              <IconAlertTriangle size={24} color="var(--mantine-color-red-6)" />
              <Box>
                <Text fw={700} fz="md">Risk Monitoring</Text>
                <Text size="xs" c="dimmed">
                  {riskSummary.open} open · {riskSummary.high} high · {riskSummary.critical} critical
                </Text>
              </Box>
            </Group>
            <Text size="sm" fw={600} c="blue">View all →</Text>
          </Group>
        </Card>
      )}

      <Grid mb={30} gutter="xl">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder radius="lg" p={{ base: "md", sm: "xl" }} shadow="xs">
            <Group justify="space-between" mb={30}>
              <Box>
                <Text fw={800} fz="lg">
                  Initiatives
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {!loading && initiatives.length > 0 && `${activeCount} active · ${initiatives.length - activeCount} draft`}
                </Text>
              </Box>
              <Text
                c="blue.7"
                fw={700}
                fz="sm"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(ROUTES.ADMIN_INITIATIVES)}
              >
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
                      SUBMISSIONS
                    </Table.Th>
                    <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                      STATUS
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {loading ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text size="sm" c="dimmed">Loading initiatives…</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : displayInitiatives.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text size="sm" c="dimmed">No initiatives yet.</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    displayInitiatives.map((i) => (
                      <TableRow
                        key={i.id}
                        initiativeId={i.id}
                        name={i.title}
                        lead={i.leadName ?? "—"}
                        progress={i.progress ?? 0}
                        readiness={getReadinessForInitiative(i)}
                        submissionCount={getSubmissionCountForInitiative(i)}
                        status={i.status ?? "DRAFT"}
                        color={
                          i.status === "ACTIVE"
                            ? "#40c057"
                            : i.status === "PLANNING"
                              ? "#fab005"
                              : "#fa5252"
                        }
                        onRowClick={() => navigate(ROUTES.ADMIN_INITIATIVE_DETAIL(i.id))}
                      />
                    ))
                  )}
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
            {loading ? (
              <Text size="sm" c="dimmed">Loading…</Text>
            ) : submissions.length === 0 ? (
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  Staff need to submit assessments to see readiness scores.
                </Text>
                {initiatives.length > 0 && (
                  <>
                    <Text size="xs" fw={600} c="dimmed">Initiatives (no submissions yet):</Text>
                    {initiatives.slice(0, 5).map((i) => (
                      <Box key={i.id}>
                        <Group justify="space-between" mb={4}>
                          <Text fz={11} fw={700} c="dimmed">
                            {i.title.length > 24 ? i.title.slice(0, 24) + "…" : i.title}
                          </Text>
                          <Text fz={11} c="dimmed">—</Text>
                        </Group>
                        <Progress value={0} color="gray" h={5} radius="xl" />
                      </Box>
                    ))}
                  </>
                )}
                {assessments.length > 0 && (
                  <Box mt="xs">
                    <Text size="xs" c="dimmed" mb={8}>
                      {assessments.length} assessment{assessments.length === 1 ? "" : "s"} available.
                    </Text>
                    <Button variant="light" size="xs" color="blue" onClick={() => navigate(ROUTES.ADMIN_ASSESSMENTS)}>
                      Go to Assessments
                    </Button>
                  </Box>
                )}
              </Stack>
            ) : (
              <>
                <Stack gap={28}>
                  <ReadinessItem
                    label="OVERALL READINESS (from staff submissions)"
                    value={avgReadiness != null ? avgReadiness.toFixed(1) : "—"}
                  />
                  {initiatives
                    .filter((i) => {
                      const initId = toId(i.id) || toId((i as { _id?: unknown })._id);
                      return initId && submissionsByInitiative[initId]?.count > 0;
                    })
                    .slice(0, 5)
                    .map((i) => {
                      const initId = toId(i.id) || toId((i as { _id?: unknown })._id);
                      const agg = initId ? submissionsByInitiative[initId] : undefined;
                      const avg = agg ? agg.avg.toFixed(1) : "—";
                      return (
                        <ReadinessItem
                          key={i.id}
                          label={i.title.length > 28 ? i.title.slice(0, 28) + "…" : i.title}
                          value={avg}
                        />
                      );
                    })}
                </Stack>
                <Text ta="center" fz={11} c="dimmed" fw={600} mt={30}>
                  Average across {submissions.length} submission{submissions.length === 1 ? "" : "s"} from staff
                </Text>
              </>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Group justify="space-between" mb={30} wrap="nowrap">
              <Text fw={800} fz="lg">
                Initiative Progress
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
            {loading || initiatives.length === 0 ? (
              <Text size="sm" c="dimmed">
                {loading ? "Loading…" : "No initiatives to show progress."}
              </Text>
            ) : (
              <Stack gap="xl">
                <PhaseBar label="Average progress" value={avgProgress} />
                {initiatives.slice(0, 4).map((i) => (
                  <PhaseBar
                    key={i.id}
                    label={i.title.length > 25 ? i.title.slice(0, 25) + "…" : i.title}
                    value={i.progress ?? 0}
                  />
                ))}
              </Stack>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Group justify="space-between" mb={30}>
              <Text fw={800} fz="lg">
                Recent Activity
              </Text>
              <Badge variant="light" color="gray" radius="sm" fz={10} px={8}>
                From assessments
              </Badge>
            </Group>
            {loading ? (
              <Text size="sm" c="dimmed">Loading…</Text>
            ) : recentSubmissions.length === 0 ? (
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  No assessment submissions yet. Staff can complete assessments to see activity here.
                </Text>
                <Button
                  variant="light"
                  size="xs"
                  color="blue"
                  onClick={() => navigate(ROUTES.ADMIN_ASSESSMENTS)}
                >
                  Go to Assessments
                </Button>
              </Stack>
            ) : (
              <Stack gap={25}>
                {recentSubmissions.map((s) => {
                  const date = new Date(s.updatedAt ?? s.createdAt ?? 0);
                  const score = Math.round(Number(s.overallScore));
                  const assessName = s.assessmentName ?? assessments.find((a) => toId(a._id) === toId(s.assessmentId))?.name ?? "Assessment";
                  return (
                    <ActivityItem
                      key={s._id}
                      icon={IconCircleCheck}
                      color="green"
                      title={`Assessment submitted: ${assessName}`}
                      sub={`Score: ${score}/5${s.riskLevel ? ` • ${s.riskLevel}` : ""}`}
                      time={formatRelativeTime(date).toUpperCase()}
                    />
                  );
                })}
              </Stack>
            )}
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
        {progress != null && (
          <Text fz="xs" c="dimmed" fw={700}>
            {progress}%
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
          h={5}
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
  submissionCount = 0,
  status,
  color,
  onRowClick,
}: TableRowProps) {
  return (
    <Table.Tr
      style={onRowClick ? { cursor: "pointer" } : undefined}
      onClick={onRowClick}
    >
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
        h={5}
        w={100}
        radius="xl"
        />
      </Table.Td>
      <Table.Td style={{ minWidth: 72, whiteSpace: "nowrap" }}>
        <Badge
          variant="light"
          size="xs"
          style={{ fontSize: 10, paddingLeft: 6, paddingRight: 6, lineHeight: 1.2 }}
          color={
            readiness === "High"
              ? "green"
              : readiness === "Medium"
                ? "orange"
                : "red"
          }
          radius="sm"
        >
          {readiness}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text fz="sm" fw={600}>
          {submissionCount}
        </Text>
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
  const num = value === "—" || value === "" ? NaN : parseFloat(value);
  const progress = Number.isFinite(num) ? (num / 5) * 100 : 0;
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
        value={progress}
        color={THEME_BLUE}
        h={6}
        radius="xl"
      />
    </Box>
  );
}

function PhaseBar({ label, value }: PhaseBarProps) {
  return (
    <Group gap="md" wrap="nowrap" align="center" style={{ minWidth: 0 }}>
      <Text
        fz="sm"
        fw={700}
        style={{
          whiteSpace: "nowrap",
          minWidth: 140,
          flexShrink: 0,
        }}
      >
        {label}
      </Text>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Progress
          value={value}
          color={THEME_BLUE}
          h={6}
          radius="xl"
          style={{ width: "100%", backgroundColor: "#f1f3f5" }}
        />
      </Box>
      <Text fz="xs" fw={800} style={{ minWidth: 40, flexShrink: 0, textAlign: "right" }}>
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
