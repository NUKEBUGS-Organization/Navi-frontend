import type { ReactNode } from "react";
import {
  AppShell,
  Box,
  Text,
  Group,
  Avatar,
  Stack,
  rem,
  UnstyledButton,
  Burger,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconBuilding,
  IconSettings,
} from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";
import { COLORS, ROUTES } from "@/constants";
import logo from "@/assets/navi-logo.jpeg";

interface NavItem {
  icon: React.FC<IconProps>;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: IconLayoutDashboard, label: "Dashboard", path: ROUTES.SUPER_ADMIN_DASHBOARD },
  { icon: IconBuilding, label: "Organizations", path: ROUTES.SUPER_ADMIN_ORGS },
  { icon: IconSettings, label: "Settings", path: ROUTES.SUPER_ADMIN_SETTINGS },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: { base: 60, sm: 0 } }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="0"
    >
      <AppShell.Header
        bg={COLORS.sidebarBg}
        px="md"
        style={{ border: "none", display: "flex", alignItems: "center" }}
      >
        <Group justify="space-between" style={{ width: "100%" }}>
          <Group>
            <img
              src={logo}
              alt="Navi"
              style={{ height: 28, borderRadius: 6 }}
            />
            <Text fw={700} c="white">
              NAVI Super Admin
            </Text>
          </Group>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            color="white"
          />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="lg"
        bg={COLORS.sidebarBg}
        style={{ border: "none", zIndex: 100 }}
      >
        <Stack gap={4} mt="sm">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <UnstyledButton
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (opened) toggle();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: `${rem(12)} ${rem(16)}`,
                  borderRadius: "8px",
                  backgroundColor: isActive ? COLORS.sidebarActive : "transparent",
                  color: isActive ? COLORS.activeText : COLORS.sidebarText,
                }}
              >
                <item.icon size={22} stroke={1.5} style={{ marginRight: rem(12) }} />
                <Text size="sm" fw={500}>
                  {item.label}
                </Text>
              </UnstyledButton>
            );
          })}
        </Stack>

        <Box
          mt="auto"
          p="md"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 }}
        >
          <Group gap="sm">
            <Avatar radius="md" size="md" />
            <Stack gap={0}>
              <Text size="sm" fw={700} c="white">
                Super Admin
              </Text>
              <Text size="xs" c={COLORS.sidebarText} fw={500}>
                Platform Owner
              </Text>
            </Stack>
          </Group>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main bg={COLORS.mainBg} style={{ minHeight: "100vh" }}>
        <Box p={{ base: "md", sm: "35px" }}>{children}</Box>
      </AppShell.Main>
    </AppShell>
  );
}

