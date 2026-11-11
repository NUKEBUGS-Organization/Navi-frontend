import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SuperAdminLayout from "@/roles/super-admin/layout/SuperAdminLayout";
import { PageHeader } from "@/components";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Pagination,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { diagnosticsApi } from "@/api/diagnostics";
import type { ApiError } from "@/api/client";
import type {
  DiagnosticsSummary,
  ErrorGroup,
  ErrorGroupPage,
  ListGroupsParams,
} from "@/types/diagnostics";
import DiagnosticsDetailDrawer from "./DiagnosticsDetailDrawer";

dayjs.extend(relativeTime);

const PAGE_SIZE = 25;

type SourceFilter = "all" | "server" | "client";
type SeverityFilter = "error" | "all";
type StatusFilter = "open" | "resolved" | "all";

const TH = { c: "dimmed", fw: 800, fz: 10, lts: 1 } as const;

function SummaryTile({ label, value }: { label: string; value?: number }) {
  return (
    <Card withBorder radius="md" p="md" shadow="xs">
      <Text c="dimmed" fw={800} fz={10} lts={1}>
        {label}
      </Text>
      <Text fw={700} fz={28}>
        {value === undefined ? "—" : value.toLocaleString()}
      </Text>
    </Card>
  );
}

export default function Diagnostics() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawSource = searchParams.get("source");
  const source: SourceFilter =
    rawSource === "server" || rawSource === "client" ? rawSource : "all";
  const severity: SeverityFilter =
    searchParams.get("severity") === "all" ? "all" : "error";
  const rawStatus = searchParams.get("status");
  const status: StatusFilter =
    rawStatus === "resolved" || rawStatus === "all" ? rawStatus : "open";
  const q = searchParams.get("q") ?? "";
  const pageNum = Number(searchParams.get("page"));
  const page = Number.isInteger(pageNum) && pageNum >= 1 ? pageNum : 1;

  const [searchInput, setSearchInput] = useState(q);
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  const [summary, setSummary] = useState<DiagnosticsSummary | null>(null);
  const [data, setData] = useState<ErrorGroupPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const requestId = useRef(0);

  /** Update URL params; defaults are omitted. Resets to page 1 unless page is set. */
  const updateParams = useCallback(
    (changes: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === "") next.delete(key);
            else next.set(key, value);
          }
          if (!("page" in changes)) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Push the debounced search into the URL (resets page to 1 when it changed).
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed !== q) updateParams({ q: trimmed || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const loadSummary = useCallback(async () => {
    setSummaryError(null);
    try {
      setSummary(await diagnosticsApi.getSummary());
    } catch (e) {
      setSummaryError((e as ApiError).message ?? "Failed to load summary");
    }
  }, []);

  const loadGroups = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    const params: ListGroupsParams = {
      severity,
      status,
      page,
      limit: PAGE_SIZE,
    };
    if (source !== "all") params.source = source;
    if (q) params.q = q;
    try {
      const res = await diagnosticsApi.listGroups(params);
      if (id === requestId.current) {
        setData(res);
        const last = Math.max(1, Math.ceil(res.total / PAGE_SIZE));
        if (res.total > 0 && page > last) {
          updateParams({ page: last === 1 ? null : String(last) });
        }
      }
    } catch (e) {
      if (id === requestId.current) {
        setData(null);
        setError((e as ApiError).message ?? "Failed to load errors");
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [source, severity, status, q, page, updateParams]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refreshAll = useCallback(() => {
    loadGroups();
    loadSummary();
  }, [loadGroups, loadSummary]);

  const items: ErrorGroup[] = data?.items ?? [];
  const totalPages = Math.max(
    page,
    data ? Math.ceil(data.total / PAGE_SIZE) : 1,
  );

  return (
    <SuperAdminLayout>
      <PageHeader
        title="Diagnostics"
        subtitle="Server and browser errors, grouped by cause"
        actions={
          <Button variant="light" onClick={refreshAll} loading={loading}>
            Refresh
          </Button>
        }
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} mb="lg">
        <SummaryTile label="ERRORS (24H)" value={summary?.errorsLast24h} />
        <SummaryTile label="WARNINGS (24H)" value={summary?.warningsLast24h} />
        <SummaryTile label="OPEN ISSUES" value={summary?.openGroups} />
        <SummaryTile
          label="USERS AFFECTED (24H)"
          value={summary?.usersAffectedLast24h}
        />
      </SimpleGrid>

      {summaryError && !error && (
        <Alert color="red" title="Could not load summary" mb="md">
          {summaryError}
        </Alert>
      )}

      <Card withBorder radius="md" p="md" mb="lg" shadow="xs">
        <Group gap="md" align="flex-end">
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={600}>
              Source
            </Text>
            <SegmentedControl
              value={source}
              onChange={(v) => updateParams({ source: v === "all" ? null : v })}
              data={[
                { label: "All", value: "all" },
                { label: "Backend", value: "server" },
                { label: "Frontend", value: "client" },
              ]}
            />
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={600}>
              Severity
            </Text>
            <SegmentedControl
              value={severity}
              onChange={(v) => updateParams({ severity: v === "error" ? null : v })}
              data={[
                { label: "Crashes only", value: "error" },
                { label: "Include 4xx", value: "all" },
              ]}
            />
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={600}>
              Status
            </Text>
            <SegmentedControl
              value={status}
              onChange={(v) => updateParams({ status: v === "open" ? null : v })}
              data={[
                { label: "Open", value: "open" },
                { label: "Resolved", value: "resolved" },
                { label: "All", value: "all" },
              ]}
            />
          </Stack>
          <TextInput
            placeholder="Search messages, routes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            leftSection={<IconSearch size={16} color="#adb5bd" />}
            radius="md"
            style={{ flex: 1, minWidth: 200, maxWidth: 360 }}
          />
        </Group>
      </Card>

      {error && (
        <Alert color="red" title="Could not load errors" mb="md">
          {error}
        </Alert>
      )}

      <Card withBorder radius="lg" shadow="xs">
        <Table.ScrollContainer
          minWidth={900}
          style={{
            opacity: loading ? 0.5 : 1,
            pointerEvents: loading ? "none" : undefined,
          }}
        >
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th {...TH}>MESSAGE</Table.Th>
                <Table.Th {...TH}>SOURCE</Table.Th>
                <Table.Th {...TH}>SEVERITY</Table.Th>
                <Table.Th {...TH}>ROUTE / PAGE</Table.Th>
                <Table.Th {...TH}>COUNT</Table.Th>
                <Table.Th {...TH}>USERS</Table.Th>
                <Table.Th {...TH}>LAST SEEN</Table.Th>
                <Table.Th {...TH}>STATUS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((g) => (
                <Table.Tr
                  key={g._id}
                  onClick={() => setSelectedId(g._id)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td maw={380}>
                    <Text size="sm" fw={600} lineClamp={2}>
                      {g.message}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {g.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={g.source === "server" ? "blue" : "grape"}>
                      {g.source === "server" ? "Backend" : "Frontend"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={g.severity === "error" ? "red" : "yellow"}>
                      {g.severity}
                    </Badge>
                  </Table.Td>
                  <Table.Td maw={220}>
                    <Text size="sm" truncate>
                      {g.route || "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td>{g.count}</Table.Td>
                  <Table.Td>{g.usersAffected}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" title={new Date(g.lastSeen).toLocaleString()}>
                      {dayjs(g.lastSeen).fromNow()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={g.status === "open" ? "orange" : "green"}>
                      {g.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {loading && (
          <Center p="lg">
            <Loader size="sm" />
          </Center>
        )}
        {!loading && !error && items.length === 0 && (
          <Box p="md">
            <Text c="dimmed" size="sm">
              No errors match these filters
            </Text>
          </Box>
        )}
      </Card>

      {(totalPages > 1 || page > 1) && (
        <Group justify="center" mt="lg">
          <Pagination
            value={page}
            total={totalPages}
            onChange={(p) => updateParams({ page: p === 1 ? null : String(p) })}
          />
        </Group>
      )}

      <DiagnosticsDetailDrawer
        groupId={selectedId}
        onClose={() => setSelectedId(null)}
        onChanged={refreshAll}
      />
    </SuperAdminLayout>
  );
}
