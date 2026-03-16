import { useEffect, useState } from "react";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { PageHeader } from "@/components";
import { THEME_BLUE, ROUTES } from "@/constants";
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

export default function CommunicationPlanning() {
  const { user } = useAuth();
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
    { title: "Dashboard", href: ROUTES.ADMIN_DASHBOARD },
    { title: "Communication Planning", href: ROUTES.ADMIN_COMMUNICATIONS },
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

        <Paper withBorder radius="md" p="md">
          {loading ? (
            <Text size="sm" c="dimmed">Loading…</Text>
          ) : !selectedInitiativeId ? (
            <Text size="sm" c="dimmed">Select an initiative to view communications.</Text>
          ) : list.length === 0 ? (
            <Text size="sm" c="dimmed">No communications yet. Add one to get started.</Text>
          ) : (
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
          )}
        </Paper>

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
