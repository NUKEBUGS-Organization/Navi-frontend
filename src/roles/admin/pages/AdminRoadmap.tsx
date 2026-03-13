import React from "react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Text,
  Group,
  Button,
  Tabs,
  rem,
  Card,
  Badge,
  Avatar,
  Stack,
  Progress,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Divider,
  SegmentedControl,
  Slider,
  SimpleGrid,
  Menu,
} from "@mantine/core";
import type { ReactNode } from "react";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconLayoutKanban,
  IconList,
  IconTimeline,
  IconFilter,
  IconDots,
  IconCalendar,
  IconPackage,
  IconSearch,
  IconChevronDown,
  IconRocket,
} from "@tabler/icons-react";
import { THEME_BLUE, TEAL_BLUE } from "@/constants";
import { PageHeader } from "@/components";
import { TaskCard } from "@/components/roadmap/TaskCard";
import type { Task } from "@/types";

export default function AdminRoadmap() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const breadcrumbs = [
    { title: "Initiatives", href: "#" },
    { title: "Strategic Digital Transformation", href: "#" },
    { title: "Roadmap", href: "#" },
  ];

  const tasks: Task[] = [
    {
      id: 1,
      status: "In Progress",
      title: "Stakeholder Impact Assessment Workshop",
      owner: "Sarah M.",
      date: "Oct 24",
      progress: 65,
    },
    {
      id: 2,
      status: "Not Started",
      title: "Current State Data Architecture Audit",
      owner: "James T.",
      date: "Oct 30",
      progress: 0,
    },
    {
      id: 3,
      status: "Blocked",
      title: "Executive Town Hall Communication Kit",
      owner: "Elena V.",
      date: "Nov 05",
      progress: 20,
      isBlocked: true,
    },
  ];

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <AdminLayout>
      <>
        <Box style={{ width: "100%" }}>
          <PageHeader
            title="Change Roadmap"
            breadcrumbs={breadcrumbs}
            actions={
              <Button
                leftSection={<IconPlus size={20} />}
                bg={THEME_BLUE}
                radius="md"
                h={45}
                px={30}
                fw={700}
                onClick={open}
              >
                Add Task
              </Button>
            }
          />

          <Box
            style={{
              borderBottom: "1.5px solid #e9ecef",
              paddingBottom: rem(4),
              marginBottom: rem(24),
            }}
          >
            <Group justify="space-between" align="flex-end">
              <Tabs
                defaultValue="kanban"
                variant="pills"
                styles={{
                  tab: {
                    border: "none",
                    backgroundColor: "transparent",
                    fontWeight: 700,
                    fontSize: rem(15),
                    color: "#94A3B8",
                    borderRadius: 0,
                    paddingBottom: rem(15),
                    borderBottom: "3px solid transparent",
                    "&[data-active]": {
                      color: THEME_BLUE,
                      borderBottom: `3px solid ${THEME_BLUE}`,
                      backgroundColor: "transparent",
                    },
                  },
                  list: {
                    borderBottom: "none",
                  },
                }}
              >
                <Tabs.List>
                  <Tabs.Tab
                    value="kanban"
                    leftSection={<IconLayoutKanban size={20} />}
                  >
                    Kanban
                  </Tabs.Tab>
                  <Tabs.Tab value="list" leftSection={<IconList size={20} />}>
                    List
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="timeline"
                    leftSection={<IconTimeline size={20} />}
                  >
                    Timeline
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="kanban" pt="xl">
                  <SimpleGrid
                    cols={{ base: 1, sm: 2, lg: 3 }}
                    spacing={40}
                    verticalSpacing={50}
                  >
                    <KanbanColumn
                      title="DISCOVERY"
                      count={2}
                      progress={75}
                      color="#00a99d"
                    >
                      {tasks.slice(0, 2).map((task) => (
                        <TaskCard
                          key={task.id}
                          {...task}
                          onMenuClick={() => handleEditTask(task)}
                        />
                      ))}
                    </KanbanColumn>

                    <KanbanColumn
                      title="AWARENESS"
                      count={1}
                      progress={45}
                      color="#00a99d"
                    >
                      {tasks.slice(2, 3).map((task) => (
                        <TaskCard
                          key={task.id}
                          {...task}
                          onMenuClick={() => handleEditTask(task)}
                        />
                      ))}
                    </KanbanColumn>

                    <KanbanColumn
                      title="ALIGNMENT"
                      count={8}
                      progress={0}
                      color="#00a99d"
                    >
                      <Card
                        h={rem(200)}
                        withBorder
                        radius="lg"
                        bg="#f8f9fa"
                        style={{
                          border: "2.5px dashed #dee2e6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Stack align="center" gap={8}>
                          <IconPackage size={44} color="#adb5bd" stroke={1.2} />
                          <Text fz="sm" c="dimmed" fw={700}>
                            Drop tasks here
                          </Text>
                        </Stack>
                      </Card>
                    </KanbanColumn>
                  </SimpleGrid>
                </Tabs.Panel>

                <Tabs.Panel value="list" pt="xl">
                <Stack gap="sm">
                    {tasks.map((task) => (
                      <Card
                        key={task.id}
                        withBorder
                        radius="md"
                        p="md"
                        shadow="xs"
                      >
                        <Group justify="space-between" align="flex-start" mb="xs">
                          <Group gap="xs">
                            <Badge
                              size="xs"
                              radius="sm"
                              variant="light"
                              color={
                                task.status === "In Progress"
                                  ? "blue"
                                  : task.status === "Blocked"
                                    ? "red"
                                    : "gray"
                              }
                              fw={700}
                            >
                              {task.status}
                            </Badge>
                            <Text fw={700}>{task.title}</Text>
                          </Group>
                          <Menu shadow="md" width={180} position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray.5">
                                <IconDots size={18} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item onClick={() => handleEditTask(task)}>
                                Edit
                              </Menu.Item>
                              <Menu.Item onClick={() => handleEditTask(task)}>
                                Update
                              </Menu.Item>
                              <Menu.Item color="red" onClick={() => handleEditTask(task)}>
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                        <Group justify="space-between" mb={6}>
                          <Group gap="xs">
                            <Avatar size="xs" radius="xl" color="blue" />
                            <Text fz="xs" c="dimmed" fw={600}>
                              {task.owner}
                            </Text>
                          </Group>
                          <Group gap={6}>
                            <IconCalendar size={15} color="#94A3B8" />
                            <Text fz="xs" fw={700} c="dimmed">
                              {task.date}
                            </Text>
                          </Group>
                        </Group>
                        <Progress
                          value={task.progress}
                          color={THEME_BLUE}
                          h={4}
                          radius="xl"
                        />
                      </Card>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="timeline" pt="xl">
                  <Stack gap="md">
                    {tasks.map((task) => (
                      <Group
                        key={task.id}
                        align="flex-start"
                        wrap="nowrap"
                        gap="md"
                      >
                        <Box
                          w={70}
                          style={{ textAlign: "right" }}
                        >
                          <Text fz="xs" c="dimmed" fw={600}>
                            {task.date}
                          </Text>
                        </Box>
                        <Box
                          style={{
                            flex: 1,
                            borderLeft: "2px solid #e9ecef",
                            paddingLeft: rem(16),
                          }}
                        >
                          <Text fz="sm" fw={700}>
                            {task.title}
                          </Text>
                          <Group gap="xs" mt={4}>
                            <Badge
                              size="xs"
                              radius="sm"
                              variant="light"
                              color={
                                task.status === "In Progress"
                                  ? "blue"
                                  : task.status === "Blocked"
                                    ? "red"
                                    : "gray"
                              }
                              fw={700}
                            >
                              {task.status}
                            </Badge>
                            <Text fz="xs" c="dimmed">
                              {task.owner}
                            </Text>
                          </Group>
                          <Progress
                            mt={6}
                            value={task.progress}
                            color={THEME_BLUE}
                            h={4}
                            radius="xl"
                          />
                        </Box>
                      </Group>
                    ))}
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              <Group
                gap={8}
                style={{ cursor: "pointer", paddingBottom: rem(15) }}
              >
                <Text fz="sm" fw={700} c="dimmed">
                  Filter: All Tasks
                </Text>
                <IconFilter size={20} color="#94A3B8" />
              </Group>
            </Group>
          </Box>
        </Box>
        <CreateTaskModal opened={opened} onClose={close} />
        <EditTaskModal
          opened={editModalOpen}
          onClose={handleCloseEditModal}
          task={selectedTask}
        />
      </>
    </AdminLayout>
  );
}

interface KanbanColumnProps {
  title: string;
  count: number;
  progress: number;
  color: string;
  children: ReactNode;
}

function KanbanColumn({
  title,
  count,
  progress,
  color,
  children,
}: KanbanColumnProps) {
  return (
    <Box style={{ width: "100%" }}>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Text fz="xs" fw={800} lts={1.2} c="dark">
            {title}
          </Text>
          <Badge
            variant="filled"
            bg="#e9ecef"
            c="gray.7"
            size="sm"
            radius="sm"
            fw={800}
          >
            {count}
          </Badge>
        </Group>
        <ActionIcon variant="transparent" c="gray.4">
          <IconPlus size={20} />
        </ActionIcon>
      </Group>
      <Progress
        value={progress}
        color={color}
        h={4}
        radius="xl"
        mb="xl"
        bg="#e9ecef"
      />
      <Stack gap="lg">{children}</Stack>
    </Box>
  );
}

interface EditTaskModalProps {
  opened: boolean;
  onClose: () => void;
  task: Task | null;
}

function EditTaskModal({ opened, onClose, task }: EditTaskModalProps) {
  if (!task) return null;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      fullScreen
      radius={0}
      padding={0}
      styles={{
        content: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
        body: {
          padding: 0,
          backgroundColor: "rgba(15, 23, 42, 0.35)",
        },
      }}
    >
      <Group
        justify="flex-end"
        align="stretch"
        gap={0}
        style={{ height: "100vh" }}
      >
        <Box
          style={{ flex: 1, cursor: "pointer" }}
          onClick={onClose}
        />
        <Box
          w={430}
          bg="white"
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box p="lg" pb="sm" style={{ borderBottom: "1px solid #f1f3f5" }}>
            <Group justify="space-between" align="flex-start">
              <Stack gap={6}>
                <Badge
                  size="sm"
                  radius="lg"
                  variant="light"
                  color={
                    task.status === "In Progress"
                      ? "blue"
                      : task.status === "Blocked"
                        ? "red"
                        : "gray"
                  }
                  fw={700}
                >
                  {task.status}
                </Badge>
                <Text fz="sm" fw={700}>
                  {task.title}
                </Text>
              </Stack>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </ActionIcon>
            </Group>
          </Box>

          <Box
            px="lg"
            py="md"
            style={{ flex: 1, overflowY: "auto" }}
          >
            <Stack gap="lg">
              <Box>
                <Text fz="xs" fw={700} c="dimmed" mb={8}>
                  DETAILS
                </Text>
                <SimpleGrid cols={2} spacing="md">
                  <Box>
                    <Text fz="xs" c="dimmed" fw={600} mb={4}>
                      Phase
                    </Text>
                    <Text fz="sm" fw={700}>
                      Discovery
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="xs" c="dimmed" fw={600} mb={4}>
                      Owner
                    </Text>
                    <Group gap="xs">
                      <Avatar size="sm" radius="xl" color="blue" />
                      <Text fz="sm" fw={700}>
                        {task.owner}
                      </Text>
                    </Group>
                  </Box>
                  <Box>
                    <Text fz="xs" c="dimmed" fw={600} mb={4}>
                      Due Date
                    </Text>
                    <Group gap={6}>
                      <IconCalendar size={14} color="#f97316" />
                      <Text fz="sm" fw={700} c="#f97316">
                        {task.date}
                      </Text>
                    </Group>
                  </Box>
                  <Box>
                    <Text fz="xs" c="dimmed" fw={600} mb={4}>
                      Progress
                    </Text>
                    <Group gap="xs">
                      <Box style={{ flex: 1 }}>
                        <Progress
                          value={task.progress}
                          color={THEME_BLUE}
                          h={6}
                          radius="xl"
                        />
                      </Box>
                      <Text fz="sm" fw={700}>
                        {task.progress}%
                      </Text>
                    </Group>
                  </Box>
                </SimpleGrid>
              </Box>

              <Box>
                <Group justify="space-between" mb={6}>
                  <Text fz="xs" fw={700} c="dimmed">
                    DESCRIPTION
                  </Text>
                  <Text fz="xs" c="blue" fw={600}>
                    Edit
                  </Text>
                </Group>
                <Textarea
                  placeholder="Click to add description..."
                  minRows={3}
                  radius="md"
                  size="sm"
                />
              </Box>

              <Box>
                <Text fz="xs" fw={700} c="dimmed" mb={8}>
                  ACTIVITY LOG
                </Text>
                <Stack gap="md">
                  <Group align="flex-start" gap="sm">
                    <Avatar size="sm" radius="xl" color="blue" />
                    <Box>
                      <Text fz="sm" fw={600}>
                        Marcus Lee{" "}
                        <Text span fz="xs" c="dimmed">
                          changed status to{" "}
                          <Badge size="xs" radius="sm" color="blue" variant="light">
                            In Progress
                          </Badge>
                        </Text>
                      </Text>
                      <Text fz="xs" c="dimmed">
                        2 hours ago
                      </Text>
                    </Box>
                  </Group>
                  <Group align="flex-start" gap="sm">
                    <Avatar size="sm" radius="xl" color="grape" />
                    <Box>
                      <Text fz="sm" fw={600}>
                        Alex Rivera
                      </Text>
                      <Text fz="xs" c="dimmed">
                        Scheduled the first three interviews for Thursday. Waiting on
                        the legal team for NDA templates.
                      </Text>
                      <Text fz="xs" c="dimmed" mt={4}>
                        Yesterday at 4:32 PM
                      </Text>
                    </Box>
                  </Group>
                  <Box>
                    <Text fz="xs" c="dimmed" mb={4}>
                      Write a comment...
                    </Text>
                    <Group gap="xs">
                      <TextInput
                        placeholder="Add a comment"
                        radius="xl"
                        size="sm"
                        style={{ flex: 1 }}
                      />
                      <Button
                        radius="xl"
                        size="sm"
                        bg={THEME_BLUE}
                        px="md"
                      >
                        Send
                      </Button>
                    </Group>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box
            px="lg"
            py="md"
            style={{
              borderTop: "1px solid #f1f3f5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button variant="subtle" color="red" fw={700}>
              Delete Task
            </Button>
            <Button
              bg={THEME_BLUE}
              radius="md"
              fw={700}
              px={30}
              h={40}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Group>
    </Modal>
  );
}

function CreateTaskModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={900} fz="xl" c={THEME_BLUE}>
          Create Task
        </Text>
      }
      centered
      size="lg"
      radius="lg"
      padding={30}
      styles={{
        header: { borderBottom: "1px solid #f1f3f5", marginBottom: rem(20) },
      }}
    >
      <Stack gap="xl">
        <TextInput
          label={
            <Text fw={700} fz="sm" mb={5}>
              Task Title
            </Text>
          }
          placeholder="e.g., Define target audience personas"
          radius="md"
          size="md"
        />
        <Textarea
          label={
            <Text fw={700} fz="sm" mb={5}>
              Description
            </Text>
          }
          placeholder="Describe the task details..."
          minRows={4}
          radius="md"
          size="md"
        />

        <SimpleGrid cols={2}>
          <Select
            label={
              <Text fw={700} fz="sm" mb={5}>
                Phase
              </Text>
            }
            placeholder="Discovery"
            data={["Discovery", "Awareness", "Alignment"]}
            radius="md"
            size="md"
            rightSection={<IconChevronDown size={18} />}
          />
          <DateInput
            label={
              <Text fw={700} fz="sm" mb={5}>
                Due Date
              </Text>
            }
            placeholder="mm/dd/yyyy"
            radius="md"
            size="md"
          />
        </SimpleGrid>

        <Box>
          <Text fw={700} fz="sm" mb={8}>
            Task Owner
          </Text>
          <Box
            p="md"
            style={{
              border: "1px solid #e9ecef",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Group gap="sm">
              <Avatar radius="xl" size="sm" color="blue" />
              <Stack gap={0}>
                <Text fz="sm" fw={800}>
                  Alex Rivera
                </Text>
                <Text fz="xs" c="dimmed" fw={600}>
                  Project Lead
                </Text>
              </Stack>
            </Group>
            <IconSearch size={20} color="#adb5bd" />
          </Box>
        </Box>

        <Box>
          <Text fw={700} fz="sm" mb={10}>
            Status
          </Text>
          <SegmentedControl
            fullWidth
            radius="md"
            size="md"
            data={["Not Started", "In Progress", "Completed", "Blocked"]}
            styles={{
              root: { backgroundColor: "#f1f3f5", padding: "4px" },
              indicator: { backgroundColor: "white" },
              label: { fontWeight: 800, fontSize: rem(12) },
            }}
          />
        </Box>

        <Box>
          <Group justify="space-between" mb={8}>
            <Text fw={700} fz="sm">
              Progress
            </Text>
            <Badge variant="light" color="teal" radius="sm" fw={800}>
              0%
            </Badge>
          </Group>
          <Slider
            color={TEAL_BLUE}
            defaultValue={0}
            label={null}
            thumbSize={20}
          />
        </Box>

        <Divider />

        <Group justify="flex-end" gap="md" mt="md">
          <Button variant="transparent" c="gray.6" fw={700} onClick={onClose}>
            Cancel
          </Button>
          <Button
            bg={TEAL_BLUE}
            radius="md"
            px={30}
            h={45}
            fw={700}
            leftSection={<IconRocket size={18} />}
          >
            Save Task
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
