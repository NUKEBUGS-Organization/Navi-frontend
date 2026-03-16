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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  listInitiatives,
  createInitiative,
  updateInitiative,
  type InitiativeListItem,
  type CreateInitiativePayload,
} from "@/api/initiatives";
import { listOrganizationUsers } from "@/api/auth";
import { getMyOrganization } from "@/api/organizations";
import { listTasks } from "@/api/tasks";
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
import { IconHistory } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { IconBulb } from "@tabler/icons-react";
import { IconRocket } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { THEME_BLUE, TEAL_BLUE, ROUTES } from "@/constants";
import type { InitiativeSummary, InitiativeStatus } from "@/types";

export default function AdminInitiatives() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreateInitiatives = user?.role === "admin";
  const [opened, { open, close }] = useDisclosure(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [initiatives, setInitiatives] = useState<InitiativeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<{ name: string; id: string }[]>([]);
  const [orgDepartments, setOrgDepartments] = useState<string[]>([]);
  const [tasksByInitiative, setTasksByInitiative] = useState<Record<string, { total: number; completed: number }>>({});

  const fetchInitiatives = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listInitiatives();
      setInitiatives(data);
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

  useEffect(() => {
    let cancelled = false;
    Promise.all([listOrganizationUsers(), getMyOrganization()])
      .then(([users, org]) => {
        if (cancelled) return;
        const managerList = users
          .filter((u) => u.role === "manager")
          .map((u) => ({ name: u.name, id: u._id }));
        setManagers(managerList);
        setOrgDepartments(org.departments ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (data: InitiativeSummary) => {
    if (editIndex === null) return;
    const initiative = initiatives[editIndex];
    const id = initiative?.id ?? (initiative as InitiativeListItem).id;
    if (!id) return;
    setSaveLoading(true);
    setError(null);
    try {
      await updateInitiative(id, {
        title: data.title,
        leadName: data.leadName,
        status: data.status,
        dateRange: data.dateRange,
        departments: data.departments,
        progress: data.progress ?? 0,
        goals: data.goals,
        readiness: data.readiness,
      });
      await fetchInitiatives();
      setEditIndex(null);
      close();
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to update initiative");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAdd = async (data: InitiativeSummary & { description?: string }) => {
    setSaveLoading(true);
    setError(null);
    try {
      const payload: CreateInitiativePayload = {
        title: data.title,
        description: data.description,
        leadName: data.leadName,
        status: data.status,
        dateRange: data.dateRange,
        departments: data.departments ?? [],
        progress: data.progress ?? 0,
        goals: data.goals ?? [],
        readiness: data.readiness,
      };
      await createInitiative(payload);
      await fetchInitiatives();
      close();
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to create initiative");
    } finally {
      setSaveLoading(false);
    }
  };

  // Filter by search
  const filtered = initiatives.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.leadName.toLowerCase().includes(search.toLowerCase()),
  );

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
                open();
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
            {filtered.map((i, idx) => (
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
                    Readiness: {i.readiness}
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
              <Group grow mt={8}>
                <Button
                  variant="subtle"
                  color={THEME_BLUE}
                  fw={700}
                  radius="md"
                  h={38}
                  style={{ fontSize: 14 }}
                  onClick={() =>
                    navigate(ROUTES.ADMIN_INITIATIVE_DETAIL(i.id))
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
                    navigate(ROUTES.ADMIN_ROADMAP, { state: { initiativeId: i.id } })
                  }
                >
                  View Roadmap
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
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
        />
      )}
    </AdminLayout>
  );
}

const FALLBACK_DEPARTMENTS = ["Engineering", "Operations", "Sales", "Human Resources", "IT"];

// Modal with repeater for goals, Mantine form
interface InitiativeModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (data: InitiativeSummary) => void;
  initial: InitiativeSummary | null;
  managers: { name: string; id: string }[];
  orgDepartments: string[];
}

function InitiativeModal({
  opened,
  onClose,
  onSave,
  initial,
  managers,
  orgDepartments,
}: InitiativeModalProps) {
  const departmentOptions = orgDepartments.length > 0 ? orgDepartments : FALLBACK_DEPARTMENTS;
  const leadOptions = managers.map((m) => ({ value: m.name, label: m.name }));
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
    },
    validate: {
      title: (v) => (!v ? "Title required" : null),
      leadName: (v) => (!v ? "Lead required" : null),
      status: (v) => (!v ? "Status required" : null),
      departments: (v) =>
        v.length === 0 ? "Select at least one department" : null,
    },
  });

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
          onSave(values);
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
          <Select
            label="Status"
            data={["ACTIVE", "DRAFT", "PLANNING"]}
            {...form.getInputProps("status")}
          />
          <TextInput
            label="Timeline (e.g., Mar 1 – Sep 30, 2025)"
            {...form.getInputProps("dateRange")}
          />
          <MultiSelect
            label="Departments Impacted"
            data={departmentOptions}
            {...form.getInputProps("departments")}
          />
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
}

function CreateInitiativeModal({
  opened,
  onClose,
  onAdd,
  managers,
  orgDepartments,
}: CreateInitiativeModalProps) {
  const departmentOptions = orgDepartments.length > 0 ? orgDepartments : ["Engineering", "Operations", "Sales", "Human Resources"];
  const leadOptions = managers.map((m) => ({ value: m.name, label: m.name }));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lead, setLead] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 9, 12));
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(departmentOptions.length > 0 ? [departmentOptions[0]] : []);
  const [goals, setGoals] = useState<{ goal: string; metric: string }[]>([
    { goal: "Reduce latency", metric: "<200ms" },
    { goal: "Staff Training", metric: "90% completion" },
  ]);
  type InitialStatus = "Drafting" | "Pending Review" | "Published";
  const [initialStatus, setInitialStatus] = useState<InitialStatus>("Drafting");

  const toggleDept = (dept: string) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

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
                      Departments Impacted
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#e9ecef" />
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
                      variant="subtle"
                      color="blue"
                      leftSection={<IconPlus size={16} />}
                      size="sm"
                      fw={700}
                    >
                      + Add Dept
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
                        {selectedDepts.length > 0
                          ? selectedDepts.map((d) => (
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
                          : "—"}
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
                  const dateRange =
                    startDate && endDate
                      ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
                      : startDate
                        ? startDate.toLocaleDateString() + " – —"
                        : "—";
                  onAdd({
                    status: "DRAFT",
                    readiness: "3.0/5",
                    title: title || "Untitled Initiative",
                    description,
                    leadName: lead,
                    dateRange,
                    departments: selectedDepts,
                    goals,
                    progress: 0,
                  });
                  setTitle("");
                  setDescription("");
                  setLead("");
                  setStartDate(null);
                  setEndDate(null);
                  setSelectedDepts([]);
                  setGoals([{ goal: "", metric: "" }]);
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
                onClick={() => {
                  if (!title || !lead) return;
                  const dateRange =
                    startDate && endDate
                      ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
                      : startDate
                        ? startDate.toLocaleDateString() + " – —"
                        : "—";
                  const statusMap: Record<InitialStatus, InitiativeStatus> = {
                    Drafting: "DRAFT",
                    "Pending Review": "PLANNING",
                    Published: "ACTIVE",
                  };
                  onAdd({
                    status: statusMap[initialStatus],
                    readiness: "3.0/5",
                    title,
                    description,
                    leadName: lead,
                    dateRange,
                    departments: selectedDepts,
                    goals,
                    progress: 0,
                  });
                  setTitle("");
                  setDescription("");
                  setLead("");
                  setStartDate(null);
                  setEndDate(null);
                  setSelectedDepts([]);
                  setGoals([{ goal: "", metric: "" }]);
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
