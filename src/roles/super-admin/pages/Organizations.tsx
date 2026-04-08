import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  UnstyledButton,
  Badge,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { ROUTES, THEME_BLUE } from "@/constants";
import {
  listOrganizations,
  createOrganization,
  getSignupLead,
  approveOrganizationEmployeeCount,
  type OrganizationListItem,
  type CreateOrganizationPayload,
} from "@/api/organizations";
import type { ApiError } from "@/api/client";

type CreateOrgFormValues = Omit<CreateOrganizationPayload, "departments" | "sourceLeadId">;

export default function Organizations() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState<OrganizationListItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceLeadId, setSourceLeadId] = useState<string | null>(null);
  const [detailOrg, setDetailOrg] = useState<OrganizationListItem | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const createForm = useForm<CreateOrgFormValues>({
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
      organizationEmail: (v) => (!v ? "Organization admin email is required" : null),
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

  const leadIdParam = searchParams.get("leadId");
  useEffect(() => {
    if (!leadIdParam) return;
    let cancelled = false;
    getSignupLead(leadIdParam)
      .then((lead) => {
        if (cancelled) return;
        const ec = parseInt(lead.employeeCount ?? "", 10);
        createForm.setValues({
          organizationName: lead.organizationName,
          organizationOwner: lead.organizationContact,
          organizationEmail: lead.email,
          adminEmail: lead.email,
          phoneNumber: lead.phoneNumber ?? "",
          adminPassword: "",
          city: lead.city ?? "",
          country: lead.country ?? "",
          industry: lead.industry ?? "",
          employeeCount: Number.isNaN(ec) ? 0 : ec,
        });
        setSourceLeadId(lead.id);
        setCreateOpen(true);
        const next = new URLSearchParams(searchParams);
        next.delete("leadId");
        setSearchParams(next, { replace: true });
      })
      .catch(() => {
        setError("Could not load signup lead.");
        navigate(ROUTES.SUPER_ADMIN_ORGS, { replace: true });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open-once from query
  }, [leadIdParam]);

  const q = search.toLowerCase();
  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      (o.industry ?? "").toLowerCase().includes(q) ||
      (o.adminName ?? "").toLowerCase().includes(q),
  );

  return (
    <SuperAdminLayout>
      <PageHeader
        title="Organizations"
        subtitle="Provision workspaces from signup leads or create organizations manually"
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
        onClose={() => {
          setCreateOpen(false);
          setSourceLeadId(null);
          createForm.reset();
        }}
        title="Create Organization"
        centered
        size="lg"
      >
        <form
          onSubmit={createForm.onSubmit(async (values) => {
            setCreateLoading(true);
            setError(null);
            try {
              await createOrganization({
                organizationName: values.organizationName,
                organizationOwner: values.organizationOwner,
                organizationEmail: values.organizationEmail,
                phoneNumber: values.phoneNumber || undefined,
                adminEmail: values.organizationEmail,
                adminPassword: values.adminPassword,
                city: values.city || undefined,
                country: values.country || undefined,
                industry: values.industry || undefined,
                employeeCount: values.employeeCount,
                sourceLeadId: sourceLeadId ?? undefined,
              });
              setCreateOpen(false);
              setSourceLeadId(null);
              createForm.reset();
              await fetchOrgs();
            } catch (err) {
              createForm.setFieldError(
                "organizationEmail",
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
                Organization admin email
              </Text>
              <Text size="xs" c="dimmed">
                Used for organization contact and the new admin&apos;s login.
              </Text>
              <TextInput
                placeholder="contact@company.com"
                type="email"
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
                Temporary admin password
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

            <Text size="sm" c="dimmed">
              Departments are configured by the organization admin after activation (Organization → profile /
              settings), not at provisioning time.
            </Text>

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

      <Modal
        opened={detailOrg != null}
        onClose={() => setDetailOrg(null)}
        title="Organization details"
        centered
        size="md"
      >
        {detailOrg && (
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600} c="dimmed" size="sm">
                Name
              </Text>
              <Text fw={700}>{detailOrg.name}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600} c="dimmed" size="sm">
                Organization admin
              </Text>
              <Text>{detailOrg.adminName}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600} c="dimmed" size="sm">
                Contact email
              </Text>
              <Text size="sm">{detailOrg.email ?? "—"}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600} c="dimmed" size="sm">
                Industry
              </Text>
              <Text size="sm">{detailOrg.industry ?? "—"}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600} c="dimmed" size="sm">
                Country
              </Text>
              <Text size="sm">{detailOrg.country ?? "—"}</Text>
            </Group>
            <Group justify="space-between" align="flex-start">
              <Text fw={600} c="dimmed" size="sm">
                Departments
              </Text>
              <Text size="sm" maw={280} ta="right">
                {detailOrg.departmentCount > 0 ? detailOrg.departments.join(", ") : "—"}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600} c="dimmed" size="sm">
                Employees (reported)
              </Text>
              <Text>{detailOrg.employeeCount ?? 0}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600} c="dimmed" size="sm">
                Status
              </Text>
              <Text fw={600}>{detailOrg.status}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600} c="dimmed" size="sm">
                Created
              </Text>
              <Text size="sm">
                {typeof detailOrg.createdAt === "string"
                  ? new Date(detailOrg.createdAt).toLocaleString()
                  : new Date(detailOrg.createdAt).toLocaleString()}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>

      {error && (
        <Text c="red" size="sm" mb="md">
          {error}
        </Text>
      )}

      <Card withBorder radius="lg" shadow="xs">
        <Table.ScrollContainer minWidth={800}>
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
                  INDUSTRY
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
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  ACTIONS
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">
                      Loading...
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((org) => (
                  <Table.Tr key={org.id}>
                    <Table.Td>
                      <UnstyledButton onClick={() => setDetailOrg(org)} py={4}>
                        <Text fw={600} c={THEME_BLUE} style={{ textDecoration: "underline" }}>
                          {org.name}
                        </Text>
                      </UnstyledButton>
                    </Table.Td>
                    <Table.Td>{org.adminName}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{org.industry ?? "—"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {org.departmentCount > 0
                          ? org.departments.join(", ")
                          : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="wrap">
                        <Text size="sm">{org.employeeCount ?? 0}</Text>
                        {org.pendingEmployeeCount != null && org.pendingEmployeeCount !== org.employeeCount && (
                          <Badge size="sm" color="orange" variant="light">
                            Pending: {org.pendingEmployeeCount}
                          </Badge>
                        )}
                      </Group>
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
                    <Table.Td>
                      {org.pendingEmployeeCount != null &&
                      org.pendingEmployeeCount !== (org.employeeCount ?? 0) ? (
                        <Button
                          size="xs"
                          variant="light"
                          color="teal"
                          loading={approvingId === org.id}
                          onClick={async () => {
                            setApprovingId(org.id);
                            try {
                              await approveOrganizationEmployeeCount(org.id);
                              await fetchOrgs();
                            } finally {
                              setApprovingId(null);
                            }
                          }}
                        >
                          Approve headcount
                        </Button>
                      ) : (
                        "—"
                      )}
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

