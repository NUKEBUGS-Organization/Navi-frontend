import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Accordion,
  Box,
  Badge,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconDownload, IconHelp, IconMessagePlus, IconTrash, IconUpload } from "@tabler/icons-react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import { PageHeader } from "@/components";
import { THEME_BLUE } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getInitiative, listInitiatives, type InitiativeListItem } from "@/api/initiatives";
import type { InitiativeFaq } from "@/types";
import {
  contributeKnowledgeText,
  deleteKnowledgeEntry,
  downloadKnowledgeFile,
  listKnowledgeEntries,
  updateKnowledgeEntryText,
  uploadKnowledgeFile,
  voteKnowledgeSolution,
  type KnowledgeEntry,
} from "@/api/knowledgeHub";

function formatWhen(d?: string) {
  if (!d) return "—";
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString();
}

type ParsedKnowledgeText =
  | { kind: "problem_solution"; problem: string; solution: string }
  | { kind: "link"; url: string; description?: string }
  | { kind: "unknown"; raw: string };

function parseKnowledgeText(text?: string): ParsedKnowledgeText {
  const raw = (text ?? "").trim();
  if (!raw) return { kind: "unknown", raw: "" };

  // Link format produced by Knowledge Hub:
  // Link:
  // <url>
  //
  // Description:
  // <desc>
  const linkMatch = raw.match(
    /^Link:\s*([\s\S]*?)(?:\s*\n\s*\nDescription:\s*([\s\S]*))?\s*$/i,
  );
  if (/^Link:/i.test(raw) && linkMatch) {
    const url = (linkMatch[1] ?? "").split(/\r?\n/)[0].trim();
    const description = (linkMatch[2] ?? "").trim();
    return { kind: "link", url, description: description || undefined };
  }

  const match = raw.match(/Problem:\s*([\s\S]*?)\s*Solution:\s*([\s\S]*)/i);
  if (match) {
    return {
      kind: "problem_solution",
      problem: (match[1] ?? "").trim(),
      solution: (match[2] ?? "").trim(),
    };
  }

  return { kind: "unknown", raw };
}

export default function KnowledgeHub() {
  const { user } = useAuth();
  const canUploadFiles = user?.role === "admin" || user?.role === "manager";
  const canDelete = user?.role === "admin" || user?.role === "manager";

  const [initiatives, setInitiatives] = useState<InitiativeListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [faqs, setFaqs] = useState<InitiativeFaq[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [problemText, setProblemText] = useState("");
  const [solutionText, setSolutionText] = useState("");
  const [contributionMode, setContributionMode] = useState<"text" | "link">("text");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [submittingText, setSubmittingText] = useState(false);
  const [attachedDoc, setAttachedDoc] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docAccept = ".pdf,.doc,.docx,.rtf,.txt,.xls,.xlsx,.ppt,.pptx";
  const [error, setError] = useState<string | null>(null);
  const [votingEntryId, setVotingEntryId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

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

  useEffect(() => {
    // Prevent attaching a previously selected file to a different initiative.
    setAttachedDoc(null);
  }, [selectedId]);

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
    if (!selectedId) return;
    setSubmittingText(true);
    setError(null);

    if (contributionMode === "text") {
      const problem = problemText.trim();
      const solution = solutionText.trim();
      if (!problem || !solution) {
        setSubmittingText(false);
        return;
      }

      try {
        const payload = `Problem:\n${problem}\n\nSolution:\n${solution}`;
        await contributeKnowledgeText(selectedId, payload);
        if (attachedDoc) {
          setUploading(true);
          try {
            await uploadKnowledgeFile(selectedId, attachedDoc);
            setAttachedDoc(null);
          } finally {
            setUploading(false);
          }
        }
        setProblemText("");
        setSolutionText("");
        await refreshEntries();
      } catch (e: unknown) {
        setError((e as { message?: string }).message ?? "Could not add contribution");
      } finally {
        setSubmittingText(false);
      }
      return;
    }

    const link = linkUrl.trim();
    if (!link) {
      setSubmittingText(false);
      return;
    }
    const desc = linkDescription.trim();
    setSubmittingText(true);
    setError(null);
    try {
      const payload = desc
        ? `Link:\n${link}\n\nDescription:\n${desc}`
        : `Link:\n${link}`;
      await contributeKnowledgeText(selectedId, payload);
      if (attachedDoc) {
        setUploading(true);
        try {
          await uploadKnowledgeFile(selectedId, attachedDoc);
          setAttachedDoc(null);
        } finally {
          setUploading(false);
        }
      }
      setLinkUrl("");
      setLinkDescription("");
      setAttachedDoc(null);
      await refreshEntries();
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? "Could not add contribution");
    } finally {
      setSubmittingText(false);
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

  const onDeleteEntry = async (entryId: string) => {
    if (!entryId) return;
    setError(null);
    setDeletingEntryId(entryId);
    try {
      await deleteKnowledgeEntry(entryId);
      // Re-fetch so list stays consistent after server-side delete.
      await refreshEntries();
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? "Delete failed");
    } finally {
      setDeletingEntryId(null);
    }
  };

  const onVote = async (entryId: string, direction: "up" | "down") => {
    setError(null);
    setVotingEntryId(entryId);
    try {
      const updated = await voteKnowledgeSolution(entryId, direction);
      setEntries((prev) => prev.map((e) => (e._id === entryId ? updated : e)));
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? "Vote failed");
    } finally {
      setVotingEntryId(null);
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
                    Contribute knowledge
                  </Title>
                  <Select
                    label="Contribution type"
                    data={[
                      { value: "text", label: "Text (Problem/Solution)" },
                      { value: "link", label: "Link" },
                    ]}
                    value={contributionMode}
                    onChange={(v) => setContributionMode((v as "text" | "link") ?? "text")}
                    size="md"
                    radius="md"
                  />
                  {canUploadFiles && (
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept={docAccept}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0] ?? null;
                        setAttachedDoc(file);
                        // Allow re-selecting the same file.
                        e.currentTarget.value = "";
                      }}
                    />
                  )}

                  {contributionMode === "text" ? (
                    <Stack gap="md">
                      <TextInput
                        label="Problem"
                        placeholder="What challenge occurred?"
                        value={problemText}
                        onChange={(e) => setProblemText(e.currentTarget.value)}
                        required
                        styles={{
                          input: { backgroundColor: "#ffe3e3", borderColor: "#ffa8a8" },
                        }}
                      />
                      <Textarea
                        label="Solution"
                        placeholder="How was it solved?"
                        minRows={4}
                        value={solutionText}
                        onChange={(e) => setSolutionText(e.currentTarget.value)}
                        required
                        rightSection={
                          canUploadFiles ? (
                            <ActionIcon
                              variant="light"
                              size={32}
                              disabled={uploading || submittingText}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                            >
                              <IconUpload size={16} />
                            </ActionIcon>
                          ) : null
                        }
                        rightSectionWidth={44}
                        styles={{
                          input: { backgroundColor: "#d9fdd9", borderColor: "#8ce08c" },
                        }}
                      />
                      {attachedDoc && (
                        <Group justify="space-between" spacing="xs">
                          <Text size="xs" c="dimmed" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                            Attached: {attachedDoc.name}
                          </Text>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size={30}
                            onClick={() => setAttachedDoc(null)}
                            disabled={uploading || submittingText}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Stack>
                  ) : (
                    <Stack gap="md">
                      <TextInput
                        label="Link URL"
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.currentTarget.value)}
                        required
                      />
                      <Textarea
                        label="Description (optional)"
                        placeholder="Add context for why this link is relevant…"
                        minRows={3}
                        value={linkDescription}
                        onChange={(e) => setLinkDescription(e.currentTarget.value)}
                        rightSection={
                          canUploadFiles ? (
                            <ActionIcon
                              variant="light"
                              size={32}
                              disabled={uploading || submittingText}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                            >
                              <IconUpload size={16} />
                            </ActionIcon>
                          ) : null
                        }
                        rightSectionWidth={44}
                      />
                      {attachedDoc && (
                        <Group justify="space-between" spacing="xs">
                          <Text size="xs" c="dimmed" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                            Attached: {attachedDoc.name}
                          </Text>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size={30}
                            onClick={() => setAttachedDoc(null)}
                            disabled={uploading || submittingText}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Stack>
                  )}
                  <Group justify="flex-end" mt="sm">
                    <Button
                      onClick={onContributeText}
                      loading={submittingText}
                      disabled={
                        contributionMode === "text"
                          ? !problemText.trim() || !solutionText.trim() || uploading
                          : !linkUrl.trim() || uploading
                      }
                      bg={THEME_BLUE}
                      c="white"
                    >
                      Contribute
                    </Button>
                  </Group>
                </Card>

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
                              (() => {
                                const parsed = parseKnowledgeText(e.textBody);
                                const up = e.solutionUpvotes ?? 0;
                                const down = e.solutionDownvotes ?? 0;

                                if (parsed.kind === "link") {
                                  return (
                                    <Stack gap={10}>
                                      <Box
                                        style={{
                                          backgroundColor: "#f1f3f5",
                                          border: "1px solid #dee2e6",
                                          borderRadius: 8,
                                          padding: 10,
                                        }}
                                      >
                                        <Text fw={700} size="sm" mb={4}>
                                          Link
                                        </Text>
                                        <a
                                          href={parsed.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ color: "#228be6", textDecoration: "underline" }}
                                        >
                                          {parsed.url}
                                        </a>
                                        {parsed.description ? (
                                          <Text mt="sm" size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                            {parsed.description}
                                          </Text>
                                        ) : null}
                                      </Box>
                                    </Stack>
                                  );
                                }

                                if (parsed.kind === "problem_solution") {
                                  return (
                                    <Stack gap={10}>
                                      <Box
                                        style={{
                                          backgroundColor: "#ffe3e3",
                                          border: "1px solid #ffa8a8",
                                          borderRadius: 8,
                                          padding: 10,
                                        }}
                                      >
                                        <Text fw={700} size="sm" mb={4}>
                                          Problem
                                        </Text>
                                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                          {parsed.problem || "—"}
                                        </Text>
                                      </Box>

                                      <Box
                                        style={{
                                          backgroundColor: "#d9fdd9",
                                          border: "1px solid #8ce08c",
                                          borderRadius: 8,
                                          padding: 10,
                                        }}
                                      >
                                        <Text fw={700} size="sm" mb={6}>
                                          Solution
                                        </Text>
                                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                          {parsed.solution || "—"}
                                        </Text>

                                        <Group mt="sm" gap="xs">
                                          <ActionIcon
                                            variant="light"
                                            color="green"
                                            disabled={votingEntryId === e._id}
                                            onClick={() => onVote(e._id, "up")}
                                          >
                                            ↑
                                          </ActionIcon>
                                          <Text size="sm" fw={700} c="dimmed">
                                            {up}
                                          </Text>
                                          <ActionIcon
                                            variant="light"
                                            color="red"
                                            disabled={votingEntryId === e._id}
                                            onClick={() => onVote(e._id, "down")}
                                          >
                                            ↓
                                          </ActionIcon>
                                          <Text size="sm" fw={700} c="dimmed">
                                            {down}
                                          </Text>
                                        </Group>
                                      </Box>
                                    </Stack>
                                  );
                                }

                                return (
                                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                    {parsed.raw || "—"}
                                  </Text>
                                );
                              })()
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
                          {canDelete && (
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => onDeleteEntry(e._id)}
                              loading={deletingEntryId === e._id}
                              title="Delete contribution"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
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
