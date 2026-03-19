import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  FileInput,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconDownload, IconHelp, IconMessagePlus, IconUpload } from "@tabler/icons-react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import { PageHeader } from "@/components";
import { THEME_BLUE } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getInitiative, listInitiatives, type InitiativeListItem } from "@/api/initiatives";
import type { InitiativeFaq } from "@/types";
import {
  contributeKnowledgeText,
  downloadKnowledgeFile,
  listKnowledgeEntries,
  uploadKnowledgeFile,
  type KnowledgeEntry,
} from "@/api/knowledgeHub";

function formatWhen(d?: string) {
  if (!d) return "—";
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString();
}

export default function KnowledgeHub() {
  const { user } = useAuth();
  const canUploadFiles = user?.role === "admin" || user?.role === "manager";

  const [initiatives, setInitiatives] = useState<InitiativeListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [faqs, setFaqs] = useState<InitiativeFaq[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [textBody, setTextBody] = useState("");
  const [submittingText, setSubmittingText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiativeOptions = useMemo(
    () =>
      initiatives.map((i) => ({
        value: i.id,
        label: i.title || "Untitled",
      })),
    [initiatives],
  );

  const refreshInitiatives = useCallback(() => {
    setLoadingList(true);
    listInitiatives()
      .then((list) => {
        setInitiatives(Array.isArray(list) ? list : []);
        setSelectedId((prev) => {
          if (prev && list.some((x) => x.id === prev)) return prev;
          return list[0]?.id ?? "";
        });
      })
      .catch(() => setInitiatives([]))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    refreshInitiatives();
  }, [refreshInitiatives]);

  const refreshEntries = useCallback(() => {
    if (!selectedId) {
      setEntries([]);
      return;
    }
    setLoadingEntries(true);
    listKnowledgeEntries(selectedId)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoadingEntries(false));
  }, [selectedId]);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const refreshFaqs = useCallback(() => {
    if (!selectedId) {
      setFaqs([]);
      return;
    }
    setLoadingFaqs(true);
    getInitiative(selectedId)
      .then((ini) => {
        const f = (ini as InitiativeListItem & { faqs?: InitiativeFaq[] }).faqs;
        setFaqs(Array.isArray(f) ? f : []);
      })
      .catch(() => setFaqs([]))
      .finally(() => setLoadingFaqs(false));
  }, [selectedId]);

  useEffect(() => {
    refreshFaqs();
  }, [refreshFaqs]);

  const onContributeText = async () => {
    if (!selectedId || !textBody.trim()) return;
    setSubmittingText(true);
    setError(null);
    try {
      await contributeKnowledgeText(selectedId, textBody.trim());
      setTextBody("");
      await refreshEntries();
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? "Could not add contribution");
    } finally {
      setSubmittingText(false);
    }
  };

  const onUpload = async (file: File | null) => {
    if (!selectedId || !file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadKnowledgeFile(selectedId, file);
      await refreshEntries();
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDownload = async (entry: KnowledgeEntry) => {
    const name = entry.originalFileName || "download";
    try {
      await downloadKnowledgeFile(entry._id, name);
    } catch {
      setError("Download failed");
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Knowledge Hub"
        subtitle="Share knowledge and browse initiative FAQs for your organization."
      />

      {error && (
        <Text c="red" size="sm" mb="md">
          {error}
        </Text>
      )}

      <Card withBorder radius="md" p="lg" mb="lg">
        <Stack gap="md">
          <Select
            label="Initiative"
            placeholder={loadingList ? "Loading…" : "Select an initiative"}
            data={initiativeOptions}
            value={selectedId || null}
            onChange={(v) => setSelectedId(v || "")}
            searchable
            nothingFoundMessage="No initiatives"
          />
        </Stack>
      </Card>

      <Tabs defaultValue="contributions" color="blue">
        <Tabs.List mb="md">
          <Tabs.Tab value="contributions" leftSection={<IconMessagePlus size={16} />}>
            Contributions
          </Tabs.Tab>
          <Tabs.Tab value="faqs" leftSection={<IconHelp size={16} />}>
            FAQs
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="contributions">
          <Stack gap="md">
            {!selectedId ? (
              <Text c="dimmed">Select an initiative to view or add contributions.</Text>
            ) : (
              <>
                <Card withBorder radius="md" p="md">
                  <Title order={5} mb="sm">
                    Add a text contribution
                  </Title>
                  <Textarea
                    placeholder="Share a tip, link context, or helpful note for this initiative…"
                    minRows={4}
                    value={textBody}
                    onChange={(e) => setTextBody(e.currentTarget.value)}
                  />
                  <Group justify="flex-end" mt="sm">
                    <Button
                      onClick={onContributeText}
                      loading={submittingText}
                      disabled={!textBody.trim()}
                      bg={THEME_BLUE}
                      c="white"
                    >
                      Contribute
                    </Button>
                  </Group>
                </Card>

                {canUploadFiles && (
                  <Card withBorder radius="md" p="md">
                    <Title order={5} mb="xs">
                      Upload media or documents
                    </Title>
                    <Text size="sm" c="dimmed" mb="sm">
                      Only managers and admins can upload files. Max ~30 MB per file.
                    </Text>
                    <FileInput
                      leftSection={<IconUpload size={16} />}
                      placeholder="Choose file"
                      onChange={onUpload}
                      disabled={uploading}
                    />
                  </Card>
                )}

                <Title order={5}>Recent contributions</Title>
                {loadingEntries ? (
                  <Text c="dimmed">Loading…</Text>
                ) : entries.length === 0 ? (
                  <Text c="dimmed">No contributions yet.</Text>
                ) : (
                  <Stack gap="sm">
                    {entries.map((e) => (
                      <Card key={e._id} withBorder radius="md" p="md">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                            <Group gap="xs">
                              <Badge variant="light" color="blue">
                                {e.kind === "text" ? "Text" : "File"}
                              </Badge>
                              <Text size="sm" fw={700}>
                                {e.authorName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {formatWhen(e.createdAt)}
                              </Text>
                            </Group>
                            {e.kind === "text" ? (
                              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                {e.textBody}
                              </Text>
                            ) : (
                              <Group gap="xs">
                                <Text size="sm">{e.originalFileName ?? "File"}</Text>
                                <Button
                                  size="xs"
                                  variant="light"
                                  leftSection={<IconDownload size={14} />}
                                  onClick={() => onDownload(e)}
                                >
                                  Download
                                </Button>
                              </Group>
                            )}
                          </Stack>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="faqs">
          <Stack gap="md">
            {!selectedId ? (
              <Text c="dimmed">Select an initiative to view FAQs.</Text>
            ) : loadingFaqs ? (
              <Text c="dimmed">Loading FAQs…</Text>
            ) : faqs.length === 0 ? (
              <Text c="dimmed">No FAQs have been added for this initiative yet.</Text>
            ) : (
              <Accordion variant="separated" radius="md">
                {faqs.map((f, idx) => (
                  <Accordion.Item key={`${idx}-${f.question}`} value={`faq-${idx}`}>
                    <Accordion.Control>
                      <Text fw={700}>{f.question || `Question ${idx + 1}`}</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                        {f.answer}
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </AdminLayout>
  );
}
