import { useEffect, useState } from "react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  Tabs,
  rem,
  Card,
  Badge,
  Avatar,
  Stack,
  TextInput,
  Select,
  Grid,
  Divider,
  ActionIcon,
  Table,
  SimpleGrid,
  Center,
  Modal,
  UnstyledButton,
  MultiSelect,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconSearch,
  IconChevronRight,
  IconDotsVertical,
  IconPlus,
  IconUserPlus,
  IconChevronDown,
  IconMail,
  IconBuilding,
  IconCircle,
  IconPencil,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { THEME_BLUE, TEAL_BLUE } from "@/constants";
import { PageHeader } from "@/components";
import {
  getMyOrganization,
  updateMyOrganization,
  type MyOrganization,
  type UpdateOrganizationPayload,
} from "@/api/organizations";
import {
  listOrganizationUsers,
  createUser,
  updateUser,
  deleteUser,
  type AuthUser,
  type UserRole,
} from "@/api/auth";
import type { ApiError } from "@/api/client";

interface MemberRowProps {
  name: string;
  email: string;
  role: string;
  dept: string;
  status: "Active" | "Pending";
  date: string;
  member?: AuthUser;
  onEdit?: (member: AuthUser) => void;
  onDelete?: (member: AuthUser) => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: "admin", label: "Admin", desc: "Full access to organization settings and can add admins, managers, and employees." },
  { value: "manager", label: "Manager", desc: "Manage teams and assigned projects." },
  { value: "employee", label: "Employee", desc: "Access to assigned projects and shared assets only." },
];

type RoleFilter = "all" | "admin" | "manager" | "employee";

export default function AdminOrganization() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [editingMember, setEditingMember] = useState<AuthUser | null>(null);
  const [deletingMember, setDeletingMember] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<MyOrganization | null>(null);
  const [members, setMembers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [memberSearch, setMemberSearch] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileIndustry, setProfileIndustry] = useState("");
  const [profileEmployeeCount, setProfileEmployeeCount] = useState<number>(0);
  const [profileEmail, setProfileEmail] = useState("");
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [addDeptOpened, { open: openAddDept, close: closeAddDept }] = useDisclosure(false);
  const [newDeptName, setNewDeptName] = useState("");

  const orgMembers = members.filter((m) => m.role !== "super_admin");
  const admins = orgMembers.filter((m) => m.role === "admin");
  const managers = orgMembers.filter((m) => m.role === "manager");
  const employees = orgMembers.filter((m) => m.role === "employee");
  const filteredMembers = orgMembers.filter((m) => {
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgData, usersData] = await Promise.all([
        getMyOrganization(),
        listOrganizationUsers(),
      ]);
      setOrg(orgData);
      setMembers(usersData);
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (org) {
      setProfileName(org.name ?? "");
      setProfileIndustry(org.industry ?? "");
      setProfileEmployeeCount(org.employeeCount ?? 0);
      setProfileEmail(org.email ?? "");
      setDepartmentsList(org.departments ?? []);
    }
  }, [org]);

  const handleInviteSuccess = () => {
    close();
    fetchData();
  };

  const handleEditClick = (member: AuthUser) => {
    setEditingMember(member);
    openEdit();
  };

  const handleEditSuccess = () => {
    setEditingMember(null);
    closeEdit();
    fetchData();
  };

  const handleDeleteClick = (member: AuthUser) => {
    setDeletingMember(member);
    openDelete();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMember) return;
    try {
      await deleteUser(deletingMember._id);
      setDeletingMember(null);
      closeDelete();
      fetchData();
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to delete user");
    }
  };

  const handleProfileDiscard = () => {
    if (org) {
      setProfileName(org.name ?? "");
      setProfileIndustry(org.industry ?? "");
      setProfileEmployeeCount(org.employeeCount ?? 0);
      setProfileEmail(org.email ?? "");
      setDepartmentsList(org.departments ?? []);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setError(null);
    try {
      const payload: UpdateOrganizationPayload = {
        name: profileName.trim() || undefined,
        industry: profileIndustry.trim() || undefined,
        employeeCount: profileEmployeeCount,
        email: profileEmail.trim() || undefined,
        departments: departmentsList.filter((d) => d.trim()).map((d) => d.trim()),
      };
      await updateMyOrganization(payload);
      await fetchData();
    } catch (err) {
      setError((err as ApiError).message ?? "Failed to update organization");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddDepartment = () => {
    const name = newDeptName.trim();
    if (name && !departmentsList.includes(name)) {
      setDepartmentsList((prev) => [...prev, name]);
      setNewDeptName("");
      closeAddDept();
    }
  };

  const handleRemoveDepartment = (title: string) => {
    setDepartmentsList((prev) => prev.filter((d) => d !== title));
  };

  return (
    <AdminLayout>
      <Box style={{ width: "100%" }}>
        <PageHeader
          title="Organization"
          actions={
            <Badge variant="light" color="teal" radius="sm" fw={800} size="sm">
              ENTERPRISE
            </Badge>
          }
        />

        <Tabs
          defaultValue="profile"
          variant="pills"
          mb={40}
          styles={{
            tab: {
              border: "none",
              backgroundColor: "transparent",
              fontWeight: 700,
              fontSize: rem(15),
              color: "#94A3B8",
              borderRadius: 0,
              paddingBottom: rem(12),
              borderBottom: "3px solid transparent",
              "&[data-active]": {
                color: THEME_BLUE,
                borderBottom: `3px solid ${THEME_BLUE}`,
                backgroundColor: "transparent",
              },
            },
          }}
        ></Tabs>

        <Grid gutter={30} mb={50}>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              withBorder
              radius="lg"
              p={40}
              shadow="xs"
              h="100%"
              ta="center"
            >
              <Center mb="xl">
                <Box
                  style={{
                    width: rem(140),
                    height: rem(140),
                    border: "2px dashed #dee2e6",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: THEME_BLUE,
                  }}
                >
                  <Text c="white" fw={900} fz="xs" ta="center" px="md">
                    ACME LOGO
                  </Text>
                </Box>
              </Center>
              <Title order={3} fw={800} mb={5}>
                {loading ? "—" : org?.name ?? "—"}
              </Title>
              <Text c="dimmed" fz="sm" fw={500} mb="xl">
                {loading ? "—" : org?.industry ?? "—"}
              </Text>
              <Button
                variant="outline"
                color="gray.3"
                c="dark"
                radius="md"
                fullWidth
                h={45}
                fw={700}
              >
                Edit Identity
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder radius="lg" p={0} shadow="xs">
              <Box p="xl">
                <Group justify="space-between" mb="xl">
                  <Title order={4} fw={800}>
                    General Information
                  </Title>
                  <Text fz="xs" c="dimmed" fw={600}>
                    Edit and save to update your organization profile
                  </Text>
                </Group>
                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <FormLabel label="ORGANIZATION NAME" />
                    <TextInput
                      value={profileName}
                      onChange={(e) => setProfileName(e.currentTarget.value)}
                      placeholder="Organization name"
                      radius="md"
                      size="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <FormLabel label="INDUSTRY" />
                    <TextInput
                      value={profileIndustry}
                      onChange={(e) => setProfileIndustry(e.currentTarget.value)}
                      placeholder="e.g. Technology & Software"
                      radius="md"
                      size="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <FormLabel label="COMPANY SIZE (number of employees)" />
                    <TextInput
                      type="number"
                      min={0}
                      value={profileEmployeeCount === 0 ? "" : String(profileEmployeeCount)}
                      onChange={(e) => setProfileEmployeeCount(Math.max(0, parseInt(e.currentTarget.value, 10) || 0))}
                      placeholder="0"
                      radius="md"
                      size="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <FormLabel label="PRIMARY CONTACT EMAIL" />
                    <TextInput
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.currentTarget.value)}
                      placeholder="contact@organization.com"
                      radius="md"
                      size="md"
                    />
                  </Grid.Col>
                </Grid>
              </Box>
              <Divider color="#f1f3f5" />
              <Box p="lg">
                <Group justify="flex-end" gap="md">
                  <Button variant="transparent" c="gray.6" fw={700} onClick={handleProfileDiscard}>
                    Discard
                  </Button>
                  <Button bg={THEME_BLUE} radius="md" px={30} fw={700} onClick={handleProfileSave} loading={profileSaving}>
                    Save Changes
                  </Button>
                </Group>
              </Box>
            </Card>
          </Grid.Col>
        </Grid>

        <Group justify="space-between" mb="xl">
          <Title order={3} fw={800}>
            Departments
          </Title>
          <Button
            variant="transparent"
            color="teal"
            leftSection={<IconPlus size={18} />}
            fw={800}
            onClick={openAddDept}
          >
            Add Department
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mb={50}>
          {departmentsList.length > 0 ? (
            departmentsList.map((title, i) => (
              <DepartmentCard
                key={title}
                title={title}
                members={orgMembers.length}
                color={["blue", "teal", "grape"][i % 3]}
                onRemove={handleRemoveDepartment}
              />
            ))
          ) : (
            <Text c="dimmed" size="sm">
              No departments yet. Add one above, then click Save Changes in General Information to persist.
            </Text>
          )}
        </SimpleGrid>

        <Modal opened={addDeptOpened} onClose={() => { closeAddDept(); setNewDeptName(""); }} title="Add Department" centered>
          <Stack gap="md">
            <TextInput
              label="Department name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.currentTarget.value)}
              placeholder="e.g. Engineering"
              onKeyDown={(e) => e.key === "Enter" && handleAddDepartment()}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => { closeAddDept(); setNewDeptName(""); }}>Cancel</Button>
              <Button color="teal" onClick={handleAddDepartment} disabled={!newDeptName.trim()}>Add</Button>
            </Group>
          </Stack>
        </Modal>

        <Group justify="space-between" mb="md" wrap="wrap">
          <Title order={3} fw={800}>
            Team Members
          </Title>
          <Group gap="md">
            <TextInput
              placeholder="Search by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              radius="md"
              w={{ base: "100%", sm: 260 }}
            />
            <Select
              value={roleFilter}
              onChange={(v) => setRoleFilter((v as RoleFilter) ?? "all")}
              data={[
                { value: "all", label: "All roles" },
                { value: "admin", label: "Admins" },
                { value: "manager", label: "Managers" },
                { value: "employee", label: "Employees" },
              ]}
              radius="md"
              w={140}
            />
            <Button
              onClick={open}
              leftSection={<IconUserPlus size={18} />}
              bg={THEME_BLUE}
              radius="md"
              fw={700}
            >
              Add Staff
            </Button>
          </Group>
        </Group>
        <Group gap="lg" mb="xl">
          <Badge variant="light" color="blue" size="lg" radius="sm">
            {admins.length} Admin{admins.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="light" color="teal" size="lg" radius="sm">
            {managers.length} Manager{managers.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="light" color="grape" size="lg" radius="sm">
            {employees.length} Employee{employees.length !== 1 ? "s" : ""}
          </Badge>
        </Group>

        <Card withBorder radius="lg" p={0} shadow="sm">
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="lg" horizontalSpacing="xl">
              <Table.Thead bg="#f8f9fa">
                <Table.Tr>
                  <Table.Th fz={10} fw={800} c="dimmed" lts={1}>
                    USER
                  </Table.Th>
                  <Table.Th fz={10} fw={800} c="dimmed" lts={1}>
                    ROLE
                  </Table.Th>
                  <Table.Th fz={10} fw={800} c="dimmed" lts={1}>
                    DEPARTMENT
                  </Table.Th>
                  <Table.Th fz={10} fw={800} c="dimmed" lts={1}>
                    STATUS
                  </Table.Th>
                  <Table.Th fz={10} fw={800} c="dimmed" lts={1}>
                    JOINED
                  </Table.Th>
                  <Table.Th />
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
                ) : orgMembers.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text c="dimmed" size="sm" ta="center" py="lg">
                        No team members yet. Invite users to get started.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : filteredMembers.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text c="dimmed" size="sm" ta="center" py="lg">
                        No members match the current filter.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredMembers.map((m) => (
                    <MemberRow
                      key={m._id}
                      name={m.name}
                      email={m.email}
                      role={m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                      dept={m.departments?.length ? m.departments.join(", ") : "—"}
                      status={m.isActive !== false ? "Active" : "Pending"}
                      date={
                        (m as AuthUser & { createdAt?: string }).createdAt
                          ? new Date((m as AuthUser & { createdAt?: string }).createdAt).toLocaleDateString()
                          : "—"
                      }
                      member={m}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

        {error && (
          <Text c="red" size="sm" mb="md">
            {error}
          </Text>
        )}
        <InviteUserModal
          opened={opened}
          onClose={close}
          onSuccess={handleInviteSuccess}
          orgDepartments={org?.departments ?? []}
        />
        <EditStaffModal
          opened={editOpened}
          onClose={() => {
            setEditingMember(null);
            closeEdit();
          }}
          onSuccess={handleEditSuccess}
          member={editingMember}
          orgDepartments={org?.departments ?? []}
        />
        <Modal
          opened={deleteOpened}
          onClose={() => {
            setDeletingMember(null);
            closeDelete();
          }}
          title="Remove staff member?"
          centered
          radius="lg"
        >
          <Text size="sm" c="dimmed" mb="md">
            {deletingMember
              ? `Remove ${deletingMember.name} from the team? This cannot be undone.`
              : ""}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => {
                setDeletingMember(null);
                closeDelete();
              }}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Box>
    </AdminLayout>
  );
}

function InviteUserModal({
  opened,
  onClose,
  onSuccess,
  orgDepartments,
}: {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgDepartments: string[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    departments: string[];
  }>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
      departments: [],
    },
    validate: {
      name: (v) => (!v?.trim() ? "Name is required" : null),
      email: (v) => (!v?.trim() ? "Email is required" : null),
      password: (v) => (!v?.trim() ? "Password is required" : null),
    },
  });

  const handleClose = () => {
    form.reset();
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        departments: values.departments ?? [],
      });
      onSuccess();
      handleClose();
    } catch (err) {
      setSubmitError((err as ApiError).message ?? "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="md"
      radius="lg"
      padding={0}
      withCloseButton
      styles={{
        header: { position: "absolute", right: 20, top: 20, zIndex: 100 },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box p={30}>
          <Group gap="md" mb={30}>
            <Box
              p={8}
              bg="#f1f3f5"
              style={{ borderRadius: "8px", display: "flex" }}
            >
              <IconUserPlus size={22} color={THEME_BLUE} stroke={2} />
            </Box>
            <Title order={3} fw={800}>
              Add Staff
            </Title>
          </Group>
          <Stack gap="xl">
            <TextInput
              label={
                <Text fw={700} fz="sm" mb={8}>
                  Full Name
                </Text>
              }
              placeholder="Jane Doe"
              radius="md"
              size="md"
              {...form.getInputProps("name")}
            />
            <TextInput
              label={
                <Text fw={700} fz="sm" mb={8}>
                  Email Address
                </Text>
              }
              placeholder="name@company.com"
              type="email"
              leftSection={<IconMail size={18} color="#adb5bd" />}
              radius="md"
              size="md"
              {...form.getInputProps("email")}
            />
            <TextInput
              label={
                <Text fw={700} fz="sm" mb={8}>
                  Password
                </Text>
              }
              placeholder="Temporary password"
              type="password"
              radius="md"
              size="md"
              {...form.getInputProps("password")}
            />
            <Box>
              <Text fw={700} fz="sm" mb={10}>
                Role
              </Text>
              <Stack gap="md">
                {ROLE_OPTIONS.map((opt) => (
                  <RoleOption
                    key={opt.value}
                    active={form.values.role === opt.value}
                    title={opt.label}
                    desc={opt.desc}
                    onClick={() => form.setFieldValue("role", opt.value)}
                  />
                ))}
              </Stack>
            </Box>
            {orgDepartments.length > 0 && (
              <MultiSelect
                label={
                  <Text fw={700} fz="sm" mb={8}>
                    Department(s)
                  </Text>
                }
                placeholder="Select department(s)"
                data={orgDepartments}
                value={form.values.departments}
                onChange={(v) => form.setFieldValue("departments", v)}
                radius="md"
                size="md"
              />
            )}
          </Stack>
          {submitError && (
            <Text c="red" size="sm" mt="sm">
              {submitError}
            </Text>
          )}
        </Box>
        <Divider color="#f1f3f5" />
        <Box p={25} bg="white">
          <Group justify="flex-end" gap="xl">
            <Button
              type="button"
              variant="transparent"
              c="gray.6"
              fw={700}
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              bg={TEAL_BLUE}
              radius="md"
              h={45}
              px={30}
              fw={700}
              loading={submitting}
            >
              Add User
            </Button>
          </Group>
        </Box>
      </form>
      <Center pb="md">
        <Text fz={9} fw={800} c="gray.4" lts={1.5}>
          POWERED BY NAVI
        </Text>
      </Center>
    </Modal>
  );
}

function RoleOption({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <UnstyledButton
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        border: active ? `2px solid ${TEAL_BLUE}` : "1px solid #dee2e6",
        transition: "0.2s",
      }}
    >
      <Group gap="md" align="flex-start" wrap="nowrap">
        {active ? (
          <Box
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: `5px solid ${TEAL_BLUE}`,
              backgroundColor: "white",
            }}
          />
        ) : (
          <IconCircle size={18} color="#dee2e6" />
        )}
        <Stack gap={2}>
          <Text fw={800} fz="sm">
            {title}
          </Text>
          <Text fz="xs" c="dimmed" fw={500}>
            {desc}
          </Text>
        </Stack>
      </Group>
    </UnstyledButton>
  );
}

interface DepartmentCardProps {
  title: string;
  members: number;
  color: string;
  onRemove?: (title: string) => void;
}

function DepartmentCard({ title, members, color, onRemove }: DepartmentCardProps) {
  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      shadow="xs"
      style={{ cursor: "pointer" }}
    >
      <Group justify="space-between">
        <Group gap="md">
          <Box
            p={10}
            bg={`${color}.0`}
            style={{ borderRadius: "10px", display: "flex" }}
          >
            <IconBuilding size={22} color={`var(--mantine-color-${color}-6)`} />
          </Box>
          <Stack gap={0}>
            <Text fw={800} fz="md">
              {title}
            </Text>
            <Text c="dimmed" fz="xs" fw={600}>
              {members} Members
            </Text>
          </Stack>
        </Group>
        <Group gap="xs">
          {onRemove && (
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onRemove(title); }}
              aria-label="Remove department"
            >
              <IconX size={16} />
            </ActionIcon>
          )}
          <IconChevronRight size={18} color="#adb5bd" />
        </Group>
      </Group>
    </Card>
  );
}

function MemberRow({ name, email, role, dept, status, date, member, onEdit, onDelete }: MemberRowProps) {
  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar radius="xl" size="sm" />
          <Stack gap={0}>
            <Text fz="sm" fw={800}>
              {name}
            </Text>
            <Text fz="xs" c="dimmed" fw={500}>
              {email}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="filled" bg="#f1f3f5" c="dark" radius="sm" fw={800}>
          {role}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text fz="sm" fw={600}>
          {dept}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={6}>
          <Box
            w={6}
            h={6}
            bg={status === "Active" ? "green" : "orange"}
            style={{ borderRadius: "50%" }}
          />
          <Badge
            variant="transparent"
            color={status === "Active" ? "green" : "orange"}
            p={0}
            fz="xs"
            fw={800}
          >
            {status}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm" fw={500} c="dimmed">
          {date}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          {member && onEdit && (
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={() => onEdit(member)}
              title="Edit"
            >
              <IconPencil size={16} />
            </ActionIcon>
          )}
          {member && onDelete && (
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={() => onDelete(member)}
              title="Delete"
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
          {(!member || (!onEdit && !onDelete)) && (
            <ActionIcon variant="transparent" c="gray.4">
              <IconDotsVertical size={18} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

function EditStaffModal({
  opened,
  onClose,
  onSuccess,
  member,
  orgDepartments,
}: {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: AuthUser | null;
  orgDepartments: string[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    departments: string[];
    isActive: boolean;
  }>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
      departments: [],
      isActive: true,
    },
    validate: {
      name: (v) => (!v?.trim() ? "Name is required" : null),
      email: (v) => (!v?.trim() ? "Email is required" : null),
    },
  });

  useEffect(() => {
    if (member) {
      form.setValues({
        name: member.name ?? "",
        email: member.email ?? "",
        password: "",
        role: member.role ?? "employee",
        departments: member.departments ?? [],
        isActive: member.isActive !== false,
      });
    }
  }, [member, opened]);

  const handleClose = () => {
    form.reset();
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    if (!member) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: Parameters<typeof updateUser>[1] = {
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.role,
        departments: values.departments ?? [],
        isActive: values.isActive,
      };
      if (values.password?.trim()) {
        payload.password = values.password;
      }
      await updateUser(member._id, payload);
      onSuccess();
      handleClose();
    } catch (err) {
      setSubmitError((err as ApiError).message ?? "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  });

  if (!member) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="md"
      radius="lg"
      padding={0}
      withCloseButton
      title={
        <Text fw={800} fz="lg">
          Edit Staff Member
        </Text>
      }
      styles={{
        header: { position: "absolute", right: 20, top: 20, zIndex: 100 },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box p={30}>
          <Stack gap="xl">
            <TextInput
              label={<Text fw={700} fz="sm" mb={8}>Full Name</Text>}
              placeholder="Jane Doe"
              radius="md"
              size="md"
              {...form.getInputProps("name")}
            />
            <TextInput
              label={<Text fw={700} fz="sm" mb={8}>Email Address</Text>}
              placeholder="name@company.com"
              type="email"
              leftSection={<IconMail size={18} color="#adb5bd" />}
              radius="md"
              size="md"
              {...form.getInputProps("email")}
            />
            <TextInput
              label={<Text fw={700} fz="sm" mb={8}>New Password (optional)</Text>}
              placeholder="Leave blank to keep current password"
              type="password"
              radius="md"
              size="md"
              {...form.getInputProps("password")}
            />
            <Box>
              <Text fw={700} fz="sm" mb={10}>Role</Text>
              <Stack gap="md">
                {ROLE_OPTIONS.map((opt) => (
                  <RoleOption
                    key={opt.value}
                    active={form.values.role === opt.value}
                    title={opt.label}
                    desc={opt.desc}
                    onClick={() => form.setFieldValue("role", opt.value)}
                  />
                ))}
              </Stack>
            </Box>
            {orgDepartments.length > 0 && (
              <MultiSelect
                label={<Text fw={700} fz="sm" mb={8}>Department(s)</Text>}
                placeholder="Select department(s)"
                data={orgDepartments}
                value={form.values.departments}
                onChange={(v) => form.setFieldValue("departments", v)}
                radius="md"
                size="md"
              />
            )}
            <Select
              label={<Text fw={700} fz="sm" mb={8}>Status</Text>}
              data={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              value={form.values.isActive ? "true" : "false"}
              onChange={(v) => form.setFieldValue("isActive", v === "true")}
              radius="md"
              size="md"
            />
          </Stack>
          {submitError && (
            <Text c="red" size="sm" mt="sm">
              {submitError}
            </Text>
          )}
        </Box>
        <Divider color="#f1f3f5" />
        <Box p={25} bg="white">
          <Group justify="flex-end" gap="xl">
            <Button
              type="button"
              variant="transparent"
              c="gray.6"
              fw={700}
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              bg={TEAL_BLUE}
              radius="md"
              h={45}
              px={30}
              fw={700}
              loading={submitting}
            >
              Save Changes
            </Button>
          </Group>
        </Box>
      </form>
    </Modal>
  );
}

function FormLabel({ label }: { label: string }) {
  return (
    <Text fw={800} fz={10} c="dimmed" lts={1} mb={8}>
      {label}
    </Text>
  );
}
