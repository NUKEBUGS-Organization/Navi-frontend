import { api, getBlob, postFormData } from "./client";

export type KnowledgeEntryKind = "text" | "file";

export interface KnowledgeEntry {
  _id: string;
  organizationId?: string;
  initiativeId?: string;
  authorId?: string;
  authorName: string;
  kind: KnowledgeEntryKind;
  textBody?: string;
  originalFileName?: string;
  mimeType?: string;
  solutionUpvotes?: number;
  solutionDownvotes?: number;
  mySolutionVote?: "up" | "down";
  createdAt?: string;
}

function toId(raw: { _id?: string; [key: string]: unknown }): KnowledgeEntry {
  const id =
    typeof raw._id === "string"
      ? raw._id
      : (raw._id as { toString?: () => string })?.toString?.() ?? "";
  return { ...(raw as KnowledgeEntry), _id: id };
}

export function listKnowledgeEntries(initiativeId: string): Promise<KnowledgeEntry[]> {
  return api
    .get<unknown[]>(`/knowledge/initiatives/${encodeURIComponent(initiativeId)}/entries`)
    .then((list) => (Array.isArray(list) ? list.map((x) => toId(x as { _id: string })) : []));
}

export function contributeKnowledgeText(initiativeId: string, text: string): Promise<KnowledgeEntry> {
  return api
    .post<unknown>(`/knowledge/initiatives/${encodeURIComponent(initiativeId)}/text`, { text })
    .then((raw) => toId(raw as { _id: string }));
}

export function uploadKnowledgeFile(initiativeId: string, file: File): Promise<KnowledgeEntry> {
  const fd = new FormData();
  fd.append("file", file);
  return postFormData<unknown>(`/knowledge/initiatives/${encodeURIComponent(initiativeId)}/upload`, fd).then(
    (raw) => toId(raw as { _id: string }),
  );
}

export function voteKnowledgeSolution(
  entryId: string,
  direction: "up" | "down",
): Promise<KnowledgeEntry> {
  return api
    .post<unknown>(`/knowledge/entries/${encodeURIComponent(entryId)}/vote-solution`, {
      direction,
    })
    .then((raw) => toId(raw as { _id: string }));
}

export function deleteKnowledgeEntry(entryId: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/knowledge/entries/${encodeURIComponent(entryId)}`);
}

export function updateKnowledgeEntryText(entryId: string, text: string): Promise<KnowledgeEntry> {
  return api
    .patch<unknown>(`/knowledge/entries/${encodeURIComponent(entryId)}/text`, { text })
    .then((raw) => toId(raw as { _id: string }));
}

export async function downloadKnowledgeFile(entryId: string, fallbackName: string): Promise<void> {
  const blob = await getBlob(`/knowledge/entries/${encodeURIComponent(entryId)}/file`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fallbackName || "download";
  a.click();
  URL.revokeObjectURL(url);
}
