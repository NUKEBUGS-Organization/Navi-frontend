import { useEffect, useState } from "react";
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
  ActionIcon,
} from "@mantine/core";
import { IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { THEME_BLUE } from "@/constants";
import {
  listOrganizations,
  createOrganization,
  type OrganizationListItem,
  type CreateOrganizationPayload,
} from "@/api/organizations";
import type { ApiError } from "@/api/client";

export default function Organizations() {
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState<OrganizationListItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createForm = useForm<CreateOrganizationPayload>({
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
      departments: [""],
    },
    validate: {
      organizationName: (v) => (!v ? "Organization name is required" : null),
      organizationOwner: (v) => (!v ? "Owner is required" : null),
      organizationEmail: (v) => (!v ? "Email is required" : null),
      adminEmail: (v) => (!v ? "Admin email is required" : null),
      adminPassword: (v) => (!v ? "Admin password is required" : null),
    },
  });

  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrganizations();
      setOrgs(data);
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

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
          onSubmit={createForm.onSubmit(async (values) => {
            setCreateLoading(true);
            setError(null);
            try {
              const departments = (values.departments ?? [])
                .map((d) => d.trim())
                .filter(Boolean);
              await createOrganization({
                organizationName: values.organizationName,
                organizationOwner: values.organizationOwner,
                organizationEmail: values.organizationEmail,
                phoneNumber: values.phoneNumber || undefined,
                adminEmail: values.adminEmail,
                adminPassword: values.adminPassword,
                city: values.city || undefined,
                country: values.country || undefined,
                industry: values.industry || undefined,
                employeeCount: values.employeeCount,
                departments: departments.length ? departments : undefined,
              });
              setCreateOpen(false);
              createForm.reset();
              await fetchOrgs();
            } catch (err) {
              createForm.setFieldError(
                "adminEmail",
                (err as ApiError).message ?? "Failed to create organization"
              );
            } finally {
              setCreateLoading(false);
            }
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
                Departments
              </Text>
              {(createForm.values.departments ?? [""]).map((_, index) => (
                <Group key={index} gap="xs" align="flex-end">
                  <TextInput
                    placeholder="e.g. Engineering, HR, Sales"
                    style={{ flex: 1 }}
                    {...createForm.getInputProps(`departments.${index}`)}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() =>
                      createForm.removeListItem("departments", index)
                    }
                    disabled={(createForm.values.departments?.length ?? 0) <= 1}
                    title="Remove department"
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              ))}
              <Button
                type="button"
                variant="light"
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() =>
                  createForm.insertListItem("departments", "")
                }
              >
                Add department
              </Button>
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
              <Button variant="default" onClick={() => setCreateOpen(false)} disabled={createLoading}>
                Cancel
              </Button>
              <Button type="submit" loading={createLoading}>Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {error && (
        <Text c="red" size="sm" mb="md">
          {error}
        </Text>
      )}

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
                  DEPARTMENTS
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  EMPLOYEES
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
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">
                      Loading...
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((org) => (
                  <Table.Tr key={org.id}>
                    <Table.Td fw={600}>{org.name}</Table.Td>
                    <Table.Td>{org.adminName}</Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {org.departmentCount > 0
                          ? org.departments.join(", ")
                          : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{org.employeeCount ?? 0}</Text>
                    </Table.Td>
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
                    <Table.Td>
                      {typeof org.createdAt === "string"
                        ? org.createdAt
                        : new Date(org.createdAt).toLocaleDateString()}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {!loading && filtered.length === 0 && (
          <Box p="md">
            <Text c="dimmed" size="sm">
              {orgs.length === 0
                ? "No organizations yet. Create one to get started."
                : "No organizations match your search."}
            </Text>
          </Box>
        )}
      </Card>
    </SuperAdminLayout>
  );
}

