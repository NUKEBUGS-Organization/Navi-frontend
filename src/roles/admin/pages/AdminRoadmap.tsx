import React from "react";
import AdminLayout from "../layout/AdminLayout";
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  Breadcrumbs,
  Anchor,
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

const THEME_BLUE = "#0f2b5c";
const TEAL_BLUE = "#00a99d";

export default function AdminRoadmap() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<any>(null);

  const breadcrumbs = [
    { title: "Initiatives", href: "#" },
    { title: "Strategic Digital Transformation", href: "#" },
    { title: "Roadmap", href: "#" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} fz="xs" c="dimmed" fw={600}>
      {item.title}
    </Anchor>
  ));

  const tasks = [
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

  const handleEditTask = (task: any) => {
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
          <Group justify="space-between" mb={30} align="flex-end">
            <Stack gap={8}>
              <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
              <Title order={1} fw={800} fz={rem(34)} c="#1A1D1E">
                Change Roadmap
              </Title>
            </Stack>
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
          </Group>

          <Group
            justify="space-between"
            mb={40}
            style={{ borderBottom: "1.5px solid #e9ecef" }}
          >
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

function KanbanColumn({ title, count, progress, color, children }: any) {
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

function TaskCard({
  status,
  title,
  owner,
  date,
  progress,
  isBlocked,
  onMenuClick,
}: any) {
  return (
    <Card
      withBorder
      radius="lg"
      shadow="xs"
      p="xl"
      style={{ border: "1px solid #E9ECEF" }}
    >
      <Group justify="space-between" mb="md">
        <Badge
          variant="filled"
          bg={isBlocked ? "#fff5f5" : "#e7f5ff"}
          c={isBlocked ? "#fa5252" : "#228be6"}
          radius="sm"
          size="xs"
          fw={800}
          px={10}
          py={10}
        >
          {status.toUpperCase()}
        </Badge>
        <Menu shadow="md" width={180} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="transparent" c="gray.3">
              <IconDots size={20} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={onMenuClick}>Edit</Menu.Item>
            <Menu.Item onClick={onMenuClick}>Update</Menu.Item>
            <Menu.Item color="red" onClick={onMenuClick}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Title order={4} fw={800} fz="md" mb="xl" style={{ lineHeight: 1.4 }}>
        {title}
      </Title>

      <Group justify="space-between" mb="lg">
        <Group gap="xs">
          <Avatar size="xs" radius="xl" color="blue" />
          <Text fz="xs" fw={700} c="dimmed">
            {owner}
          </Text>
        </Group>
        <Group gap={6}>
          <IconCalendar size={15} color="#94A3B8" />
          <Text fz="xs" fw={700} c="dimmed">
            {date}
          </Text>
        </Group>
      </Group>

      <Stack gap={8}>
        <Group justify="space-between">
          <Text fz={11} fw={700} c="dimmed">
            Progress
          </Text>
          <Text fz={11} fw={800}>
            {progress}%
          </Text>
        </Group>
        <Progress value={progress} color={THEME_BLUE} h={6} radius="xl" />
      </Stack>
    </Card>
  );
}

function EditTaskModal({ opened, onClose, task }: any) {
  if (!task) return null;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={900} fz="xl" c={THEME_BLUE}>
          Edit Task
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
          defaultValue={task.title}
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
            defaultValue="Discovery"
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
            defaultValue={task.date}
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
                  {task.owner}
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
            defaultValue={task.status}
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
              {task.progress}%
            </Badge>
          </Group>
          <Slider
            color={TEAL_BLUE}
            defaultValue={task.progress}
            label={null}
            thumbSize={20}
          />
        </Box>
        <Divider />
        <Group justify="space-between" gap="md" mt="md">
          <Button variant="outline" color="red" fw={700}>
            Delete
          </Button>
          <Group gap="md">
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
              Update
            </Button>
          </Group>
        </Group>
      </Stack>
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
