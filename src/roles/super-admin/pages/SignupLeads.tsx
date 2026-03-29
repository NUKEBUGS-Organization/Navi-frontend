import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SuperAdminLayout from "@/roles/super-admin/layout/SuperAdminLayout";
import { PageHeader } from "@/components";
import {
  Box,
  Button,
  Card,
  Table,
  Text,
  Badge,
  TextInput,
} from "@mantine/core";
import { IconSearch, IconBuildingPlus } from "@tabler/icons-react";
import { ROUTES, THEME_BLUE } from "@/constants";
import {
  listSignupLeads,
  type OrganizationSignupLead,
} from "@/api/organizations";
import type { ApiError } from "@/api/client";

export default function SignupLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<OrganizationSignupLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSignupLeads();
      setLeads(data);
    } catch (e) {
      setError((e as ApiError).message ?? "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const q = search.toLowerCase().trim();
  const filtered = q
    ? leads.filter(
        (l) =>
          l.organizationName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.organizationContact.toLowerCase().includes(q),
      )
    : leads;

  const openCreateFromLead = (lead: OrganizationSignupLead) => {
    navigate(`${ROUTES.SUPER_ADMIN_ORGS}?leadId=${encodeURIComponent(lead.id)}`);
  };

  return (
    <SuperAdminLayout>
      <PageHeader
        title="Signup leads"
        subtitle="Public organization requests — open create organization with fields pre-filled"
        actions={
          <Button variant="light" onClick={load} loading={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Text c="red" size="sm" mb="md">
          {error}
        </Text>
      )}

      <Card withBorder radius="md" p="md" mb="lg" shadow="xs">
        <TextInput
          placeholder="Search by organization, contact, or email..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          leftSection={<IconSearch size={16} color="#adb5bd" />}
          radius="md"
          styles={{
            input: {
              backgroundColor: "#FFFFFF",
              border: "1px solid #E9ECEF",
              maxWidth: 360,
            },
          }}
        />
      </Card>

      <Card withBorder radius="lg" shadow="xs">
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  ORGANIZATION
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  CONTACT
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  EMAIL
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  STATUS
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  SUBMITTED
                </Table.Th>
                <Table.Th c="dimmed" fw={800} fz={10} lts={1}>
                  ACTION
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
                filtered.map((lead) => (
                  <Table.Tr key={lead.id}>
                    <Table.Td fw={600}>{lead.organizationName}</Table.Td>
                    <Table.Td>{lead.organizationContact}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{lead.email}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={lead.status === "converted" ? "green" : "orange"}
                        variant="light"
                      >
                        {lead.status === "converted" ? "Converted" : "New"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(lead.createdAt).toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        leftSection={<IconBuildingPlus size={14} />}
                        bg={THEME_BLUE}
                        disabled={lead.status === "converted"}
                        onClick={() => openCreateFromLead(lead)}
                      >
                        Create org
                      </Button>
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
              {leads.length === 0
                ? "No signup leads yet."
                : "No leads match your search."}
            </Text>
          </Box>
        )}
      </Card>
    </SuperAdminLayout>
  );
}
