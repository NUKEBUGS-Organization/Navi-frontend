import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ActionIcon, Affix, Box, Button, Drawer, Group, Loader, Paper, ScrollArea, Stack, Text, Textarea } from "@mantine/core";
import { IconSend, IconSparkles, IconTrash } from "@tabler/icons-react";
import { chatWithNavi, getAiStatus, type ChatMessageDto } from "@/api/ai";
import type { ApiError } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";

/** The backend accepts up to 20 messages; older turns are dropped from what we send. */
const MAX_HISTORY = 20;
const STORAGE_KEY = "navi-ai-chat";

const SUGGESTIONS = [
  "Which initiatives are at risk right now?",
  "What tasks are overdue across my initiatives?",
  "Summarize the critical and high risks.",
  "How is adoption tracking against targets?",
];

function loadHistory(key: string): ChatMessageDto[] {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ChatMessageDto[]) : [];
  } catch {
    return [];
  }
}

/** Floating "Navi AI" assistant for admins and managers. Hidden when AI is off. */
export default function NaviAiChat() {
  const { user } = useAuth();
  const location = useLocation();
  const allowed = user?.role === "admin" || user?.role === "manager";
  // Per-user key so a different login in the same tab never sees someone else's conversation.
  const storageKey = `${STORAGE_KEY}:${user?._id ?? "anon"}`;
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageDto[]>(() => loadHistory(storageKey));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const currentInitiativeId = location.pathname.match(/\/initiatives\/([a-f0-9]{24})/i)?.[1];

  useEffect(() => {
    if (!allowed) return;
    getAiStatus()
      .then((s) => setEnabled(!!s.enabled))
      .catch(() => setEnabled(false));
  }, [allowed]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Storage unavailable (private mode); history just won't survive a reload.
    }
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, storageKey]);

  if (!allowed || !enabled) return null;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: ChatMessageDto[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const { reply } = await chatWithNavi(next.slice(-MAX_HISTORY), currentInitiativeId);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError((e as ApiError).message || "Navi AI couldn't answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <Affix position={{ bottom: 24, right: 24 }} zIndex={150}>
          <Button
            color="violet"
            radius="xl"
            size="md"
            leftSection={<IconSparkles size={18} />}
            onClick={() => setOpen(true)}
            style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}
          >
            Navi AI
          </Button>
        </Affix>
      )}

      <Drawer
        opened={open}
        onClose={() => setOpen(false)}
        position="right"
        size="md"
        title={
          <Group gap={6}>
            <IconSparkles size={18} color="var(--mantine-color-violet-6)" />
            <Text fw={700}>Navi AI</Text>
          </Group>
        }
        styles={{ body: { height: "calc(100% - 60px)", display: "flex", flexDirection: "column" } }}
      >
        <ScrollArea style={{ flex: 1 }} viewportRef={viewport} offsetScrollbars>
          <Stack gap="sm" pb="sm">
            {messages.length === 0 && (
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Ask about your initiatives, tasks, risks, adoption or the Knowledge Hub. I can read data but not change it.
                </Text>
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="light" color="violet" size="xs" justify="flex-start" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </Stack>
            )}
            {messages.map((m, i) => (
              <Box key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                <Paper
                  p="sm"
                  radius="md"
                  bg={m.role === "user" ? "violet.6" : "gray.1"}
                  c={m.role === "user" ? "white" : undefined}
                >
                  <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                    {m.content}
                  </Text>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Group gap="xs">
                <Loader size="xs" color="violet" />
                <Text size="xs" c="dimmed">Looking that up…</Text>
              </Group>
            )}
            {error && (
              <Text size="xs" c="red">
                {error}
              </Text>
            )}
          </Stack>
        </ScrollArea>

        <Group gap="xs" align="flex-end" wrap="nowrap" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
          <ActionIcon
            variant="subtle"
            color="gray"
            title="Clear conversation"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            disabled={loading || messages.length === 0}
          >
            <IconTrash size={16} />
          </ActionIcon>
          <Textarea
            style={{ flex: 1 }}
            placeholder="Ask Navi AI…"
            autosize
            minRows={1}
            maxRows={5}
            maxLength={4000}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <ActionIcon color="violet" size="lg" onClick={() => send(input)} loading={loading} disabled={!input.trim()}>
            <IconSend size={16} />
          </ActionIcon>
        </Group>
        <Text size="xs" c="dimmed" mt={6}>
          Answers come from your NAVI data and can contain mistakes.
        </Text>
      </Drawer>
    </>
  );
}
