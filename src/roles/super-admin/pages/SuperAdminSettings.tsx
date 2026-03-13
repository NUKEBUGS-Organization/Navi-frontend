import SuperAdminLayout from "@/roles/super-admin/layout/SuperAdminLayout";
import { PageHeader } from "@/components";
import {
  Box,
  Card,
  Grid,
  Stack,
  Text,
  Switch,
  TextInput,
  Textarea,
  Button,
  Group,
} from "@mantine/core";
import { useState } from "react";

export default function SuperAdminSettings() {
  const [allowLeads, setAllowLeads] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [supportEmail, setSupportEmail] = useState("support@navi-platform.com");
  const [billingEmail, setBillingEmail] = useState("billing@navi-platform.com");
  const [notes, setNotes] = useState("");

  return (
    <SuperAdminLayout>
      <PageHeader
        title="Platform Settings"
        subtitle="Control how organizations sign up and how the platform is managed"
      />

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Text fw={700} mb="sm">
              Signup & provisioning
            </Text>
            <Text c="dimmed" size="sm" mb="md">
              Configure how new organizations enter the system and how they are
              approved.
            </Text>
            <Stack gap="md">
              <Switch
                checked={allowLeads}
                onChange={(e) => setAllowLeads(e.currentTarget.checked)}
                label="Allow public organization request form"
                description="Controls whether the /signup lead form is accessible."
              />
              <Switch
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.currentTarget.checked)}
                label="Require manual approval for new organizations"
                description="When enabled, super admins must review and create organizations from leads."
              />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="lg" p="xl" shadow="xs">
            <Text fw={700} mb="sm">
              Contact & billing
            </Text>
            <Text c="dimmed" size="sm" mb="md">
              Where notifications and invoices should be routed.
            </Text>
            <Stack gap="md">
              <TextInput
                label="Support email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.currentTarget.value)}
              />
              <TextInput
                label="Billing email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.currentTarget.value)}
              />
              <Textarea
                label="Internal notes"
                placeholder="Add internal notes about billing, contracts, etc."
                minRows={3}
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
              />
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Box mt="xl">
        <Group justify="flex-end">
          <Button variant="default">Discard changes</Button>
          <Button>Save changes</Button>
        </Group>
      </Box>
    </SuperAdminLayout>
  );
}

