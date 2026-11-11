import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Center,
  Code,
  Drawer,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { diagnosticsApi } from "@/api/diagnostics";
import type { ApiError } from "@/api/client";
import type { ErrorEvent, ErrorGroupDetail } from "@/types/diagnostics";

dayjs.extend(relativeTime);

interface Props {
  groupId: string | null;
  onClose: () => void;
  /** Called after a status change so the table and tiles can refresh. */
  onChanged: () => void;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text c="dimmed" fw={800} fz={10} lts={1}>
        {label}
      </Text>
      <Text size="sm" style={{ wordBreak: "break-word" }}>
        {value}
      </Text>
    </div>
  );
}

const fmt = (iso: string) => `${new Date(iso).toLocaleString()} (${dayjs(iso).fromNow()})`;

function EventTrace({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <Text c="dimmed" fw={800} fz={10} lts={1} mb={4}>
        {label}
      </Text>
      <Code block style={{ maxHeight: 240, overflow: "auto", whiteSpace: "pre" }}>
        {text}
      </Code>
    </div>
  );
}

function eventTitle(ev: ErrorEvent) {
  return ev.path || ev.pageUrl || "—";
}

export default function DiagnosticsDetailDrawer({ groupId, onClose, onChanged }: Props) {
  const [detail, setDetail] = useState<ErrorGroupDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (id: string) => {
    const rid = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await diagnosticsApi.getGroup(id);
      if (rid === requestId.current) setDetail(res);
    } catch (e) {
      if (rid === requestId.current) {
        setError((e as ApiError).message ?? "Failed to load error details");
      }
    } finally {
      if (rid === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setDetail(null);
    setError(null);
    if (groupId) load(groupId);
    else requestId.current++;
  }, [groupId, load]);

  const toggleStatus = async () => {
    if (!detail || !groupId) return;
    setSaving(true);
    setError(null);
    try {
      await diagnosticsApi.setStatus(
        groupId,
        detail.group.status === "open" ? "resolved" : "open",
      );
      await load(groupId);
      onChanged();
    } catch (e) {
      setError((e as ApiError).message ?? "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const group = detail?.group;

  return (
    <Drawer
      opened={groupId !== null}
      onClose={onClose}
      position="right"
      size="xl"
      title={<Text fw={700}>Error details</Text>}
    >
      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}
      {loading && !detail && (
        <Center p="lg">
          <Loader size="sm" />
        </Center>
      )}
      {group && detail && (
        <Stack gap="lg">
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Text fw={700} style={{ wordBreak: "break-word" }}>
                {group.message}
              </Text>
              <Button
                size="xs"
                variant="light"
                color={group.status === "open" ? "green" : "orange"}
                loading={saving}
                onClick={toggleStatus}
              >
                {group.status === "open" ? "Resolve" : "Reopen"}
              </Button>
            </Group>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {group.name}
              </Text>
              <Badge variant="light" color={group.status === "open" ? "orange" : "green"}>
                {group.status}
              </Badge>
              <Badge variant="light" color={group.severity === "error" ? "red" : "yellow"}>
                {group.severity}
              </Badge>
            </Group>
          </Stack>

          <Stack gap="sm">
            <Fact label="ROUTE / PAGE" value={group.route || "—"} />
            <Fact label="FIRST SEEN" value={fmt(group.firstSeen)} />
            <Fact label="LAST SEEN" value={fmt(group.lastSeen)} />
            <Fact label="COUNT" value={String(group.count)} />
            <Fact label="ROLES" value={group.roles.length ? group.roles.join(", ") : "—"} />
            <Fact label="USERS AFFECTED" value={String(group.usersAffected)} />
            <Fact label="ORGANIZATIONS AFFECTED" value={String(group.orgsAffected)} />
          </Stack>

          <div>
            <Text fw={700} mb="xs">
              Occurrences ({detail.events.length})
            </Text>
            {detail.events.length === 0 ? (
              <Text size="sm" c="dimmed">
                No occurrences recorded.
              </Text>
            ) : (
              <Accordion variant="separated" chevronPosition="left">
                {detail.events.map((ev) => {
                  const who = ev.userEmail || "anonymous";
                  const role = ev.userRole ? " (" + ev.userRole + ")" : "";
                  return (
                    <Accordion.Item key={ev._id} value={ev._id}>
                      <Accordion.Control>
                        <Group justify="space-between" wrap="nowrap" gap="sm">
                          <Stack gap={0} style={{ minWidth: 0 }}>
                            <Text size="sm" fw={600}>
                              {new Date(ev.createdAt).toLocaleString()}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                              {who}
                              {role} · {eventTitle(ev)}
                            </Text>
                          </Stack>
                          {ev.statusCode !== undefined && (
                            <Badge variant="light" color="gray">
                              {ev.statusCode}
                            </Badge>
                          )}
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap="sm">
                          <Fact label="TIME" value={fmt(ev.createdAt)} />
                          <Fact label="USER" value={who + role} />
                          <Fact label="ORGANIZATION ID" value={ev.organizationId || "—"} />
                          <Fact
                            label={ev.path ? "REQUEST" : "PAGE"}
                            value={
                              ev.path
                                ? (ev.method ? ev.method + " " : "") + ev.path
                                : ev.pageUrl || "—"
                            }
                          />
                          <Fact label="BROWSER" value={ev.userAgent || "—"} />
                          <Fact
                            label="STATUS CODE"
                            value={ev.statusCode !== undefined ? String(ev.statusCode) : "—"}
                          />
                          {ev.stack && <EventTrace label="STACK" text={ev.stack} />}
                          {ev.componentStack && (
                            <EventTrace label="COMPONENT STACK" text={ev.componentStack} />
                          )}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
          </div>
        </Stack>
      )}
    </Drawer>
  );
}
