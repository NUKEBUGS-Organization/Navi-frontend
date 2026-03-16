import { useEffect, useState } from "react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PageHeader } from "@/components";
import { THEME_BLUE, ROUTES } from "@/constants";
import { listInitiatives } from "@/api/initiatives";
import {
  listStakeholders,
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
  type StakeholderDto,
  type CreateStakeholderPayload,
} from "@/api/stakeholders";
import { useAuth } from "@/contexts/AuthContext";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";

const INFLUENCE_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];
const SUPPORT_OPTIONS = [
  { value: "Champion", label: "Champion" },
  { value: "Supporter", label: "Supporter" },
  { value: "Neutral", label: "Neutral" },
  { value: "Resistant", label: "Resistant" },
];

export default function StakeholderMapping() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [initiatives, setInitiatives] = useState<{ id: string; title: string }[]>([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [list, setList] = useState<StakeholderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editing, setEditing] = useState<StakeholderDto | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formInfluence, setFormInfluence] = useState<string | null>("Medium");
  const [formSupport, setFormSupport] = useState<string | null>("Neutral");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<StakeholderDto | null>(null);

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
    listStakeholders(selectedInitiativeId)
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [selectedInitiativeId]);

  const resetForm = () => {
    setEditing(null);
    setFormName("");
    setFormRole("");
    setFormInfluence("Medium");
    setFormSupport("Neutral");
    setFormNotes("");
  };

  const openCreate = () => {
    resetForm();
    openModal();
  };

  const openEdit = (row: StakeholderDto) => {
    setEditing(row);
    setFormName(row.name);
    setFormRole(row.role ?? "");
    setFormInfluence(row.influence ?? "Medium");
    setFormSupport(row.support ?? "Neutral");
    setFormNotes(row.notes ?? "");
    openModal();
  };

  const handleSave = async () => {
    if (!formName.trim() || !selectedInitiativeId) return;
    setSaving(true);
    try {
      if (editing) {
        await updateStakeholder(editing._id, {
          name: formName.trim(),
          role: formRole.trim() || undefined,
          influence: formInfluence ?? undefined,
          support: formSupport ?? undefined,
          notes: formNotes.trim() || undefined,
        });
      } else {
        const payload: CreateStakeholderPayload = {
          initiativeId: selectedInitiativeId,
          name: formName.trim(),
          role: formRole.trim() || undefined,
          influence: formInfluence ?? undefined,
          support: formSupport ?? undefined,
          notes: formNotes.trim() || undefined,
        };
        await createStakeholder(payload);
      }
      closeModal();
      resetForm();
      if (selectedInitiativeId) listStakeholders(selectedInitiativeId).then((d) => setList(Array.isArray(d) ? d : []));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: StakeholderDto) => {
    try {
      await deleteStakeholder(row._id);
      setDeleteConfirm(null);
      if (selectedInitiativeId) listStakeholders(selectedInitiativeId).then((d) => setList(Array.isArray(d) ? d : []));
    } catch {
      setDeleteConfirm(null);
    }
  };

  const breadcrumbs = [
    { title: "Dashboard", href: ROUTES.ADMIN_DASHBOARD },
    { title: "Stakeholder Mapping", href: ROUTES.ADMIN_STAKEHOLDERS },
  ];

  return (
    <AdminLayout>
      <Box style={{ width: "100%" }}>
        <PageHeader
          title="Stakeholder Mapping"
          subtitle="Map and track key stakeholders by initiative"
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
                  Add Stakeholder
                </Button>
              )}
            </Group>
          }
        />

        <Paper withBorder radius="md" p="md">
          {loading ? (
            <Text size="sm" c="dimmed">Loading…</Text>
          ) : !selectedInitiativeId ? (
            <Text size="sm" c="dimmed">Select an initiative to view stakeholders.</Text>
          ) : list.length === 0 ? (
            <Text size="sm" c="dimmed">No stakeholders yet. Add one to get started.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Influence</Table.Th>
                  <Table.Th>Support</Table.Th>
                  <Table.Th>Notes</Table.Th>
                  {canEdit && <Table.Th w={80}></Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {list.map((row) => (
                  <Table.Tr key={row._id}>
                    <Table.Td fw={600}>{row.name}</Table.Td>
                    <Table.Td>{row.role ?? "—"}</Table.Td>
                    <Table.Td>{row.influence ?? "—"}</Table.Td>
                    <Table.Td>{row.support ?? "—"}</Table.Td>
                    <Table.Td style={{ maxWidth: 200 }}>{row.notes ? `${row.notes.slice(0, 60)}${row.notes.length > 60 ? "…" : ""}` : "—"}</Table.Td>
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

        <Modal opened={modalOpen} onClose={() => { closeModal(); resetForm(); }} title={editing ? "Edit Stakeholder" : "Add Stakeholder"} centered>
          <Stack gap="md">
            <TextInput label="Name" value={formName} onChange={(e) => setFormName(e.currentTarget.value)} required placeholder="Stakeholder name" />
            <TextInput label="Role / Title" value={formRole} onChange={(e) => setFormRole(e.currentTarget.value)} placeholder="e.g. VP Engineering" />
            <Select label="Influence" data={INFLUENCE_OPTIONS} value={formInfluence} onChange={setFormInfluence} />
            <Select label="Support Level" data={SUPPORT_OPTIONS} value={formSupport} onChange={setFormSupport} />
            <Textarea label="Notes" value={formNotes} onChange={(e) => setFormNotes(e.currentTarget.value)} placeholder="Notes" minRows={2} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => { closeModal(); resetForm(); }}>Cancel</Button>
              <Button bg={THEME_BLUE} onClick={handleSave} loading={saving} disabled={!formName.trim()}>Save</Button>
            </Group>
          </Stack>
        </Modal>

        <Modal opened={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete stakeholder?">
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
