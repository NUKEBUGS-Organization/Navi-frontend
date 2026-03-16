import { useEffect, useState } from "react";
import SuperAdminLayout from "@/roles/super-admin/layout/SuperAdminLayout";
import { PageHeader } from "@/components";
import {
  Box,
  Card,
  Grid,
  Group,
  Text,
  Title,
  Progress,
  Stack,
  Badge,
} from "@mantine/core";
import { IconBuilding, IconUserPlus } from "@tabler/icons-react";
import { listOrganizations, type OrganizationListItem } from "@/api/organizations";

export default function SuperAdminDashboard() {
  const [orgs, setOrgs] = useState<OrganizationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listOrganizations()
      .then((data) => {
        if (!cancelled) setOrgs(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const activeCount = orgs.filter((o) => o.status === "ACTIVE").length;
  const pendingCount = orgs.filter((o) => o.status === "PENDING").length;
  const newThisMonth = orgs.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const recentOrgs = orgs.slice(0, 5);
  const adoptionPct = orgs.length > 0 ? Math.round((activeCount / orgs.length) * 100) : 0;

  return (
    <SuperAdminLayout>
      <PageHeader
        title="Super Admin Overview"
        subtitle="Monitor organizations, signup requests, and platform health"
      />
      <Grid mb="xl" gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Group justify="space-between" mb="sm">
              <Group gap="sm">
                <IconBuilding size={22} color="#0f2b5c" />
                <Text fw={700}>Active organizations</Text>
              </Group>
              {newThisMonth > 0 && (
                <Badge color="blue" variant="light" fw={700}>
                  +{newThisMonth} this month
                </Badge>
              )}
            </Group>
            <Title order={2} fw={800}>
              {loading ? "—" : activeCount}
            </Title>
            <Text c="dimmed" size="sm">
              Organizations currently provisioned on the platform.
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Group justify="space-between" mb="sm">
              <Group gap="sm">
                <IconUserPlus size={22} color="#0f2b5c" />
                <Text fw={700}>Pending signup leads</Text>
              </Group>
              {pendingCount > 0 && (
                <Badge color="orange" variant="light" fw={700}>
                  Review needed
                </Badge>
              )}
            </Group>
            <Title order={2} fw={800}>
              {loading ? "—" : pendingCount}
            </Title>
            <Text c="dimmed" size="sm">
              Organization requests waiting for manual review and approval.
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Group justify="space-between" mb="md">
              <Text fw={700}>Recent organizations</Text>
              {!loading && (
                <Badge variant="light" color="gray" fw={700}>
                  {orgs.length} total
                </Badge>
              )}
            </Group>
            <Stack gap="sm">
              {loading ? (
                <Text c="dimmed" size="sm">
                  Loading...
                </Text>
              ) : recentOrgs.length === 0 ? (
                <Text c="dimmed" size="sm">
                  No organizations yet.
                </Text>
              ) : (
                recentOrgs.map((org) => (
                  <Group
                    key={org.id}
                    justify="space-between"
                    style={{ borderBottom: "1px solid #f1f3f5", paddingBottom: 8 }}
                  >
                    <Stack gap={0}>
                      <Text fw={600}>{org.name}</Text>
                      <Text size="xs" c="dimmed">
                        {org.email ?? org.adminName}
                      </Text>
                    </Stack>
                    <Text size="xs" c="dimmed">
                      {org.country ?? "—"}
                    </Text>
                  </Group>
                ))
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Text fw={700} mb="sm">
              Platform health
            </Text>
            <Text c="dimmed" size="sm" mb="md">
              Overview of organizations and status.
            </Text>
            <Stack gap="md">
              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">Total organizations</Text>
                  <Text size="sm" fw={600}>
                    {loading ? "—" : orgs.length}
                  </Text>
                </Group>
                <Progress
                  value={loading ? 0 : (orgs.length > 0 ? 100 : 0)}
                  color="teal"
                  radius="xl"
                />
              </Box>
              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">Active (adoption)</Text>
                  <Text size="sm" fw={600}>
                    {loading ? "—" : `${adoptionPct}%`}
                  </Text>
                </Group>
                <Progress
                  value={loading ? 0 : adoptionPct}
                  color="blue"
                  radius="xl"
                />
              </Box>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </SuperAdminLayout>
  );
}

