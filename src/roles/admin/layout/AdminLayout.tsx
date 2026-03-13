import {
  AppShell,
  Box,
  Text,
  Group,
  Avatar,
  Stack,
  rem,
  UnstyledButton,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconTarget,
  IconCheckbox,
  IconRoute,
  IconHierarchy,
  IconSettings,
  IconCompass,
} from "@tabler/icons-react";

// Exact colors from the design
const DESIGN_COLORS = {
  sidebarBg: "#0f2b5c", // Deep Dark Navy
  sidebarActive: "#27416d", // Lighter blue for active state
  sidebarText: "#94A3B8", // Muted text
  activeText: "#FFFFFF", // White text for active
  mainBg: "#F1F4F9", // Light gray background
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell navbar={{ width: 260, breakpoint: "sm" }} padding="0">
      {/* SIDEBAR */}
      <AppShell.Navbar
        p="md"
        bg={DESIGN_COLORS.sidebarBg}
        style={{ border: "none" }}
      >
        <Group mb={30} mt={10} px="xs">
          <Box
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "6px",
              display: "flex",
            }}
          >
            <IconCompass color="white" size={24} />
          </Box>
          <Stack gap={0}>
            <Text fw={700} size="lg" c="white" style={{ lineHeight: 1.1 }}>
              NAVI
            </Text>
            <Text size="10px" c={DESIGN_COLORS.sidebarText} fw={600} lts={1}>
              EXECUTIVE HUB
            </Text>
          </Stack>
        </Group>

        <Stack gap={4}>
          {[
            { icon: IconLayoutDashboard, label: "Dashboard", active: true },
            { icon: IconTarget, label: "Initiatives", active: false },
            { icon: IconCheckbox, label: "Assessments", active: false },
            { icon: IconRoute, label: "Roadmap", active: false },
            { icon: IconHierarchy, label: "Organization", active: false },
            { icon: IconSettings, label: "Settings", active: false },
          ].map((item) => (
            <UnstyledButton
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                padding: `${rem(10)} ${rem(14)}`,
                borderRadius: "8px",
                backgroundColor: item.active
                  ? DESIGN_COLORS.sidebarActive
                  : "transparent",
                color: item.active
                  ? DESIGN_COLORS.activeText
                  : DESIGN_COLORS.sidebarText,
              }}
            >
              <item.icon
                size={20}
                stroke={1.5}
                style={{ marginRight: rem(12) }}
              />
              <Text size="sm" fw={500}>
                {item.label}
              </Text>
            </UnstyledButton>
          ))}
        </Stack>

        {/* BOTTOM USER PROFILE */}
        <Box
          mt="auto"
          p="sm"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "12px",
          }}
        >
          <Group gap="sm">
            <Avatar
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
              radius="md"
            />
            <Stack gap={0}>
              <Text size="sm" fw={600} c="white">
                James Wilson
              </Text>
              <Text size="xs" c={DESIGN_COLORS.sidebarText}>
                Chief Officer
              </Text>
            </Stack>
          </Group>
        </Box>
      </AppShell.Navbar>

      {/* MAIN CONTENT */}
      <AppShell.Main bg={DESIGN_COLORS.mainBg} p="xl">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
