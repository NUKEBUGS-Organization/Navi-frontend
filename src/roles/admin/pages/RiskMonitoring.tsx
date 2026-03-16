import { useEffect, useState } from "react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Button,
  Card,
  Grid,
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
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PageHeader } from "@/components";
import { THEME_BLUE, ROUTES } from "@/constants";
import { listInitiatives } from "@/api/initiatives";
import {
  listRisks,
  getRiskSummary,
  createRisk,
  updateRisk,
  deleteRisk,
  type RiskDto,
  type CreateRiskPayload,
  type RiskSummary,
} from "@/api/risks";
import { useAuth } from "@/contexts/AuthContext";
import { IconPlus, IconPencil, IconTrash, IconAlertTriangle } from "@tabler/icons-react";

const SEVERITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];
const STATUS_OPTIONS = [
  { value: "Open", label: "Open" },
  { value: "Mitigating", label: "Mitigating" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];

function severityColor(s: string): string {
  if (s === "Critical") return "red";
  if (s === "High") return "orange";
  if (s === "Medium") return "yellow";
  return "gray";
}

export default function RiskMonitoring() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [initiatives, setInitiatives] = useState<{ id: string; title: string }[]>([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [list, setList] = useState<RiskDto[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editing, setEditing] = useState<RiskDto | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSeverity, setFormSeverity] = useState<string | null>("Medium");
  const [formStatus, setFormStatus] = useState<string | null>("Open");
  const [formMitigation, setFormMitigation] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<RiskDto | null>(null);

  const loadList = () => {
    if (!selectedInitiativeId) {
      setList([]);
      return;
    }
    listRisks(selectedInitiativeId)
      .then((d) => setList(Array.isArray(d) ? d : []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    listInitiatives()
      .then((data) => {
        setInitiatives(data.map((i) => ({ id: i.id, title: i.title })));
        if (data.length > 0 && !selectedInitiativeId) setSelectedInitiativeId(data[0].id);
      })
      .catch(() => []);
    getRiskSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    if (!selectedInitiativeId) {
      setList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadList();
    getRiskSummary().then(setSummary).catch(() => {});
    setLoading(false);
  }, [selectedInitiativeId]);

  const resetForm = () => {
    setEditing(null);
    setFormTitle("");
    setFormDescription("");
    setFormSeverity("Medium");
    setFormStatus("Open");
    setFormMitigation("");
  };

  const openCreate = () => {
    resetForm();
    openModal();
  };

  const openEdit = (row: RiskDto) => {
    setEditing(row);
    setFormTitle(row.title);
    setFormDescription(row.description ?? "");
    setFormSeverity(row.severity ?? "Medium");
    setFormStatus(row.status ?? "Open");
    setFormMitigation(row.mitigationNotes ?? "");
    openModal();
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !selectedInitiativeId) return;
    setSaving(true);
    try {
      if (editing) {
        await updateRisk(editing._id, {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          severity: formSeverity ?? undefined,
          status: formStatus ?? undefined,
          mitigationNotes: formMitigation.trim() || undefined,
        });
      } else {
        const payload: CreateRiskPayload = {
          initiativeId: selectedInitiativeId,
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          severity: formSeverity ?? undefined,
          status: formStatus ?? undefined,
          mitigationNotes: formMitigation.trim() || undefined,
        };
        await createRisk(payload);
      }
      closeModal();
      resetForm();
      loadList();
      getRiskSummary().then(setSummary).catch(() => {});
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: RiskDto) => {
    try {
      await deleteRisk(row._id);
      setDeleteConfirm(null);
      loadList();
      getRiskSummary().then(setSummary).catch(() => {});
    } catch {
      setDeleteConfirm(null);
    }
  };

  const breadcrumbs = [
    { title: "Dashboard", href: ROUTES.ADMIN_DASHBOARD },
    { title: "Risk Monitoring", href: ROUTES.ADMIN_RISKS },
  ];

  return (
    <AdminLayout>
      <Box style={{ width: "100%" }}>
        <PageHeader
          title="Risk Monitoring"
          subtitle="Track and mitigate risks by initiative"
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
                  Add Risk
                </Button>
              )}
            </Group>
          }
        />

        {summary && (
          <Grid mb="lg" gutter="md">
            <Grid.Col span={{ base: 12, xs: 4 }}>
              <Card withBorder radius="md" p="md">
                <Group gap="xs" mb={4}>
                  <IconAlertTriangle size={20} color="orange" />
                  <Text fw={700} size="sm" c="dimmed">High severity</Text>
                </Group>
                <Text fw={800} fz={24}>{summary.high}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 4 }}>
              <Card withBorder radius="md" p="md">
                <Group gap="xs" mb={4}>
                  <IconAlertTriangle size={20} color="red" />
                  <Text fw={700} size="sm" c="dimmed">Critical</Text>
                </Group>
                <Text fw={800} fz={24}>{summary.critical}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 4 }}>
              <Card withBorder radius="md" p="md">
                <Text fw={700} size="sm" c="dimmed" mb={4}>Open / Mitigating</Text>
                <Text fw={800} fz={24}>{summary.open}</Text>
              </Card>
            </Grid.Col>
          </Grid>
        )}

        <Paper withBorder radius="md" p="md">
          {loading ? (
            <Text size="sm" c="dimmed">Loading…</Text>
          ) : !selectedInitiativeId ? (
            <Text size="sm" c="dimmed">Select an initiative to view risks.</Text>
          ) : list.length === 0 ? (
            <Text size="sm" c="dimmed">No risks recorded yet. Add one to get started.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Severity</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Description</Table.Th>
                  {canEdit && <Table.Th w={80}></Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {list.map((row) => (
                  <Table.Tr key={row._id}>
                    <Table.Td fw={600}>{row.title}</Table.Td>
                    <Table.Td>
                      <Badge color={severityColor(row.severity ?? "")} variant="light" size="sm">
                        {row.severity ?? "—"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{row.status ?? "—"}</Table.Td>
                    <Table.Td style={{ maxWidth: 240 }}>{row.description ? `${row.description.slice(0, 60)}${row.description.length > 60 ? "…" : ""}` : "—"}</Table.Td>
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

        <Modal opened={modalOpen} onClose={() => { closeModal(); resetForm(); }} title={editing ? "Edit Risk" : "Add Risk"} centered size="md">
          <Stack gap="md">
            <TextInput label="Title" value={formTitle} onChange={(e) => setFormTitle(e.currentTarget.value)} required placeholder="Risk title" />
            <Textarea label="Description" value={formDescription} onChange={(e) => setFormDescription(e.currentTarget.value)} placeholder="Describe the risk" minRows={2} />
            <Select label="Severity" data={SEVERITY_OPTIONS} value={formSeverity} onChange={setFormSeverity} />
            <Select label="Status" data={STATUS_OPTIONS} value={formStatus} onChange={setFormStatus} />
            <Textarea label="Mitigation notes" value={formMitigation} onChange={(e) => setFormMitigation(e.currentTarget.value)} placeholder="How to mitigate" minRows={2} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => { closeModal(); resetForm(); }}>Cancel</Button>
              <Button bg={THEME_BLUE} onClick={handleSave} loading={saving} disabled={!formTitle.trim()}>Save</Button>
            </Group>
          </Stack>
        </Modal>

        <Modal opened={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete risk?">
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
