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
import { THEME_BLUE } from "@/constants";
import { useAppRoutes } from "@/hooks/useAppRoutes";
import { listInitiatives } from "@/api/initiatives";
import {
  listRisks,
  getRiskSummary,
  getAssessmentDerivedRisks,
  createRisk,
  updateRisk,
  deleteRisk,
  type RiskDto,
  type CreateRiskPayload,
  type RiskSummary,
  type AssessmentDerivedRisk,
} from "@/api/risks";
import { getAiStatus } from "@/api/ai";
import AiRiskSuggestionsModal from "@/components/ai/AiRiskSuggestionsModal";
import AiRiskAssessButton from "@/components/ai/AiRiskAssessButton";
import { useAuth } from "@/contexts/AuthContext";
import { IconPlus, IconPencil, IconTrash, IconAlertTriangle, IconSparkles } from "@tabler/icons-react";

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
  // Risk Monitoring cards use red/amber/green.
  if (s === "Critical" || s === "High") return "red";
  if (s === "Medium") return "orange";
  if (s === "Low") return "green";
  return "gray";
}

export default function RiskMonitoring() {
  const { user } = useAuth();
  const appRoutes = useAppRoutes();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [initiatives, setInitiatives] = useState<
    { id: string; title: string; hseImpact?: boolean; foodSafetyImpact?: boolean }[]
  >([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [list, setList] = useState<RiskDto[]>([]);
  const [assessmentRisks, setAssessmentRisks] = useState<AssessmentDerivedRisk[]>([]);
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
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiSuggestOpen, { open: openAiSuggest, close: closeAiSuggest }] = useDisclosure(false);

  useEffect(() => {
    if (!canEdit) return;
    getAiStatus()
      .then((s) => setAiEnabled(!!s.enabled))
      .catch(() => setAiEnabled(false));
  }, [canEdit]);

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
        setInitiatives(
          data.map((i) => ({
            id: i.id,
            title: i.title,
            hseImpact: i.hseImpact,
            foodSafetyImpact: i.foodSafetyImpact,
          })),
        );
        if (data.length > 0 && !selectedInitiativeId) setSelectedInitiativeId(data[0].id);
      })
      .catch(() => []);
    getRiskSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
    getAssessmentDerivedRisks()
      .then((d) => setAssessmentRisks(Array.isArray(d) ? d : []))
      .catch(() => setAssessmentRisks([]));
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
    getAssessmentDerivedRisks().then((d) => setAssessmentRisks(Array.isArray(d) ? d : [])).catch(() => setAssessmentRisks([]));
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

  const sortedAssessmentRisks = [...assessmentRisks].sort((a, b) => {
    const rank = (x: string) => (x === "High" ? 0 : x === "Medium" ? 1 : 2);
    return rank(a.riskLevel) - rank(b.riskLevel);
  });

  const breadcrumbs = [
    { title: "Dashboard", href: appRoutes.DASHBOARD },
    { title: "Risk Monitoring", href: appRoutes.RISKS },
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
              {canEdit && aiEnabled && (
                <Button
                  leftSection={<IconSparkles size={18} />}
                  color="violet"
                  variant="light"
                  radius="md"
                  onClick={openAiSuggest}
                  disabled={!selectedInitiativeId}
                >
                  Suggest risks
                </Button>
              )}
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

        {(() => {
          const sel = initiatives.find((i) => i.id === selectedInitiativeId);
          if (!sel || (!sel.hseImpact && !sel.foodSafetyImpact)) return null;
          const groups: { key: string; label: string; checks: string[] }[] = [];
          if (sel.hseImpact) {
            groups.push({
              key: "hse",
              label: "HSE impact",
              checks: [
                "HSE risk assessment completed and signed off",
                "Safe work procedures / PPE requirements updated",
                "Affected staff briefed and trained before go-live",
              ],
            });
          }
          if (sel.foodSafetyImpact) {
            groups.push({
              key: "food",
              label: "Food safety impact",
              checks: [
                "HACCP plan / food safety controls reviewed",
                "Allergen, supplier and storage controls confirmed",
                "Food safety team consulted and records updated",
              ],
            });
          }
          return (
            <Paper withBorder radius="md" p="md" mb="lg" style={{ borderColor: "#ffd8a8" }}>
              <Group gap="xs" mb="sm">
                <IconAlertTriangle size={18} color="#e8590c" />
                <Text fw={700} size="sm" tt="uppercase" lts={0.5} c="orange.8">
                  Pre-flight compliance checks
                </Text>
              </Group>
              <Text size="xs" c="dimmed" mb="md">
                This initiative is flagged for the items below. Confirm each before go-live, and log any gaps as risks.
              </Text>
              <Grid>
                {groups.map((g) => (
                  <Grid.Col key={g.key} span={{ base: 12, md: 6 }}>
                    <Group justify="space-between" mb={6}>
                      <Badge color="orange" variant="light">{g.label}</Badge>
                      {canEdit && (
                        <Button
                          size="compact-xs"
                          variant="subtle"
                          onClick={() => {
                            openCreate();
                            setFormTitle(`${g.label}: `);
                            setFormSeverity("High");
                          }}
                        >
                          Log as risk
                        </Button>
                      )}
                    </Group>
                    <Stack gap={4}>
                      {g.checks.map((c) => (
                        <Text key={c} size="sm">• {c}</Text>
                      ))}
                    </Stack>
                  </Grid.Col>
                ))}
              </Grid>
            </Paper>
          );
        })()}

        {sortedAssessmentRisks.length > 0 && (
          <Paper withBorder radius="md" p="md" mb="lg">
            <Text fw={700} size="sm" c="dimmed" mb="md" tt="uppercase" lts={0.5}>
              Assessment risks (readiness hotspots)
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Medium and high rows first. Area of risk reflects the weakest assessment dimension for that initiative.
            </Text>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Initiative</Table.Th>
                  <Table.Th>Area of risk</Table.Th>
                  <Table.Th>Risk level</Table.Th>
                  <Table.Th>Avg score</Table.Th>
                  <Table.Th>Submissions</Table.Th>
                  <Table.Th>Last submitted</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedAssessmentRisks.map((r) => (
                  <Table.Tr key={r.initiativeId}>
                    <Table.Td fw={600}>{r.initiativeTitle}</Table.Td>
                    <Table.Td maw={220}>
                      <Text size="sm" lineClamp={2}>
                        {r.areaOfRisk || "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={severityColor(r.riskLevel)} variant="light" size="sm">
                        {r.riskLevel}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{r.avgScore.toFixed(1)} / 5</Table.Td>
                    <Table.Td>{r.submissionCount}</Table.Td>
                    <Table.Td>
                      {r.lastSubmittedAt
                        ? new Date(r.lastSubmittedAt).toLocaleDateString()
                        : "—"}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {summary && (
          <Grid mb="lg" gutter="md">
            <Grid.Col span={{ base: 12, xs: 3 }} style={{ display: "flex" }}>
              <Card withBorder radius="md" p="md" style={{ flex: 1, height: "100%" }}>
                <Group gap="xs" mb={4}>
                  <IconAlertTriangle size={20} color="red" />
                  <Text fw={700} size="sm" c="dimmed">High</Text>
                </Group>
                <Text fw={800} fz={24}>{summary.high}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 3 }} style={{ display: "flex" }}>
              <Card withBorder radius="md" p="md" style={{ flex: 1, height: "100%" }}>
                <Group gap="xs" mb={4}>
                  <IconAlertTriangle size={20} color="#f59f00" />
                  <Text fw={700} size="sm" c="dimmed">Medium</Text>
                </Group>
                <Text fw={800} fz={24}>{summary.medium}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 3 }} style={{ display: "flex" }}>
              <Card withBorder radius="md" p="md" style={{ flex: 1, height: "100%" }}>
                <Group gap="xs" mb={4}>
                  <IconAlertTriangle size={20} color="green" />
                  <Text fw={700} size="sm" c="dimmed">Low</Text>
                </Group>
                <Text fw={800} fz={24}>{summary.low}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 3 }} style={{ display: "flex" }}>
              <Card withBorder radius="md" p="md" style={{ flex: 1, height: "100%" }}>
                <Group gap="xs" mb={4}>
                  <IconAlertTriangle size={20} color="#868e96" />
                  <Text fw={700} size="sm" c="dimmed">Being resolved</Text>
                </Group>
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
            {aiEnabled && selectedInitiativeId && (
              <AiRiskAssessButton
                initiativeId={selectedInitiativeId}
                title={formTitle}
                description={formDescription}
                currentMitigation={formMitigation}
                onSeverity={setFormSeverity}
                onMitigation={setFormMitigation}
              />
            )}
            <Select label="Severity" data={SEVERITY_OPTIONS} value={formSeverity} onChange={setFormSeverity} />
            <Select label="Status" data={STATUS_OPTIONS} value={formStatus} onChange={setFormStatus} />
            <Textarea label="Mitigation notes" value={formMitigation} onChange={(e) => setFormMitigation(e.currentTarget.value)} placeholder="How to mitigate" minRows={2} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => { closeModal(); resetForm(); }}>Cancel</Button>
              <Button bg={THEME_BLUE} onClick={handleSave} loading={saving} disabled={!formTitle.trim()}>Save</Button>
            </Group>
          </Stack>
        </Modal>

        {aiEnabled && selectedInitiativeId && (
          <AiRiskSuggestionsModal
            initiativeId={selectedInitiativeId}
            opened={aiSuggestOpen}
            onClose={closeAiSuggest}
            onAdded={() => {
              loadList();
              getRiskSummary().then(setSummary).catch(() => {});
            }}
          />
        )}

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
