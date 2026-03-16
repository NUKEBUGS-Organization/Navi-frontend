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
  Progress,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { PageHeader } from "@/components";
import { THEME_BLUE, ROUTES } from "@/constants";
import { listInitiatives } from "@/api/initiatives";
import {
  listAdoption,
  createAdoption,
  updateAdoption,
  deleteAdoption,
  type AdoptionDto,
  type CreateAdoptionPayload,
} from "@/api/adoption";
import { useAuth } from "@/contexts/AuthContext";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";

const STATUS_OPTIONS = [
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Achieved", label: "Achieved" },
  { value: "At Risk", label: "At Risk" },
];

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString();
}

export default function AdoptionTracking() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [initiatives, setInitiatives] = useState<{ id: string; title: string }[]>([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [list, setList] = useState<AdoptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editing, setEditing] = useState<AdoptionDto | null>(null);
  const [formMilestone, setFormMilestone] = useState("");
  const [formTargetDate, setFormTargetDate] = useState<Date | null>(null);
  const [formStatus, setFormStatus] = useState<string | null>("Not Started");
  const [formPercent, setFormPercent] = useState<number>(0);
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AdoptionDto | null>(null);

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
    listAdoption(selectedInitiativeId)
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [selectedInitiativeId]);

  const resetForm = () => {
    setEditing(null);
    setFormMilestone("");
    setFormTargetDate(null);
    setFormStatus("Not Started");
    setFormPercent(0);
    setFormNotes("");
  };

  const openCreate = () => {
    resetForm();
    openModal();
  };

  const openEdit = (row: AdoptionDto) => {
    setEditing(row);
    setFormMilestone(row.milestone);
    setFormTargetDate(row.targetDate ? new Date(row.targetDate) : null);
    setFormStatus(row.status ?? "Not Started");
    setFormPercent(row.percentAdopted ?? 0);
    setFormNotes(row.notes ?? "");
    openModal();
  };

  const handleSave = async () => {
    if (!formMilestone.trim() || !selectedInitiativeId) return;
    setSaving(true);
    try {
      const targetStr = formTargetDate ? formTargetDate.toISOString().slice(0, 10) : undefined;
      if (editing) {
        await updateAdoption(editing._id, {
          milestone: formMilestone.trim(),
          targetDate: targetStr,
          status: formStatus ?? undefined,
          percentAdopted: formPercent,
          notes: formNotes.trim() || undefined,
        });
      } else {
        const payload: CreateAdoptionPayload = {
          initiativeId: selectedInitiativeId,
          milestone: formMilestone.trim(),
          targetDate: targetStr,
          status: formStatus ?? undefined,
          percentAdopted: formPercent,
          notes: formNotes.trim() || undefined,
        };
        await createAdoption(payload);
      }
      closeModal();
      resetForm();
      if (selectedInitiativeId) listAdoption(selectedInitiativeId).then((d) => setList(Array.isArray(d) ? d : []));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: AdoptionDto) => {
    try {
      await deleteAdoption(row._id);
      setDeleteConfirm(null);
      if (selectedInitiativeId) listAdoption(selectedInitiativeId).then((d) => setList(Array.isArray(d) ? d : []));
    } catch {
      setDeleteConfirm(null);
    }
  };

  const breadcrumbs = [
    { title: "Dashboard", href: ROUTES.ADMIN_DASHBOARD },
    { title: "Adoption Tracking", href: ROUTES.ADMIN_ADOPTION },
  ];

  return (
    <AdminLayout>
      <Box style={{ width: "100%" }}>
        <PageHeader
          title="Adoption Tracking"
          subtitle="Track adoption milestones by initiative"
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
                  Add Milestone
                </Button>
              )}
            </Group>
          }
        />

        <Paper withBorder radius="md" p="md">
          {loading ? (
            <Text size="sm" c="dimmed">Loading…</Text>
          ) : !selectedInitiativeId ? (
            <Text size="sm" c="dimmed">Select an initiative to view adoption milestones.</Text>
          ) : list.length === 0 ? (
            <Text size="sm" c="dimmed">No adoption milestones yet. Add one to get started.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Milestone</Table.Th>
                  <Table.Th>Target Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>% Adopted</Table.Th>
                  <Table.Th>Notes</Table.Th>
                  {canEdit && <Table.Th w={80}></Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {list.map((row) => (
                  <Table.Tr key={row._id}>
                    <Table.Td fw={600}>{row.milestone}</Table.Td>
                    <Table.Td>{formatDate(row.targetDate)}</Table.Td>
                    <Table.Td>{row.status ?? "—"}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Progress value={row.percentAdopted ?? 0} size="sm" w={60} radius="xl" />
                        <Text size="sm">{row.percentAdopted ?? 0}%</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td style={{ maxWidth: 180 }}>{row.notes ? `${row.notes.slice(0, 40)}${row.notes.length > 40 ? "…" : ""}` : "—"}</Table.Td>
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

        <Modal opened={modalOpen} onClose={() => { closeModal(); resetForm(); }} title={editing ? "Edit Milestone" : "Add Milestone"} centered>
          <Stack gap="md">
            <TextInput label="Milestone" value={formMilestone} onChange={(e) => setFormMilestone(e.currentTarget.value)} required placeholder="e.g. 50% training complete" />
            <DateInput
              label="Target date"
              value={formTargetDate}
              onChange={(v: Date | string | null) => setFormTargetDate(v == null ? null : v instanceof Date ? v : new Date(v))}
              placeholder="Pick date"
              popoverProps={{ withinPortal: true, zIndex: 10000 }}
              clearable
            />
            <Select label="Status" data={STATUS_OPTIONS} value={formStatus} onChange={setFormStatus} />
            <TextInput type="number" label="% Adopted" min={0} max={100} value={String(formPercent)} onChange={(e) => setFormPercent(Math.min(100, Math.max(0, Number(e.currentTarget.value) || 0)))} />
            <Textarea label="Notes" value={formNotes} onChange={(e) => setFormNotes(e.currentTarget.value)} placeholder="Notes" minRows={2} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => { closeModal(); resetForm(); }}>Cancel</Button>
              <Button bg={THEME_BLUE} onClick={handleSave} loading={saving} disabled={!formMilestone.trim()}>Save</Button>
            </Group>
          </Stack>
        </Modal>

        <Modal opened={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete milestone?">
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
