import { useEffect, useState } from "react";
import AdminLayout from "@/roles/admin/layout/AdminLayout";
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  rem,
  Card,
  Badge,
  Avatar,
  Stack,
  TextInput,
  Grid,
  Divider,
  ActionIcon,
  Center,
} from "@mantine/core";
import {
  IconCamera,
  IconUser,
  IconLock,
} from "@tabler/icons-react";
import { THEME_BLUE, TEAL_BLUE } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getMyOrganization } from "@/api/organizations";
import type { MyOrganization } from "@/api/organizations";

function getInitials(name: string | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatRole(role: string | undefined): string {
  if (!role) return "—";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [org, setOrg] = useState<MyOrganization | null>(null);

  useEffect(() => {
    getMyOrganization()
      .then(setOrg)
      .catch(() => setOrg(null));
  }, []);

  const nameParts = user?.name?.trim()?.split(/\s+/) ?? [];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";
  const departmentsDisplay = user?.departments?.length ? user.departments.join(", ") : "—";

  return (
    <AdminLayout>
      <Box style={{ width: "100%" }}>
        <Grid gutter={30} align="flex-start">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              withBorder
              radius="lg"
              p={40}
              shadow="xs"
              h="100%"
              ta="center"
            >
              <Center mb="lg">
                <Box style={{ position: "relative" }}>
                  <Avatar
                    size={rem(120)}
                    radius={rem(60)}
                    bg={THEME_BLUE}
                    c="white"
                    fz={rem(40)}
                    fw={700}
                  >
                    {getInitials(user?.name)}
                  </Avatar>
                  <ActionIcon
                    variant="filled"
                    bg={TEAL_BLUE}
                    size="lg"
                    radius="xl"
                    style={{
                      position: "absolute",
                      bottom: 5,
                      right: 5,
                      border: "3px solid white",
                    }}
                  >
                    <IconCamera size={18} />
                  </ActionIcon>
                </Box>
              </Center>

              <Title order={2} fw={800} fz={rem(24)} mb={5}>
                {user?.name ?? "—"}
              </Title>
              <Badge
                variant="light"
                color="teal"
                radius="xl"
                px="lg"
                py="md"
                fw={800}
                fz={10}
              >
                {formatRole(user?.role)}
              </Badge>

              <Divider my={30} color="#f1f3f5" />

              <Stack gap="xl" align="flex-start">
                <Box ta="left" style={{ width: "100%" }}>
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    EMAIL ADDRESS
                  </Text>
                  <Text fz="sm" fw={600}>
                    {user?.email ?? "—"}
                  </Text>
                </Box>
                <Box ta="left" style={{ width: "100%" }}>
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    ORGANIZATION
                  </Text>
                  <Text fz="sm" fw={600}>
                    {org?.name ?? "—"}
                  </Text>
                </Box>
                <Box ta="left" style={{ width: "100%" }}>
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    DEPARTMENT(S)
                  </Text>
                  <Text fz="sm" fw={600}>
                    {departmentsDisplay}
                  </Text>
                </Box>
              </Stack>

              <Button
                variant="filled"
                bg="#f1f3f5"
                c="#495057"
                radius="md"
                mt={40}
                h={50}
                fw={700}
                fullWidth
              >
                Upload New Photo
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap={30}>
              <Card withBorder radius="lg" p={0} shadow="xs">
                <Box p="xl">
                  <Group gap="sm" mb="xl">
                    <IconUser size={22} color={TEAL_BLUE} stroke={2.5} />
                    <Title order={4} fw={800}>
                      Personal Information
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#f1f3f5" />
                  <Grid gutter="xl">
                    <Grid.Col span={6}>
                      <SettingInput label="FIRST NAME" defaultValue={firstName} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <SettingInput label="LAST NAME" defaultValue={lastName} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Text fz={10} fw={800} c="dimmed" lts={1} mb={8}>
                        DEPARTMENT(S)
                      </Text>
                      <Text fz="sm" fw={600}>
                        {departmentsDisplay}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Box>
              </Card>

              <Card withBorder radius="lg" p={0} shadow="xs">
                <Box p="xl">
                  <Group gap="sm" mb="xl">
                    <IconLock size={22} color={TEAL_BLUE} stroke={2.5} />
                    <Title order={4} fw={800}>
                      Security & Password
                    </Title>
                  </Group>
                  <Divider mb="xl" color="#f1f3f5" />
                  <Grid gutter="xl">
                    <Grid.Col span={6}>
                      <SettingInput
                        label="CURRENT PASSWORD"
                        defaultValue="********"
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <SettingInput
                        label="NEW PASSWORD"
                        placeholder="Enter new password"
                      />
                    </Grid.Col>
                  </Grid>
                  <Text
                    fz="xs"
                    c="dimmed"
                    fw={500}
                    mt="lg"
                    style={{ lineHeight: 1.5 }}
                  >
                    Password must be at least 12 characters and include at least
                    one uppercase letter, one number, and one special character.
                  </Text>
                </Box>
              </Card>

              <Group justify="flex-end" gap="xl" mt="xl" pb={40}>
                <Button variant="transparent" c="gray.6" fw={700} size="md">
                  Cancel
                </Button>
                <Button
                  bg={THEME_BLUE}
                  radius="md"
                  h={50}
                  px={50}
                  fw={700}
                  size="md"
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

function SettingInput({
  label,
  defaultValue,
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <TextInput
      label={
        <Text fw={800} fz={10} c="dimmed" lts={1} mb={8}>
          {label}
        </Text>
      }
      defaultValue={defaultValue}
      placeholder={placeholder}
      radius="md"
      size="md"
      styles={{
        input: { backgroundColor: "#f8f9fa" },
      }}
    />
  );
}
