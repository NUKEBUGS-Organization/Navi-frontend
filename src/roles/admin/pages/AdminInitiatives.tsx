import AdminLayout from "../layout/AdminLayout";
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
  rem,
  TextInput,
  Button,
  ActionIcon,
  Select,
  SimpleGrid,
  Modal,
  Breadcrumbs,
  Anchor,
  Divider,
  Textarea,
  List,
  ThemeIcon,
} from "@mantine/core";
import { useState } from "react";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconPlus,
  IconCalendar,
  IconChevronDown,
  IconInfoCircle,
  IconUsers,
  IconTarget,
  IconHistory,
  IconTrash,
  IconBulb,
  IconRocket,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const THEME_BLUE = "#0f2b5c";
const TEAL_BLUE = "#008080";

interface InitiativeCardProps {
  status: "ACTIVE" | "DRAFT" | "PLANNING";
  readiness: string;
  title: string;
  leadName: string;
  leadAvatar?: string;
  dateRange: string;
  tags: string[];
  progress: number;
  onClick?: () => void;
}

const INITIATIVE_SLUGS: Record<string, string> = {
  "Cloud Migration Phase 2": "cloud-migration-phase-2",
  "HR Platform Refresh": "hr-platform-refresh",
  "Customer Success AI": "customer-success-ai",
  "Agile Transformation": "agile-transformation",
};

export default function AdminInitiatives() {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [initiatives, setInitiatives] = useState([
    {
      status: "ACTIVE",
      readiness: "4.2/5",
      title: "Cloud Migration Phase 2",
      leadName: "Sarah Jenkins",
      dateRange: "Mar 1 – Sep 30, 2025",
      tags: ["IT INFRASTRUCTURE", "OPERATIONS"],
      progress: 65,
      slug: INITIATIVE_SLUGS["Cloud Migration Phase 2"],
    },
    {
      status: "DRAFT",
      readiness: "3.8/5",
      title: "HR Platform Refresh",
      leadName: "Mark Thompson",
      dateRange: "Apr 15 – Oct 20, 2025",
      tags: ["HUMAN RESOURCES"],
      progress: 12,
      slug: INITIATIVE_SLUGS["HR Platform Refresh"],
    },
    {
      status: "PLANNING",
      readiness: "2.1/5",
      title: "Customer Success AI",
      leadName: "David Chen",
      dateRange: "May 1 – Dec 15, 2025",
      tags: ["CUSTOMER SUPPORT", "PRODUCT"],
      progress: 4,
      slug: INITIATIVE_SLUGS["Customer Success AI"],
    },
    {
      status: "ACTIVE",
      readiness: "3.5/5",
      title: "Agile Transformation",
      leadName: "Elena Rodriguez",
      dateRange: "Jan 1 – Jun 30, 2025",
      tags: ["ENGINEERING", "LEADERSHIP"],
      progress: 88,
      slug: INITIATIVE_SLUGS["Agile Transformation"],
    },
  ]);

  // Add new initiative (client only)
  const handleAddInitiative = (
    newInit: Omit<InitiativeCardProps, "slug"> & { slug?: string },
  ) => {
    setInitiatives((prev) => [
      { ...newInit, slug: newInit.title.toLowerCase().replace(/\s+/g, "-") },
      ...prev,
    ]);
  };

  // Filter by search
  const filtered = initiatives.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.leadName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <Group justify="space-between" mb={30}>
        <Stack gap={5}>
          <Title order={1} fw={800} fz={32} c={THEME_BLUE}>
            Change Initiatives
          </Title>
          <Text c="dimmed" fw={500}>
            Manage and track all organizational change initiatives
          </Text>
        </Stack>
        <Button
          onClick={open}
          leftSection={<IconPlus size={18} />}
          bg={THEME_BLUE}
          radius="md"
          h={45}
          px="xl"
          fw={700}
        >
          New Initiative
        </Button>
      </Group>

      <Card withBorder radius="md" p="md" mb={40} shadow="xs">
        <Group grow>
          <TextInput
            placeholder="Search initiatives..."
            leftSection={<IconSearch size={16} />}
            variant="default"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Select
            placeholder="Status"
            data={["Active", "Draft", "Planning"]}
            rightSection={<IconChevronDown size={16} />}
            disabled
          />
          <Select
            placeholder="Departments"
            data={["IT", "HR", "Operations", "Product"]}
            rightSection={<IconChevronDown size={16} />}
            disabled
          />
        </Group>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
        {filtered.map((i) => (
          <InitiativeCard
            key={i.title}
            status={i.status as "ACTIVE" | "DRAFT" | "PLANNING"}
            readiness={i.readiness}
            title={i.title}
            leadName={i.leadName}
            dateRange={i.dateRange}
            tags={i.tags}
            progress={i.progress}
            onClick={() => navigate(`/admin/initiatives/${i.slug}`)}
          />
        ))}
        <Card
          onClick={open}
          withBorder
          radius="lg"
          h="100%"
          style={{
            borderStyle: "dashed",
            borderWidth: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          <Stack align="center" gap="md">
            <ActionIcon variant="transparent" size="xl" c="gray.4">
              <IconPlus size={40} stroke={1.5} />
            </ActionIcon>
            <Text fw={700} c="dimmed" fz="lg">
              Create New Initiative
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <CreateInitiativeModal
        opened={opened}
        onClose={close}
        onAdd={handleAddInitiative}
      />
    </AdminLayout>
  );
}

function CreateInitiativeModal({
  opened,
  onClose,
  onAdd,
}: {
  opened: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [lead, setLead] = useState("");
  const [status, setStatus] = useState("ACTIVE");
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
                    <Select
                      label={
                        <Text fw={700} fz="sm" mb={5}>
                          Change Lead
                        </Text>
                      }
                      placeholder="Select a lead..."
                      rightSection={<IconChevronDown size={18} />}
                      data={[
                        "Sarah Jenkins",
                        "Alex Rivera",
                        "Mark Thompson",
                        "David Chen",
                        "Elena Rodriguez",
                      ]}
                      radius="md"
                      size="md"
                      value={lead}
                      onChange={(value) => setLead(value || "")}
                    />
                    <Select
                      label={
                        <Text fw={700} fz="sm" mb={5}>
                          Status
                        </Text>
                      }
                      placeholder="Select status..."
                      data={["ACTIVE", "DRAFT", "PLANNING"]}
                      value={status}
                      onChange={(value) => setStatus(value || "")}
                    />
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
                      />
                    </Grid.Col>
                  </Grid>
                </Box>

                <Box>
                  <Group gap="xs" mb="md">
                    <IconUsers size={22} color={THEME_BLUE} stroke={2} />
                    <Title order={4} fw={800} fz="lg">
                      Departments Impacted
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Group gap="sm">
                    {[
                      "Engineering",
                      "Marketing",
                      "Operations",
                      "Sales",
                      "Human Resources",
                    ].map((dept) => (
                      <Button
                        key={dept}
                        variant="outline"
                        radius="xl"
                        size="sm"
                        fw={700}
                        px="xl"
                        styles={{
                          root: {
                            border:
                              dept === "Engineering" || dept === "Operations"
                                ? `2px solid ${THEME_BLUE}`
                                : "1px solid #dee2e6",
                            color:
                              dept === "Engineering" || dept === "Operations"
                                ? THEME_BLUE
                                : "#495057",
                            backgroundColor:
                              dept === "Engineering" || dept === "Operations"
                                ? "#f1f3f9"
                                : "white",
                          },
                        }}
                      >
                        {dept}
                      </Button>
                    ))}
                    <Button
                      variant="subtle"
                      color="blue"
                      leftSection={<IconPlus size={16} />}
                      size="sm"
                      fw={700}
                    >
                      Add Dept
                    </Button>
                  </Group>
                </Box>

                <Box>
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconTarget size={22} color={THEME_BLUE} stroke={2} />
                      <Title order={4} fw={800} fz="lg">
                        Goals & Success Measures
                      </Title>
                    </Group>
                    <Button
                      variant="subtle"
                      leftSection={<IconPlus size={16} />}
                      size="xs"
                      fw={700}
                    >
                      Add Goal
                    </Button>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
                  <Stack gap="md">
                    <Group grow align="center">
                      <TextInput
                        placeholder="Goal (e.g., Reduce latency)"
                        radius="md"
                        size="md"
                        flex={1}
                      />
                      <TextInput
                        placeholder="Success Metric"
                        radius="md"
                        size="md"
                        flex={1}
                      />
                      <ActionIcon
                        variant="subtle"
                        color="gray.4"
                        size="lg"
                        mt={5}
                      >
                        <IconTrash size={20} />
                      </ActionIcon>
                    </Group>
                    <Group grow align="center">
                      <TextInput
                        placeholder="Goal (e.g., Staff Training)"
                        radius="md"
                        size="md"
                        flex={1}
                      />
                      <TextInput
                        placeholder="Success Metric"
                        radius="md"
                        size="md"
                        flex={1}
                      />
                      <ActionIcon
                        variant="subtle"
                        color="gray.4"
                        size="lg"
                        mt={5}
                      >
                        <IconTrash size={20} />
                      </ActionIcon>
                    </Group>
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
                      <StatusCard
                        active
                        title="Drafting"
                        desc="Not visible to teams yet."
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <StatusCard
                        title="Pending Review"
                        desc="Submit for approval."
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <StatusCard title="Published" desc="Live and active." />
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
                    <Title order={4} mt={5} fw={800} fz="lg">
                      Q4 Operational Efficiency...
                    </Title>
                  </Box>
                  <Stack p="xl" gap="xl">
                    <Group>
                      <Avatar
                        radius="md"
                        size="lg"
                        src="https://i.pravatar.cc/150?u=sarah"
                      />
                      <Stack gap={0}>
                        <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                          Lead
                        </Text>
                        <Text fw={800} fz="md">
                          Sarah Jenkins
                        </Text>
                      </Stack>
                    </Group>
                    <Group grow>
                      <Stack gap={0}>
                        <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                          Start
                        </Text>
                        <Text fw={800} fz="md">
                          Oct 12, 2024
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
                          DRAFT
                        </Badge>
                      </Stack>
                    </Group>
                    <Stack gap={8}>
                      <Text fz={11} fw={700} c="dimmed" lts={0.5}>
                        Impacted
                      </Text>
                      <Group gap={6}>
                        <Badge
                          bg="#e9ecef"
                          c="#495057"
                          radius="xs"
                          fz={9}
                          fw={800}
                        >
                          ENG
                        </Badge>
                        <Badge
                          bg="#e9ecef"
                          c="#495057"
                          radius="xs"
                          fz={9}
                          fw={800}
                        >
                          OPS
                        </Badge>
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
                onClick={() => {
                  if (title && lead) {
                    onAdd({
                      status,
                      readiness: "3.0/5",
                      title,
                      leadName: lead,
                      dateRange: "--",
                      tags: ["NEW"],
                      progress: 0,
                    });
                    setTitle("");
                    setLead("");
                    setStatus("ACTIVE");
                    onClose();
                  }
                }}
              >
                Save as Draft
              </Button>
              <Button
                leftSection={<IconRocket size={18} />}
                bg={TEAL_BLUE}
                radius="md"
                fw={700}
                px={30}
                h={45}
                onClick={() => {
                  if (title && lead) {
                    onAdd({
                      status,
                      readiness: "3.0/5",
                      title,
                      leadName: lead,
                      dateRange: "--",
                      tags: ["NEW"],
                      progress: 0,
                    });
                    setTitle("");
                    setLead("");
                    setStatus("ACTIVE");
                    onClose();
                  }
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

function InitiativeCard({
  status,
  readiness,
  title,
  leadName,
  dateRange,
  tags,
  progress,
  onClick,
}: InitiativeCardProps) {
  const getStatusColor = () => {
    if (status === "ACTIVE")
      return { bg: "#e6fcf5", text: "#099268", dot: "#40c057" };
    if (status === "DRAFT")
      return { bg: "#fff4e6", text: "#d9480f", dot: "#fab005" };
    return { bg: "#e7f5ff", text: "#1971c2", dot: "#fa5252" };
  };
  const colors = getStatusColor();
  return (
    <Card
      withBorder
      radius="lg"
      shadow="sm"
      p={0}
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <Stack p="xl" gap="md">
        <Group justify="space-between">
          <Badge
            bg={colors.bg}
            c={colors.text}
            radius="sm"
            px={8}
            py={12}
            fw={800}
          >
            {status}
          </Badge>
          <Group gap={6}>
            <Box w={8} h={8} bg={colors.dot} style={{ borderRadius: "50%" }} />
            <Text fz="xs" fw={700} c="dimmed">
              Readiness: {readiness}
            </Text>
          </Group>
        </Group>
        <Title order={3} fz={20} fw={800} mt="sm">
          {title}
        </Title>
        <Group gap="sm" mt="sm">
          <Avatar radius="md" size="md" />
          <Stack gap={0}>
            <Text fz={11} fw={700} c="dimmed" lts={0.5}>
              CHANGE LEAD
            </Text>
            <Text fz="sm" fw={800}>
              {leadName}
            </Text>
          </Stack>
        </Group>
        <Group gap={8} mt={5}>
          <IconCalendar size={16} color="#adb5bd" />
          <Text fz="xs" fw={600} c="dimmed">
            {dateRange}
          </Text>
        </Group>
        <Group gap="xs" mt="sm">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="filled"
              bg="#f1f3f5"
              c="gray.7"
              radius="sm"
              fz={9}
              fw={800}
              px={8}
            >
              {tag}
            </Badge>
          ))}
        </Group>
        <Box mt="lg">
          <Group justify="space-between" mb={8}>
            <Text fz="xs" fw={700} c="dimmed">
              Overall Progress
            </Text>
            <Text fz="sm" fw={800}>
              {progress}%
            </Text>
          </Group>
          <Progress value={progress} color={THEME_BLUE} h={8} radius="xl" />
        </Box>
      </Stack>
      <Box style={{ borderTop: "1px solid #f1f3f5" }}>
        <Group grow gap={0}>
          <Button
            variant="subtle"
            radius={0}
            h={55}
            fz="sm"
            fw={700}
            c={THEME_BLUE}
            style={{ borderRight: "1px solid #f1f3f5" }}
          >
            View Details
          </Button>
          <Button
            variant="subtle"
            radius={0}
            h={55}
            fz="sm"
            fw={700}
            c={THEME_BLUE}
          >
            View Roadmap
          </Button>
        </Group>
      </Box>
    </Card>
  );
}

function StatusCard({ title, desc, active }: any) {
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
