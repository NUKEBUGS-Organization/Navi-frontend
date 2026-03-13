import React from "react";
import AdminLayout from "../layout/AdminLayout";
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
  Select,
  Grid,
  Divider,
  Switch,
  ActionIcon,
  Center,
} from "@mantine/core";
import {
  IconCamera,
  IconUser,
  IconLock,
  IconBell,
  IconChevronDown,
} from "@tabler/icons-react";

const THEME_BLUE = "#0f2b5c";
const TEAL_BLUE = "#14b8a6";

export default function AdminSettings() {
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
                    JD
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
                Jane Doe
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
                SENIOR DIRECTOR
              </Badge>

              <Divider my={30} color="#f1f3f5" />

              <Stack gap="xl" align="flex-start">
                <Box ta="left">
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    EMAIL ADDRESS
                  </Text>
                  <Text fz="sm" fw={600}>
                    jane.doe@globalcorp.com
                  </Text>
                </Box>
                <Box ta="left">
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    ORGANIZATION
                  </Text>
                  <Text fz="sm" fw={600}>
                    Global Tech Solutions Inc.
                  </Text>
                </Box>
                <Box ta="left">
                  <Text fz={10} fw={800} c="dimmed" lts={1} mb={4}>
                    MEMBER SINCE
                  </Text>
                  <Text fz="sm" fw={600}>
                    January 14, 2023
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
                      <SettingInput label="FIRST NAME" defaultValue="Jane" />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <SettingInput label="LAST NAME" defaultValue="Doe" />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <SettingInput
                        label="JOB TITLE"
                        defaultValue="Senior Director of Operations"
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Select
                        label={
                          <Text fw={800} fz={10} c="dimmed" lts={1} mb={8}>
                            DEPARTMENT
                          </Text>
                        }
                        defaultValue="Strategy & Growth"
                        data={[
                          "Strategy & Growth",
                          "Engineering",
                          "Operations",
                        ]}
                        radius="md"
                        size="md"
                        rightSection={<IconChevronDown size={16} />}
                      />
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

              <Card withBorder radius="lg" p={0} shadow="xs">
                <Box p="xl">
                  <Group gap="sm" mb="xl">
                    <IconBell size={22} color={TEAL_BLUE} stroke={2.5} />
                    <Title order={4} fw={800}>
                      Notification Preferences
                    </Title>
                  </Group>
                  <Divider color="#f1f3f5" />
                  <Stack gap={0}>
                    <NotificationToggle
                      title="Task Assignment"
                      desc="Email me when I'm assigned a new task"
                      active
                    />
                    <NotificationToggle
                      title="Assessment Updates"
                      desc="Email me when an assessment is completed"
                      active
                    />
                    <NotificationToggle
                      title="Initiative Status"
                      desc="Email me when an initiative status changes"
                      active={false}
                      isLast
                    />
                  </Stack>
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

function NotificationToggle({
  title,
  desc,
  active,
  isLast,
}: {
  title: string;
  desc: string;
  active: boolean;
  isLast?: boolean;
}) {
  return (
    <Box
      py="xl"
      style={{ borderBottom: isLast ? "none" : "1px solid #f1f3f5" }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2}>
          <Text fw={800} fz="sm">
            {title}
          </Text>
          <Text fz="xs" c="dimmed" fw={500}>
            {desc}
          </Text>
        </Stack>
        <Switch
          defaultChecked={active}
          color="teal"
          size="md"
          styles={{ track: { cursor: "pointer" } }}
        />
      </Group>
    </Box>
  );
}
