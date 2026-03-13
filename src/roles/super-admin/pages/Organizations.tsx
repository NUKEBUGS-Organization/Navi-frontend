import SuperAdminLayout from "@/roles/super-admin/layout/SuperAdminLayout";
import { PageHeader } from "@/components";
import {
  Box,
  Card,
  Group,
  Text,
  Button,
  Table,
  TextInput,
  Modal,
  Stack,
  Divider,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import type { OrganizationSummary, OrganizationCreateInput } from "@/types";
import { slugify } from "@/utils";
import { THEME_BLUE } from "@/constants";
import { IconSearch } from "@tabler/icons-react";

const MOCK_ORGS: OrganizationSummary[] = [
  {
    id: "acme-inc",
    name: "Acme Inc.",
    adminName: "Sarah Jenkins",
    status: "ACTIVE",
    createdAt: "2025-01-10",
  },
  {
    id: "globex",
    name: "Globex Corp.",
    adminName: "Mark Thompson",
    status: "PENDING",
    createdAt: "2025-02-03",
  },
];

export default function Organizations() {
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState<OrganizationSummary[]>(MOCK_ORGS);
  const [createOpen, setCreateOpen] = useState(false);

  const createForm = useForm<OrganizationCreateInput>({
    initialValues: {
      organizationName: "",
      organizationOwner: "",
      organizationEmail: "",
      phoneNumber: "",
      adminEmail: "",
      adminPassword: "",
      city: "",
      country: "",
      industry: "",
      employeeCount: 0,
    },
    validate: {
      organizationName: (v) => (!v ? "Organization name is required" : null),
      organizationOwner: (v) => (!v ? "Owner is required" : null),
      organizationEmail: (v) => (!v ? "Email is required" : null),
      adminEmail: (v) => (!v ? "Admin email is required" : null),
      adminPassword: (v) => (!v ? "Admin password is required" : null),
    },
  });

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SuperAdminLayout>
      <PageHeader
        title="Organizations"
        subtitle="Review signup leads and manage live organizations"
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            bg={THEME_BLUE}
            radius="md"
            h={40}
            px="lg"
            fw={700}
          >
            Create Organization
          </Button>
        }
      />

      <Card withBorder radius="md" p="md" mb="lg" shadow="xs">
        <Group justify="space-between">
          <TextInput
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} color="#adb5bd" />}
            radius="md"
            styles={{
              input: {
                backgroundColor: "#FFFFFF",
                border: "1px solid #E9ECEF",
                maxWidth: 320,
              },
            }}
          />
        </Group>
      </Card>

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Organization"
        centered
        size="lg"
      >
        <form
          onSubmit={createForm.onSubmit((values) => {
            const id =
              slugify(values.organizationName || "organization") +
              "-" +
              Date.now().toString(36);
            const summary: OrganizationSummary = {
              id,
              name: values.organizationName,
              adminName: values.organizationOwner,
              status: "ACTIVE",
              createdAt: new Date().toLocaleDateString(),
            };
            setOrgs((prev) => [summary, ...prev]);
            setCreateOpen(false);
            createForm.reset();
          })}
        >
          <Stack gap="md">
            <Stack gap={4}>
              <Text fw={600} size="sm">
                Organization Name
              </Text>
              <TextInput
                placeholder="Acme Inc."
                {...createForm.getInputProps("organizationName")}
              />
            </Stack>
            <Stack gap={4}>
              <Text fw={600} size="sm">
                Organization Owner
              </Text>
              <TextInput
                placeholder="Owner full name"
                {...createForm.getInputProps("organizationOwner")}
              />
            </Stack>
            <Stack gap={4}>
              <Text fw={600} size="sm">
                Organization Email
              </Text>
              <TextInput
                placeholder="owner@company.com"
                {...createForm.getInputProps("organizationEmail")}
              />
            </Stack>
            <Stack gap={4}>
              <Text fw={600} size="sm">
                Phone Number
              </Text>
              <TextInput
                placeholder="+1 555 0123"
                {...createForm.getInputProps("phoneNumber")}
              />
            </Stack>

            <Divider label="Admin credentials" labelPosition="center" />

            <Stack gap={4}>
              <Text fw={600} size="sm">
                Admin Email
              </Text>
              <TextInput
                placeholder="admin@company.com"
                {...createForm.getInputProps("adminEmail")}
              />
            </Stack>
            <Stack gap={4}>
              <Text fw={600} size="sm">
                Admin Password
              </Text>
              <TextInput
                placeholder="Temporary password"
                type="password"
                {...createForm.getInputProps("adminPassword")}
              />
            </Stack>

            <Divider label="Location & details" labelPosition="center" />

            <Group grow align="flex-start">
              <Stack gap={4} style={{ flex: 1 }}>
                <Text fw={600} size="sm">
                  City
                </Text>
                <TextInput
                  placeholder="City"
                  {...createForm.getInputProps("city")}
                />
              </Stack>
              <Stack gap={4} style={{ flex: 1 }}>
                <Text fw={600} size="sm">
                  Country
                </Text>
                <TextInput
                  placeholder="Country"
                  {...createForm.getInputProps("country")}
                />
              </Stack>
            </Group>

            <Stack gap={4}>
              <Text fw={600} size="sm">
                Industry
              </Text>
              <TextInput
                placeholder="e.g., Technology, Healthcare"
                {...createForm.getInputProps("industry")}
              />
            </Stack>

            <Stack gap={4}>
              <Text fw={600} size="sm">
                Number of Employees
              </Text>
              <NumberInput
                min={0}
                placeholder="Approximate headcount"
                {...createForm.getInputProps("employeeCount")}
              />
            </Stack>

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Card withBorder radius="lg" shadow="xs">
        <Table.ScrollContainer minWidth={700}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  ORGANIZATION
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  ADMIN
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  STATUS
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  CREATED
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((org) => (
                <Table.Tr key={org.id}>
                  <Table.Td fw={600}>{org.name}</Table.Td>
                  <Table.Td>{org.adminName}</Table.Td>
                  <Table.Td>
                    <Text
                      size="sm"
                      fw={600}
                      c={
                        org.status === "ACTIVE"
                          ? "green.7"
                          : org.status === "PENDING"
                            ? "orange.7"
                            : "red.7"
                      }
                    >
                      {org.status}
                    </Text>
                  </Table.Td>
                  <Table.Td>{org.createdAt}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {filtered.length === 0 && (
          <Box p="md">
            <Text c="dimmed" size="sm">
              No organizations match your search.
            </Text>
          </Box>
        )}
      </Card>
    </SuperAdminLayout>
  );
}

