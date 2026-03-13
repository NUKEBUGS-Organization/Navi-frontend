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

export default function SuperAdminDashboard() {
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
              <Badge color="blue" variant="light" fw={700}>
                +3 this month
              </Badge>
            </Group>
            <Title order={2} fw={800}>
              24
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
              <Badge color="orange" variant="light" fw={700}>
                Review needed
              </Badge>
            </Group>
            <Title order={2} fw={800}>
              5
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
              <Text fw={700}>Recent signup leads</Text>
              <Badge variant="light" color="gray" fw={700}>
                Sample data
              </Badge>
            </Group>
            <Stack gap="sm">
              {[
                { name: "Nova Health Systems", contact: "alex@novahealth.io", country: "US" },
                { name: "Bright Retail Group", contact: "ops@brightretail.com", country: "UK" },
                { name: "Skyline Banking", contact: "change@skylinebank.eu", country: "DE" },
              ].map((lead) => (
                <Group
                  key={lead.name}
                  justify="space-between"
                  style={{ borderBottom: "1px solid #f1f3f5", paddingBottom: 8 }}
                >
                  <Stack gap={0}>
                    <Text fw={600}>{lead.name}</Text>
                    <Text size="xs" c="dimmed">
                      {lead.contact}
                    </Text>
                  </Stack>
                  <Text size="xs" c="dimmed">
                    {lead.country}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Text fw={700} mb="sm">
              Platform health
            </Text>
            <Text c="dimmed" size="sm" mb="md">
              High-level view of uptime and usage (sample values).
            </Text>
            <Stack gap="md">
              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">Uptime (30 days)</Text>
                  <Text size="sm" fw={600}>
                    99.9%
                  </Text>
                </Group>
                <Progress value={99.9} color="teal" radius="xl" />
              </Box>
              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">Org adoption</Text>
                  <Text size="sm" fw={600}>
                    78%
                  </Text>
                </Group>
                <Progress value={78} color="blue" radius="xl" />
              </Box>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </SuperAdminLayout>
  );
}

