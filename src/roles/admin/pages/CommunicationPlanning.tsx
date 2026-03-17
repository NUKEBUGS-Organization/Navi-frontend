import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Button,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  ActionIcon,
  Group,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { PageHeader } from "@/components";
import { THEME_BLUE } from "@/constants";
import { useAppRoutes } from "@/hooks/useAppRoutes";
import { listInitiatives } from "@/api/initiatives";
import {
  listCommunications,
  createCommunication,
  updateCommunication,
  deleteCommunication,
  type CommunicationDto,
  type CreateCommunicationPayload,
} from "@/api/communications";
import { useAuth } from "@/contexts/AuthContext";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";

const TYPE_OPTIONS = [
  { value: "Email", label: "Email" },
  { value: "Meeting", label: "Meeting" },
  { value: "Newsletter", label: "Newsletter" },
  { value: "Workshop", label: "Workshop" },
  { value: "Other", label: "Other" },
];
const STATUS_OPTIONS = [
  { value: "Planned", label: "Planned" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Sent", label: "Sent" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString();
}

const GANTT_ROW_HEIGHT = 40;
const GANTT_DAY_WIDTH = 24;
const GANTT_LABEL_WIDTH = 220;

function CommunicationGanttChart({
  list,
  onEdit,
  canEdit,
}: {
  list: CommunicationDto[];
  onEdit: (row: CommunicationDto) => void;
  canEdit: boolean;
}) {
  const { startDate, endDate, scaleDays } = useMemo(() => {
    const dates = list
      .map((c) => c.scheduledDate ? new Date(c.scheduledDate).getTime() : null)
      .filter((t): t is number => t != null);
    const now = Date.now();
    const min = dates.length ? Math.min(...dates) : now - 30 * 24 * 60 * 60 * 1000;
    const max = dates.length ? Math.max(...dates) : now + 60 * 24 * 60 * 60 * 1000;
    const start = new Date(min);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(max);
    end.setMonth(end.getMonth() + 2);
    end.setDate(1);
    end.setHours(0, 0, 0, 0);
    const scaleDays = Math.max(90, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
    return { startDate: start, endDate: end, scaleDays };
  }, [list]);

  const getLeftPercent = (scheduledDate: string | undefined): number => {
    if (!scheduledDate) return 0;
    const t = new Date(scheduledDate).getTime();
    const start = startDate.getTime();
    const end = endDate.getTime();
    return Math.max(0, Math.min(1, (t - start) / (end - start))) * 100;
  };

  const monthLabels: { date: Date; left: number }[] = useMemo(() => {
    const out: { date: Date; left: number }[] = [];
    const d = new Date(startDate);
    const end = endDate.getTime();
    while (d.getTime() < end) {
      const t = d.getTime();
      const left = ((t - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
      out.push({ date: new Date(d), left });
      d.setMonth(d.getMonth() + 1);
    }
    return out;
  }, [startDate, endDate]);

  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => {
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });
  }, [list]);

  if (list.length === 0) return null;

  return (
    <Paper withBorder radius="md" p="md" mb="md">
      <Text fw={700} size="sm" mb="md" c="dark.7">
        Timeline (Gantt)
      </Text>
      <ScrollArea scrollbarSize={8} type="auto" offsetScrollbars>
        <Box style={{ minWidth: GANTT_LABEL_WIDTH + scaleDays * GANTT_DAY_WIDTH }}>
          {/* Month header */}
          <Box style={{ display: "flex", marginLeft: GANTT_LABEL_WIDTH, height: 28, position: "relative", borderBottom: "1px solid #e9ecef" }}>
            {monthLabels.map((m) => (
              <Box
                key={m.date.toISOString()}
                style={{
                  position: "absolute",
                  left: `${m.left}%`,
                  transform: "translateX(-50%)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#868e96",
                  whiteSpace: "nowrap",
                }}
              >
                {m.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </Box>
            ))}
          </Box>
          {/* Rows */}
          {sortedList.map((row) => {
            const hasDate = !!row.scheduledDate;
            const leftPct = getLeftPercent(row.scheduledDate);
            return (
              <Box
                key={row._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: GANTT_ROW_HEIGHT,
                  borderBottom: "1px solid #f1f3f5",
                  cursor: canEdit ? "pointer" : "default",
                }}
                onClick={() => canEdit && onEdit(row)}
              >
                <Box
                  style={{
                    width: GANTT_LABEL_WIDTH,
                    flexShrink: 0,
                    paddingRight: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text size="sm" fw={600} truncate title={row.title}>
                    {row.title}
                  </Text>
                  {row.type && (
                    <Text size="xs" c="dimmed">
                      {row.type}
                    </Text>
                  )}
                </Box>
                <Box
                  style={{
                    flex: 1,
                    position: "relative",
                    height: GANTT_ROW_HEIGHT - 8,
                    minHeight: 24,
                  }}
                >
                  {/* Grid line for day boundaries not drawn - just the bar */}
                  {hasDate && (
                    <Box
                      style={{
                        position: "absolute",
                        left: `${leftPct}%`,
                        top: 4,
                        width: "4%",
                        minWidth: 48,
                        height: GANTT_ROW_HEIGHT - 16,
                        borderRadius: 4,
                        backgroundColor: THEME_BLUE,
                        opacity: 0.9,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                      title={`${row.title} – ${formatDate(row.scheduledDate)} ${row.status ?? ""}`}
                    />
                  )}
                  {!hasDate && (
                    <Text size="xs" c="dimmed" style={{ position: "absolute", left: 0, top: 10 }}>
                      No date
                    </Text>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </ScrollArea>
    </Paper>
  );
}

export default function CommunicationPlanning() {
  const { user } = useAuth();
  const appRoutes = useAppRoutes();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [initiatives, setInitiatives] = useState<{ id: string; title: string }[]>([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [list, setList] = useState<CommunicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editing, setEditing] = useState<CommunicationDto | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<string | null>("Email");
  const [formAudience, setFormAudience] = useState("");
  const [formScheduledDate, setFormScheduledDate] = useState<Date | null>(null);
  const [formStatus, setFormStatus] = useState<string | null>("Planned");
  const [formMessage, setFormMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CommunicationDto | null>(null);

  useEffect(() => {
    listInitiatives()
      .then((data) => {
        setInitiatives(data.map((i) => ({ id: i.id, title: i.title })));
        if (data.length > 0 && !selectedInitiativeId) setSelectedInitiativeId(data[0].id);
      })
      .catch(() => []);
  }, []);

  useEffect(() => {
    if (!selectedInitiativeId) {
      setList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listCommunications(selectedInitiativeId)
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [selectedInitiativeId]);

  const resetForm = () => {
    setEditing(null);
    setFormTitle("");
    setFormType("Email");
    setFormAudience("");
    setFormScheduledDate(null);
    setFormStatus("Planned");
    setFormMessage("");
  };

  const openCreate = () => {
    resetForm();
    openModal();
  };

  const openEdit = (row: CommunicationDto) => {
    setEditing(row);
    setFormTitle(row.title);
    setFormType(row.type ?? "Email");
    setFormAudience(row.audience ?? "");
    setFormScheduledDate(row.scheduledDate ? new Date(row.scheduledDate) : null);
    setFormStatus(row.status ?? "Planned");
    setFormMessage(row.message ?? "");
    openModal();
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !selectedInitiativeId) return;
    setSaving(true);
    try {
      const scheduledStr = formScheduledDate ? formScheduledDate.toISOString().slice(0, 10) : undefined;
      if (editing) {
        await updateCommunication(editing._id, {
          title: formTitle.trim(),
          type: formType ?? undefined,
          audience: formAudience.trim() || undefined,
          scheduledDate: scheduledStr,
          status: formStatus ?? undefined,
          message: formMessage.trim() || undefined,
        });
      } else {
        const payload: CreateCommunicationPayload = {
          initiativeId: selectedInitiativeId,
          title: formTitle.trim(),
          type: formType ?? undefined,
          audience: formAudience.trim() || undefined,
          scheduledDate: scheduledStr,
          status: formStatus ?? undefined,
          message: formMessage.trim() || undefined,
        };
        await createCommunication(payload);
      }
      closeModal();
      resetForm();
      if (selectedInitiativeId) listCommunications(selectedInitiativeId).then((d) => setList(Array.isArray(d) ? d : []));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: CommunicationDto) => {
    try {
      await deleteCommunication(row._id);
      setDeleteConfirm(null);
      if (selectedInitiativeId) listCommunications(selectedInitiativeId).then((d) => setList(Array.isArray(d) ? d : []));
    } catch {
      setDeleteConfirm(null);
    }
  };

  const breadcrumbs = [
    { title: "Dashboard", href: appRoutes.DASHBOARD },
    { title: "Communication Planning", href: appRoutes.COMMUNICATIONS },
  ];

  return (
    <AdminLayout>
      <Box style={{ width: "100%" }}>
        <PageHeader
          title="Communication Planning"
          subtitle="Plan and track communications by initiative"
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
              {canEdit && (
                <Button
                  leftSection={<IconPlus size={18} />}
                  bg={THEME_BLUE}
                  radius="md"
                  onClick={openCreate}
                  disabled={!selectedInitiativeId}
                >
                  Add Communication
                </Button>
              )}
            </Group>
          }
        />

        {loading ? (
          <Paper withBorder radius="md" p="md">
            <Text size="sm" c="dimmed">Loading…</Text>
          </Paper>
        ) : !selectedInitiativeId ? (
          <Paper withBorder radius="md" p="md">
            <Text size="sm" c="dimmed">Select an initiative to view communications.</Text>
          </Paper>
        ) : (
          <>
            {list.length > 0 && (
              <CommunicationGanttChart list={list} onEdit={openEdit} canEdit={!!canEdit} />
            )}
            <Paper withBorder radius="md" p="md">
              {list.length === 0 ? (
                <Text size="sm" c="dimmed">No communications yet. Add one to get started.</Text>
              ) : (
                <>
                  <Text fw={700} size="sm" mb="md" c="dark.7">
                    Table
                  </Text>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Title</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Audience</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Status</Table.Th>
                        {canEdit && <Table.Th w={80}></Table.Th>}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {list.map((row) => (
                        <Table.Tr key={row._id}>
                          <Table.Td fw={600}>{row.title}</Table.Td>
                          <Table.Td>{row.type ?? "—"}</Table.Td>
                          <Table.Td>{row.audience ?? "—"}</Table.Td>
                          <Table.Td>{formatDate(row.scheduledDate)}</Table.Td>
                          <Table.Td>{row.status ?? "—"}</Table.Td>
                          {canEdit && (
                            <Table.Td>
                              <Group gap="xs">
                                <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(row)}>
                                  <IconPencil size={16} />
                                </ActionIcon>
                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setDeleteConfirm(row)}>
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Table.Td>
                          )}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </>
              )}
            </Paper>
          </>
        )}

        <Modal opened={modalOpen} onClose={() => { closeModal(); resetForm(); }} title={editing ? "Edit Communication" : "Add Communication"} centered size="md">
          <Stack gap="md">
            <TextInput label="Title" value={formTitle} onChange={(e) => setFormTitle(e.currentTarget.value)} required placeholder="e.g. Kick-off email" />
            <Select label="Type" data={TYPE_OPTIONS} value={formType} onChange={setFormType} />
            <TextInput label="Audience" value={formAudience} onChange={(e) => setFormAudience(e.currentTarget.value)} placeholder="e.g. All staff" />
            <DateInput
              label="Scheduled date"
              value={formScheduledDate}
              onChange={(v: Date | string | null) => setFormScheduledDate(v == null ? null : v instanceof Date ? v : new Date(v))}
              placeholder="Pick date"
              popoverProps={{ withinPortal: true, zIndex: 10000 }}
              clearable
            />
            <Select label="Status" data={STATUS_OPTIONS} value={formStatus} onChange={setFormStatus} />
            <Textarea label="Message / Notes" value={formMessage} onChange={(e) => setFormMessage(e.currentTarget.value)} placeholder="Content or notes" minRows={2} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => { closeModal(); resetForm(); }}>Cancel</Button>
              <Button bg={THEME_BLUE} onClick={handleSave} loading={saving} disabled={!formTitle.trim()}>Save</Button>
            </Group>
          </Stack>
        </Modal>

        <Modal opened={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete communication?">
          <Text size="sm" mb="md">This cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button color="red" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </Group>
        </Modal>
      </Box>
    </AdminLayout>
  );
}
