import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  Slider,
  SimpleGrid,
  Menu,
} from "@mantine/core";
import type { ReactNode } from "react";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
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
import { THEME_BLUE, TEAL_BLUE, ROUTES } from "@/constants";
import { PageHeader } from "@/components";
import { TaskCard } from "@/components/roadmap/TaskCard";
import type { Task } from "@/types";
import { listInitiatives } from "@/api/initiatives";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listTaskComments,
  createTaskComment,
  type TaskDto,
  type TaskPhase,
  type TaskCommentDto,
} from "@/api/tasks";
import { listOrganizationUsers } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

const PHASES: TaskPhase[] = ["Discovery", "Awareness", "Alignment", "Implementation", "Adoption", "Reinforcement"];

function formatTaskDate(d: string | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminRoadmap() {
  const { user } = useAuth();
  const location = useLocation();
  const stateInitiativeId =
    location?.state && typeof location.state === "object" && "initiativeId" in location.state
      ? (location.state as { initiativeId: string }).initiativeId
      : undefined;
  const isEmployee = user?.role === "employee";
  const currentUserId = user?._id ?? "";
  const [opened, { open, close }] = useDisclosure(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initiatives, setInitiatives] = useState<{ id: string; title: string }[]>([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [tasksRaw, setTasksRaw] = useState<TaskDto[]>([]);
  const [users, setUsers] = useState<{ _id: string; name: string; departments?: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listInitiatives()
      .then((list) => {
        setInitiatives(list.map((i) => ({ id: i.id, title: i.title })));
        const toSelect =
          stateInitiativeId && list.some((i) => i.id === stateInitiativeId)
            ? stateInitiativeId
            : list.length > 0
              ? list[0].id
              : null;
        setSelectedInitiativeId((prev) => prev ?? toSelect);
      })
      .catch(() => []);
  }, [stateInitiativeId]);

  useEffect(() => {
    listOrganizationUsers()
      .then((list) =>
        setUsers(list.map((u) => ({ _id: u._id, name: u.name, departments: u.departments })))
      )
      .catch(() => []);
  }, []);

  useEffect(() => {
    if (!selectedInitiativeId) {
      setTasksRaw([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listTasks(selectedInitiativeId)
      .then((list) => setTasksRaw(Array.isArray(list) ? list : []))
      .catch(() => setTasksRaw([]))
      .finally(() => setLoading(false));
  }, [selectedInitiativeId]);

  const userById: Record<string, string> = {};
  users.forEach((u) => { userById[String(u._id)] = u.name; });

  const tasks: Task[] = tasksRaw.map((t) => ({
    id: t._id,
    _id: t._id,
    initiativeId: t.initiativeId,
    assigneeId: t.assigneeId,
    status: t.status as Task["status"],
    title: t.title,
    owner: t.assigneeName ?? userById[String(t.assigneeId ?? "")] ?? (t.assigneeId != null ? String(t.assigneeId) : "—"),
    date: formatTaskDate(t.dueDate),
    dueDate: t.dueDate,
    progress: t.progress ?? 0,
    isBlocked: t.isBlocked,
    phase: t.phase,
    description: t.description,
  }));

  const selectedInitiative = initiatives.find((i) => i.id === selectedInitiativeId);

  const myDepts = new Set((user?.departments ?? []).map((d) => String(d).toLowerCase()));
  const assigneeIdsInMyDept = new Set(
    users
      .filter(
        (u) =>
          u._id !== currentUserId &&
          u.departments?.some((d) => myDepts.has(String(d).toLowerCase()))
      )
      .map((u) => u._id)
  );
  const tasksForView =
    isEmployee
      ? tasks.filter((t) => String(t.assigneeId ?? t.id) === currentUserId)
      : user?.role === "manager"
        ? tasks.filter(
            (t) =>
              String(t.assigneeId ?? t.id) === currentUserId ||
              assigneeIdsInMyDept.has(String(t.assigneeId ?? ""))
          )
        : tasks;
  const breadcrumbs = [
    { title: "Initiatives", href: ROUTES.ADMIN_INITIATIVES },
    { title: selectedInitiative?.title ?? "Roadmap", href: "#" },
    { title: "Roadmap", href: "#" },
  ];

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedTask(null);
  };

  const refetchTasks = () => {
    if (selectedInitiativeId) {
      listTasks(selectedInitiativeId).then((list) => setTasksRaw(Array.isArray(list) ? list : [])).catch(() => {});
    }
  };

  return (
    <AdminLayout>
      <>
        <Box style={{ width: "100%" }}>
          <PageHeader
            title="Change Roadmap"
            breadcrumbs={breadcrumbs}
            actions={
              <Group>
                <Select
                  placeholder="Select initiative"
                  data={initiatives.map((i) => ({ value: i.id, label: i.title }))}
                  value={selectedInitiativeId ?? undefined}
                  onChange={(v) => setSelectedInitiativeId(v ?? null)}
                  size="sm"
                  w={220}
                  radius="md"
                />
                {!isEmployee && (
                  <Button
                    leftSection={<IconPlus size={20} />}
                    bg={THEME_BLUE}
                    radius="md"
                    h={45}
                    px={30}
                    fw={700}
                    onClick={open}
                    disabled={!selectedInitiativeId}
                  >
                    Add Task
                  </Button>
                )}
              </Group>
            }
          />
          {(isEmployee || user?.role === "manager") && (
            <Text size="xs" c="dimmed" mb="xs">
              Showing tasks relevant to your role and department.
            </Text>
          )}

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
                  {loading ? (
                    <Text size="sm" c="dimmed">Loading tasks…</Text>
                  ) : (
                  <SimpleGrid
                    cols={{ base: 1, sm: 2, lg: 3 }}
                    spacing={40}
                    verticalSpacing={50}
                  >
                    {PHASES.map((phase) => {
                      const phaseTasks = tasksForView.filter((t) => (t.phase ?? "Discovery") === phase);
                      const progress = phaseTasks.length
                        ? Math.round(phaseTasks.reduce((s, t) => s + t.progress, 0) / phaseTasks.length)
                        : 0;
                      return (
                        <KanbanColumn
                          key={phase}
                          title={phase.toUpperCase()}
                          count={phaseTasks.length}
                          progress={progress}
                          color="#00a99d"
                        >
                          {phaseTasks.map((task) => (
                            <TaskCard
                              key={String(task.id)}
                              {...task}
                              onMenuClick={() => handleEditTask(task)}
                            />
                          ))}
                          {phaseTasks.length === 0 && (
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
                                  No tasks in this phase
                                </Text>
                              </Stack>
                            </Card>
                          )}
                        </KanbanColumn>
                      );
                    })}
                  </SimpleGrid>
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="list" pt="xl">
                  {loading ? (
                    <Text size="sm" c="dimmed">Loading tasks…</Text>
                  ) : tasksForView.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      {isEmployee ? "No tasks assigned to you for this initiative." : "No tasks yet. Select an initiative and add a task."}
                    </Text>
                  ) : (
                <Stack gap="sm">
                    {tasksForView.map((task) => (
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
                )}
                </Tabs.Panel>

                <Tabs.Panel value="timeline" pt="xl">
                  {loading ? (
                    <Text size="sm" c="dimmed">Loading tasks…</Text>
                  ) : tasksForView.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      {isEmployee ? "No tasks assigned to you." : "No tasks yet."}
                    </Text>
                  ) : (
                  <Stack gap="md">
                    {tasksForView.map((task) => (
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
                  )}
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
        <CreateTaskModal
          opened={opened}
          onClose={close}
          initiativeId={selectedInitiativeId}
          users={users}
          onCreated={refetchTasks}
        />
        <EditTaskModal
          opened={editModalOpen}
          onClose={handleCloseEditModal}
          task={selectedTask}
          userById={userById}
          canDelete={!isEmployee}
          onSaved={refetchTasks}
          onDeleted={() => { handleCloseEditModal(); refetchTasks(); }}
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

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`;
  return d.toLocaleDateString();
}

interface EditTaskModalProps {
  opened: boolean;
  onClose: () => void;
  task: Task | null;
  userById: Record<string, string>;
  canDelete?: boolean;
  onSaved?: () => void;
  onDeleted?: () => void;
}

function statusFromProgress(progress: number): "Not Started" | "In Progress" | "Completed" {
  if (progress >= 100) return "Completed";
  if (progress > 0) return "In Progress";
  return "Not Started";
}

function EditTaskModal({ opened, onClose, task, userById, canDelete = true, onSaved, onDeleted }: EditTaskModalProps) {
  const taskId = task ? (task._id ?? String(task.id)) : "";
  const [progress, setProgress] = useState(task?.progress ?? 0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState<TaskCommentDto[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    if (task) setProgress(task.progress ?? 0);
  }, [task]);

  useEffect(() => {
    if (!opened || !taskId) {
      setComments([]);
      return;
    }
    setCommentsLoading(true);
    listTaskComments(taskId)
      .then((list) => setComments(Array.isArray(list) ? list : []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [opened, taskId]);

  const handleSave = async () => {
    if (!taskId) return;
    setSaving(true);
    try {
      await updateTask(taskId, { progress });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId || !window.confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await deleteTask(taskId);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!taskId || !content) return;
    setCommentSubmitting(true);
    try {
      await createTaskComment(taskId, content);
      setNewComment("");
      const list = await listTaskComments(taskId);
      setComments(Array.isArray(list) ? list : []);
    } finally {
      setCommentSubmitting(false);
    }
  };

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
                <Text fz="xs" fw={700} c="dimmed">
                  Status: {statusFromProgress(progress)}
                </Text>
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
                      {task.phase ?? "Discovery"}
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
                        <Slider
                          value={progress}
                          onChange={setProgress}
                          color={THEME_BLUE}
                          size="sm"
                          label={null}
                        />
                      </Box>
                      <Text fz="sm" fw={700}>
                        {progress}%
                      </Text>
                    </Group>
                  </Box>
                </SimpleGrid>
              </Box>

              <Box>
                <Text fz="xs" fw={700} c="dimmed" mb={6}>
                  DESCRIPTION
                </Text>
                <Text fz="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                  {task.description?.trim() || "No description."}
                </Text>
              </Box>

              <Box>
                <Text fz="xs" fw={700} c="dimmed" mb={8}>
                  PROGRESS LOG (COMMENTS)
                </Text>
                <Stack gap="md">
                  {commentsLoading ? (
                    <Text fz="sm" c="dimmed">
                      Loading comments…
                    </Text>
                  ) : comments.length === 0 ? (
                    <Text fz="sm" c="dimmed">
                      No comments yet. Add a comment to log progress.
                    </Text>
                  ) : (
                    comments.map((c) => (
                      <Group key={c._id} align="flex-start" gap="sm">
                        <Avatar size="sm" radius="xl" color="blue" />
                        <Box style={{ flex: 1 }}>
                          <Text fz="sm" fw={600}>
                            {userById[String(c.userId ?? "")] ?? "Unknown"}
                          </Text>
                          <Text fz="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                            {c.content}
                          </Text>
                          <Text fz="xs" c="dimmed" mt={4}>
                            {formatRelativeTime(c.createdAt)}
                          </Text>
                        </Box>
                      </Group>
                    ))
                  )}
                  <Box>
                    <Text fz="xs" c="dimmed" mb={4}>
                      Add a comment (admins can see progress logs)
                    </Text>
                    <Group gap="xs">
                      <TextInput
                        placeholder="Add a comment..."
                        radius="xl"
                        size="sm"
                        style={{ flex: 1 }}
                        value={newComment}
                        onChange={(e) => setNewComment(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                      />
                      <Button
                        radius="xl"
                        size="sm"
                        bg={THEME_BLUE}
                        px="md"
                        onClick={handleAddComment}
                        loading={commentSubmitting}
                        disabled={!newComment.trim()}
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
            {canDelete && (
              <Button variant="subtle" color="red" fw={700} onClick={handleDelete} loading={deleting}>
                Delete Task
              </Button>
            )}
            <Button
              bg={THEME_BLUE}
              radius="md"
              fw={700}
              px={30}
              h={40}
              onClick={handleSave}
              loading={saving}
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
  initiativeId,
  users,
  onCreated,
}: {
  opened: boolean;
  onClose: () => void;
  initiativeId: string | null;
  users: { _id: string; name: string }[];
  onCreated: () => void;
}) {
  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      phase: "Discovery" as TaskPhase,
      dueDate: "" as string | Date | null,
      assigneeId: "",
      progress: 0,
    },
    validate: { title: (v) => (!v?.trim() ? "Title is required" : null), assigneeId: (v) => (!v ? "Owner is required" : null) },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!initiativeId) return;
    try {
      await createTask({
        initiativeId,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        phase: values.phase,
        dueDate: values.dueDate ? (typeof values.dueDate === "string" ? values.dueDate : (values.dueDate as Date).toISOString().slice(0, 10)) : undefined,
        assigneeId: values.assigneeId,
        progress: values.progress,
      });
      onCreated();
      form.reset();
      onClose();
    } catch {
      // keep modal open
    }
  });

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
      <form onSubmit={handleSubmit}>
        <Stack gap="xl">
          <TextInput
            label={<Text fw={700} fz="sm" mb={5}>Task Title</Text>}
            placeholder="e.g., Define target audience personas"
            radius="md"
            size="md"
            {...form.getInputProps("title")}
          />
          <Textarea
            label={<Text fw={700} fz="sm" mb={5}>Description</Text>}
            placeholder="Describe the task details..."
            minRows={4}
            radius="md"
            size="md"
            {...form.getInputProps("description")}
          />
          <SimpleGrid cols={2}>
            <Select
              label={<Text fw={700} fz="sm" mb={5}>Phase</Text>}
              data={["Discovery", "Awareness", "Alignment", "Implementation", "Adoption", "Reinforcement"]}
              radius="md"
              size="md"
              rightSection={<IconChevronDown size={18} />}
              {...form.getInputProps("phase")}
            />
            <DateInput
              label={<Text fw={700} fz="sm" mb={5}>Due Date</Text>}
              placeholder="Pick date"
              radius="md"
              size="md"
              valueFormat="YYYY-MM-DD"
              popoverProps={{ withinPortal: true, zIndex: 10000 }}
              clearable
              {...form.getInputProps("dueDate")}
            />
          </SimpleGrid>
          <Select
            label={<Text fw={700} fz="sm" mb={5}>Task Owner</Text>}
            placeholder="Select member"
            data={users.map((u) => ({ value: u._id, label: u.name }))}
            radius="md"
            size="md"
            {...form.getInputProps("assigneeId")}
          />
          <Box>
            <Group justify="space-between" mb={8}>
              <Text fw={700} fz="sm">Progress</Text>
              <Badge variant="light" color="teal" radius="sm" fw={800}>{form.values.progress}%</Badge>
            </Group>
            <Slider
              color={TEAL_BLUE}
              value={form.values.progress}
              onChange={(v) => form.setFieldValue("progress", v)}
              label={null}
              thumbSize={20}
            />
          </Box>
          <Divider />
          <Group justify="flex-end" gap="md" mt="md">
            <Button type="button" variant="transparent" c="gray.6" fw={700} onClick={onClose}>Cancel</Button>
            <Button type="submit" bg={TEAL_BLUE} radius="md" px={30} h={45} fw={700} leftSection={<IconRocket size={18} />}>
              Save Task
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
