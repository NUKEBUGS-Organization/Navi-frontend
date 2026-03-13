import React from "react";
import AdminLayout from "../layout/AdminLayout";
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
  Indicator,
  SimpleGrid,
  Center,
  Modal,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconBell,
  IconChevronRight,
  IconDotsVertical,
  IconPlus,
  IconUserPlus,
  IconChevronDown,
  IconMail,
  IconBuilding,
  IconCircle,
} from "@tabler/icons-react";

const THEME_BLUE = "#0f2b5c";
const TEAL_BLUE = "#14b8a6";

interface MemberRowProps {
  name: string;
  email: string;
  role: string;
  dept: string;
  status: "Active" | "Pending";
  date: string;
}

export default function AdminOrganization() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <AdminLayout>
      <Box style={{ width: "100%" }}>
        <Group justify="space-between" mb={30} wrap="nowrap">
          <Group gap="md">
            <Title order={1} fw={800} fz={{ base: 22, sm: 28 }}>
              Organization
            </Title>
            <Badge variant="light" color="teal" radius="sm" fw={800} size="sm">
              ENTERPRISE
            </Badge>
          </Group>
        </Group>

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
                Acme Global Inc.
              </Title>
              <Text c="dimmed" fz="sm" fw={500} mb="xl">
                Tech Infrastructure Solutions
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
                    Last updated 2 days ago
                  </Text>
                </Group>
                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <FormLabel label="ORGANIZATION NAME" />
                    <TextInput
                      defaultValue="Acme Global Inc."
                      radius="md"
                      size="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <FormLabel label="INDUSTRY" />
                    <Select
                      defaultValue="Technology & Software"
                      data={["Technology & Software"]}
                      radius="md"
                      size="md"
                      rightSection={<IconChevronDown size={16} />}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <FormLabel label="COMPANY SIZE" />
                    <Select
                      defaultValue="500 - 1,000 employees"
                      data={["500 - 1,000 employees"]}
                      radius="md"
                      size="md"
                      rightSection={<IconChevronDown size={16} />}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <FormLabel label="WEBSITE" />
                    <TextInput
                      defaultValue="www.acmeglobal.com"
                      radius="md"
                      size="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <FormLabel label="PRIMARY CONTACT EMAIL" />
                    <TextInput
                      defaultValue="admin@acmeglobal.com"
                      radius="md"
                      size="md"
                    />
                  </Grid.Col>
                </Grid>
              </Box>
              <Divider color="#f1f3f5" />
              <Box p="lg">
                <Group justify="flex-end" gap="md">
                  <Button variant="transparent" c="gray.6" fw={700}>
                    Discard
                  </Button>
                  <Button bg={THEME_BLUE} radius="md" px={30} fw={700}>
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
          >
            Add Department
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mb={50}>
          <DepartmentCard title="Engineering" members={42} color="blue" />
          <DepartmentCard title="Finance & Ops" members={18} color="teal" />
          <DepartmentCard title="Design" members={12} color="grape" />
        </SimpleGrid>

        <Group justify="space-between" mb="xl" wrap="wrap">
          <Title order={3} fw={800}>
            Team Members
          </Title>
          <Group gap="md">
            <TextInput
              placeholder="Filter members..."
              leftSection={<IconSearch size={16} />}
              radius="md"
              w={{ base: "100%", sm: 300 }}
            />
            <Button
              onClick={open}
              leftSection={<IconUserPlus size={18} />}
              bg={THEME_BLUE}
              radius="md"
              fw={700}
            >
              Invite User
            </Button>
          </Group>
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
                <MemberRow
                  name="Sarah Jenkins"
                  email="sarah.j@acmeglobal.com"
                  role="Admin"
                  dept="Engineering"
                  status="Active"
                  date="Oct 12, 2023"
                />
                <MemberRow
                  name="Michael Chen"
                  email="m.chen@acmeglobal.com"
                  role="Editor"
                  dept="Finance & Ops"
                  status="Pending"
                  date="Jan 04, 2024"
                />
                <MemberRow
                  name="Anna Smith"
                  email="a.smith@acmeglobal.com"
                  role="Viewer"
                  dept="Design"
                  status="Active"
                  date="Nov 22, 2023"
                />
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

        <InviteUserModal opened={opened} onClose={close} />
      </Box>
    </AdminLayout>
  );
}

function InviteUserModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      radius="lg"
      padding={0}
      withCloseButton
      styles={{
        header: { position: "absolute", right: 20, top: 20, zIndex: 100 },
      }}
    >
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
            Invite Team Member
          </Title>
        </Group>
        <Stack gap="xl">
          <TextInput
            label={
              <Text fw={700} fz="sm" mb={8}>
                Email Address
              </Text>
            }
            placeholder="name@company.com"
            leftSection={<IconMail size={18} color="#adb5bd" />}
            radius="md"
            size="md"
          />
          <Box>
            <Text fw={700} fz="sm" mb={10}>
              Role
            </Text>
            <Stack gap="md">
              <RoleOption
                active
                title="Admin"
                desc="Full access to all platform settings and billing."
              />
              <RoleOption
                active={false}
                title="Member"
                desc="Access to assigned projects and shared assets only."
              />
            </Stack>
          </Box>
          <Select
            label={
              <Text fw={700} fz="sm" mb={8}>
                Department
              </Text>
            }
            placeholder="Select department"
            leftSection={<IconBuilding size={18} color="#adb5bd" />}
            data={["Engineering", "Design"]}
            radius="md"
            size="md"
          />
        </Stack>
      </Box>
      <Divider color="#f1f3f5" />
      <Box p={25} bg="white">
        <Group justify="flex-end" gap="xl">
          <Button variant="transparent" c="gray.6" fw={700} onClick={onClose}>
            Cancel
          </Button>
          <Button bg={TEAL_BLUE} radius="md" h={45} px={30} fw={700}>
            Send Invitation
          </Button>
        </Group>
      </Box>
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
}: {
  active: boolean;
  title: string;
  desc: string;
}) {
  return (
    <UnstyledButton
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

function DepartmentCard({ title, members, color }: any) {
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
        <IconChevronRight size={18} color="#adb5bd" />
      </Group>
    </Card>
  );
}

function MemberRow({ name, email, role, dept, status, date }: MemberRowProps) {
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
        <ActionIcon variant="transparent" c="gray.4">
          <IconDotsVertical size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

function FormLabel({ label }: { label: string }) {
  return (
    <Text fw={800} fz={10} c="dimmed" lts={1} mb={8}>
      {label}
    </Text>
  );
}
