import { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, Group, Select, Stack, Tabs, Text, Title, Textarea } from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  createManagerKudosAward,
  giveManagerStar,
  getKudosSummary,
  listKudosContributions,
  listKudosInitiatives,
  listMyKudos,
  type KudosContribution,
  type KudosContributionType,
  type KudosInitiativeSummary,
  type KudosSummary,
} from "@/api/kudos";
import { listOrganizationUsers, type AuthUser } from "@/api/auth";
import { THEME_BLUE } from "@/constants";

function formatDate(d?: string) {
  if (!d) return "—";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function contributionLabel(type: KudosContributionType) {
  switch (type) {
    case "task_completed":
      return "Task completed";
    case "task_comment":
      return "Comment added";
    case "assessment_submitted":
      return "Assessment submitted";
    case "manager_award":
      return "Manager recognition";
    default:
      return "Contribution";
  }
}

export default function Kudos() {
  const { user } = useAuth();
  const role = user?.role;

  const [loading, setLoading] = useState(true);
  const [kudosSummary, setKudosSummary] = useState<KudosSummary | null>(null);
  const [myKudos, setMyKudos] = useState<KudosContribution[]>([]);

  const [initiatives, setInitiatives] = useState<KudosInitiativeSummary[]>([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string>("");
  const [contributions, setContributions] = useState<KudosContribution[]>([]);
  const [orgUsers, setOrgUsers] = useState<AuthUser[]>([]);
  const [awardEmployeeId, setAwardEmployeeId] = useState<string>("");
  const [awardNote, setAwardNote] = useState("");
  const [awardBusy, setAwardBusy] = useState(false);
  const [awardError, setAwardError] = useState<string | null>(null);

  const isEmployee = role === "employee";

  const canGiveStars = role === "manager" || role === "admin" || role === "super_admin";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      if (isEmployee) {
        const [summary, list] = await Promise.all([getKudosSummary().catch(() => null), listMyKudos().catch(() => [])]);
        if (cancelled) return;
        setKudosSummary(summary);
        setMyKudos(Array.isArray(list) ? list : []);
        setLoading(false);
        return;
      }

      const initList = await listKudosInitiatives().catch(() => []);
      if (cancelled) return;
      const safe = Array.isArray(initList) ? initList : [];
      setInitiatives(safe);
      setSelectedInitiativeId(safe[0]?.initiativeId ?? "");
      setLoading(false);
    };

    run().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isEmployee]);

  useEffect(() => {
    if (isEmployee) return;
    listOrganizationUsers()
      .then((list) => setOrgUsers(Array.isArray(list) ? list : []))
      .catch(() => setOrgUsers([]));
  }, [isEmployee]);

  const employeeAwardOptions = useMemo(() => {
    const employees = orgUsers.filter((u) => u.role === "employee");
    if (role === "manager") {
      const my = new Set((user?.departments ?? []).map((d) => String(d).toLowerCase()));
      return employees
        .filter((u) => (u.departments ?? []).some((d) => my.has(String(d).toLowerCase())))
        .map((u) => ({ value: u._id, label: `${u.name} (${u.email})` }));
    }
    if (role === "admin" || role === "super_admin") {
      return employees.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` }));
    }
    return [];
  }, [orgUsers, role, user?.departments]);

  useEffect(() => {
    let cancelled = false;
    if (isEmployee) return;
    if (!selectedInitiativeId) {
      setContributions([]);
      return;
    }
    setLoading(true);
    listKudosContributions(selectedInitiativeId)
      .then((list) => {
        if (cancelled) return;
        setContributions(Array.isArray(list) ? (list as any) : []);
      })
      .catch(() => {
        if (cancelled) return;
        setContributions([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEmployee, selectedInitiativeId]);

  const initiativeSelectData = useMemo(
    () => initiatives.map((i) => ({ value: i.initiativeId, label: i.title })),
    [initiatives]
  );

  const handleCreateManagerAward = async () => {
    if (!selectedInitiativeId || !awardEmployeeId) return;
    setAwardBusy(true);
    setAwardError(null);
    try {
      await createManagerKudosAward({
        initiativeId: selectedInitiativeId,
        employeeId: awardEmployeeId,
        note: awardNote.trim() || undefined,
      });
      setAwardNote("");
      setAwardEmployeeId("");
      const list = await listKudosContributions(selectedInitiativeId);
      setContributions(Array.isArray(list) ? (list as KudosContribution[]) : []);
    } catch (e) {
      setAwardError(
        e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : "Could not create kudos.",
      );
    } finally {
      setAwardBusy(false);
    }
  };

  const handleGiveStar = async (contributionId: string) => {
    try {
      await giveManagerStar(contributionId);
      // Refresh current initiative contributions.
      if (!selectedInitiativeId) return;
      const list = await listKudosContributions(selectedInitiativeId);
      setContributions(Array.isArray(list) ? (list as any) : []);
    } catch {
      // Keep UX simple for now: ignore error, user can retry.
    }
  };

  return (
    <AdminLayout>
      <Box>
        <Title order={2} c="indigo" mb="md">
          Kudos
        </Title>

        {isEmployee ? (
          <>
            {import.meta.env.VITE_KUDOS_PLATFORM_URL && (
              <Card withBorder radius="md" p="md" mb="lg">
                <Group justify="space-between" align="center" wrap="wrap">
                  <Text size="sm" c="dimmed">
                    Company Kudos program (external)
                  </Text>
                  <Button
                    component="a"
                    href={import.meta.env.VITE_KUDOS_PLATFORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    variant="light"
                  >
                    Open platform
                  </Button>
                </Group>
              </Card>
            )}
            {kudosSummary && (
              <Card withBorder radius="lg" p="md" mb="lg">
                <Group justify="space-between" align="flex-start">
                  <Box>
                    <Text fw={800} mb={4}>
                      Total Stars
                    </Text>
                    <Text fz="xl" fw={900}>
                      {kudosSummary.totalStars}
                    </Text>
                    <Text size="sm" c="dimmed">
                      System: {kudosSummary.systemStars} • Manager: {kudosSummary.managerStars}
                    </Text>
                  </Box>
                  <Box>
                    <IconStarFilled size={28} color="#f59f00" />
                  </Box>
                </Group>
              </Card>
            )}

            <Stack gap="sm">
              {loading ? (
                <Text c="dimmed">Loading your kudos…</Text>
              ) : myKudos.length === 0 ? (
                <Text c="dimmed">No stars yet. When you complete contributions, stars will show up here.</Text>
              ) : (
                myKudos.map((c) => {
                  const total = (c.systemStars ?? 0) + (c.managerStars ?? 0);
                  return (
                    <Card key={c._id} withBorder radius="md" p="md" shadow="xs">
                      <Group justify="space-between" align="flex-start" mb={6}>
                        <Box>
                          <Text fw={800}>{contributionLabel(c.contributionType as KudosContributionType)}</Text>
                          {c.contributionTitle && <Text size="sm" c="dimmed">{c.contributionTitle}</Text>}
                          {c.contributionSubtitle && <Text size="xs" c="dimmed">{c.contributionSubtitle}</Text>}
                        </Box>
                        <Group gap={6}>
                          <IconStar size={16} color="#495057" />
                          <Text fw={900}>{total}</Text>
                        </Group>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {formatDate(c.createdAt)} • System {c.systemStars ?? 0}, Manager {c.managerStars ?? 0}
                      </Text>
                    </Card>
                  );
                })
              )}
            </Stack>
          </>
        ) : (
          <>
            <Tabs defaultValue="give">
              <Tabs.List>
                <Tabs.Tab value="give">Give Kudos</Tabs.Tab>
                {import.meta.env.VITE_KUDOS_PLATFORM_URL ? (
                  <Tabs.Tab value="external">Company Kudos program</Tabs.Tab>
                ) : null}
              </Tabs.List>

              <Tabs.Panel value="give" pt="md">
                <Stack gap="md">
                  <Card withBorder radius="lg" p="md">
                    <Title order={5} fw={800} mb="xs">
                      Recognize an employee
                    </Title>
                    <Text size="sm" c="dimmed" mb="md">
                      Give a manager star for great work on this initiative. This is separate from automatic stars
                      for tasks, comments, and assessments.
                    </Text>
                    <Stack gap="sm">
                      <Select
                        label="Employee"
                        placeholder="Choose employee"
                        data={employeeAwardOptions}
                        value={awardEmployeeId}
                        onChange={(v) => setAwardEmployeeId(v ?? "")}
                        searchable
                        disabled={!selectedInitiativeId}
                      />
                      <Textarea
                        label="Note (optional)"
                        placeholder="What are you recognizing them for?"
                        minRows={2}
                        value={awardNote}
                        onChange={(e) => setAwardNote(e.currentTarget.value)}
                        disabled={!selectedInitiativeId}
                      />
                      {awardError ? (
                        <Text size="sm" c="red">
                          {awardError}
                        </Text>
                      ) : null}
                      <Button
                        bg={THEME_BLUE}
                        loading={awardBusy}
                        disabled={!selectedInitiativeId || !awardEmployeeId}
                        onClick={() => void handleCreateManagerAward()}
                      >
                        Give kudos (manager star)
                      </Button>
                    </Stack>
                  </Card>

                  <Card withBorder radius="lg" p="md">
                    <Group justify="space-between" align="flex-end" wrap="wrap">
                      <Box>
                        <Text fw={800} mb={4}>
                          Select Initiative
                        </Text>
                        <Text size="sm" c="dimmed">
                          Managers can add one extra star (+1) per employee contribution.
                        </Text>
                      </Box>
                      <Select
                        label="Initiative"
                        placeholder="Choose initiative"
                        data={initiativeSelectData}
                        value={selectedInitiativeId}
                        onChange={(v) => setSelectedInitiativeId(v ?? "")}
                        searchable
                        w={280}
                      />
                    </Group>
                  </Card>

                  <Stack gap="sm">
                    {loading ? (
                      <Text c="dimmed">Loading contributions…</Text>
                    ) : contributions.length === 0 ? (
                      <Text c="dimmed">No contributions found for this initiative.</Text>
                    ) : (
                      contributions.map((c: any) => {
                        const canAward =
                          canGiveStars &&
                          (c.managerStars ?? 0) === 0 &&
                          c.contributionType !== "manager_award";
                        const total = (c.systemStars ?? 0) + (c.managerStars ?? 0);
                        return (
                          <Card key={c._id} withBorder radius="md" p="md" shadow="xs">
                            <Group justify="space-between" align="flex-start" mb={6}>
                              <Box>
                                <Text fw={900}>
                                  {c.employeeName ?? "Employee"} • {contributionLabel(c.contributionType as KudosContributionType)}
                                </Text>
                                {c.contributionTitle && <Text size="sm" c="dimmed">{c.contributionTitle}</Text>}
                                {c.contributionSubtitle && <Text size="xs" c="dimmed">{c.contributionSubtitle}</Text>}
                              </Box>
                              <Group gap="sm">
                                <Group gap={6}>
                                  <IconStar size={16} />
                                  <Text fw={900}>{total}</Text>
                                </Group>
                                {canAward && (
                                  <Button size="xs" onClick={() => handleGiveStar(c._id)}>
                                    Give +1 star
                                  </Button>
                                )}
                              </Group>
                            </Group>
                            <Text size="xs" c="dimmed">
                              {formatDate(c.createdAt)} • System {c.systemStars ?? 0}, Manager {c.managerStars ?? 0}
                            </Text>
                          </Card>
                        );
                      })
                    )}
                  </Stack>
                </Stack>
              </Tabs.Panel>

              {import.meta.env.VITE_KUDOS_PLATFORM_URL ? (
                <Tabs.Panel value="external" pt="md">
                  <Card withBorder radius="md" p="md">
                    <Text size="sm" c="dimmed" mb="md">
                      Open your organization&apos;s external recognition platform in a new tab.
                    </Text>
                    <Button
                      component="a"
                      href={import.meta.env.VITE_KUDOS_PLATFORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Kudos platform
                    </Button>
                  </Card>
                </Tabs.Panel>
              ) : null}
            </Tabs>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}

