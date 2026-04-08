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
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { IconLayoutDashboard, IconTarget, IconCheckbox, IconRoute, IconHierarchy, IconSettings, IconLogout, IconUsers, IconMessage, IconChartLine, IconAlertTriangle, IconStar, IconBooks } from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";
import { COLORS, ROUTES } from "@/constants";
import { NaviLogo } from "@/components/ui/NaviLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useAppRoutes } from "@/hooks/useAppRoutes";

interface NavItem {
  icon: React.FC<IconProps>;
  label: string;
  path: string;
  /** Only show for these roles; omit to show for all (admin, manager, employee). */
  roles?: ("admin" | "manager" | "employee")[];
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const appRoutes = useAppRoutes();
  const settingsPath = appRoutes.SETTINGS;

  const NAV_ITEMS: NavItem[] = [
    { icon: IconLayoutDashboard, label: "Dashboard", path: appRoutes.DASHBOARD },
    { icon: IconTarget, label: "Initiatives", path: appRoutes.INITIATIVES },
    { icon: IconCheckbox, label: "Assessments", path: appRoutes.ASSESSMENTS },
    { icon: IconRoute, label: "Roadmap", path: appRoutes.ROADMAP },
    { icon: IconUsers, label: "Stakeholder Mapping", path: appRoutes.STAKEHOLDERS, roles: ["admin", "manager"] },
    { icon: IconMessage, label: "Communication Planning", path: appRoutes.COMMUNICATIONS, roles: ["admin", "manager"] },
    { icon: IconChartLine, label: "Adoption Tracking", path: appRoutes.ADOPTION, roles: ["admin", "manager"] },
    { icon: IconAlertTriangle, label: "Risk Monitoring", path: appRoutes.RISKS, roles: ["admin", "manager"] },
    { icon: IconStar, label: "Kudos", path: appRoutes.KUDOS },
    { icon: IconBooks, label: "Knowledge Hub", path: appRoutes.KNOWLEDGE_HUB },
    { icon: IconHierarchy, label: "Organization", path: appRoutes.ORGANIZATION, roles: ["admin"] },
    { icon: IconSettings, label: "Settings", path: appRoutes.SETTINGS },
  ];

  return (
    <AppShell
      header={{ height: { base: 60, sm: 0 } }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="0"
    >
      <AppShell.Header
        bg={COLORS.sidebarBg}
        px="md"
        style={{ border: "none", display: "flex", alignItems: "center" }}
      >
        <Group justify="space-between" style={{ width: "100%" }}>
          <Group>
            <NaviLogo height={28} />
            <Text fw={700} c="white" ff="'Montserrat', sans-serif" lts={0.6}>
              NAVI
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
        <Group mb={40} mt={10} px="xs" visibleFrom="sm">
          <NaviLogo height={32} />
          <Stack gap={0}>
            <Text
              fw={700}
              size="xl"
              c="white"
              ff="'Montserrat', sans-serif"
              lts={0.6}
              style={{ lineHeight: 1 }}
            >
              NAVI
            </Text>
            <Text size="10px" c={COLORS.sidebarText} fw={700} lts={1.2} mt={4}>
              EXECUTIVE HUB
            </Text>
          </Stack>
        </Group>

        <Stack gap={4}>
          {NAV_ITEMS.filter((item) => {
            const role = user?.role as "admin" | "manager" | "employee" | undefined;
            if (!item.roles) return true;
            return role && item.roles.includes(role);
          }).map((item) => {
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
                  backgroundColor: isActive
                    ? COLORS.sidebarActive
                    : "transparent",
                  color: isActive ? COLORS.activeText : COLORS.sidebarText,
                }}
              >
                <item.icon
                  size={22}
                  stroke={1.5}
                  style={{ marginRight: rem(12) }}
                />
                <Text size="sm" fw={500}>
                  {item.label}
                </Text>
              </UnstyledButton>
            );
          })}
          <UnstyledButton
            onClick={() => {
              logout();
              navigate(ROUTES.AUTH_LOGIN, { replace: true });
              if (opened) toggle();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              padding: `${rem(12)} ${rem(16)}`,
              borderRadius: "8px",
              color: COLORS.sidebarText,
              marginTop: rem(8),
            }}
          >
            <IconLogout size={22} stroke={1.5} style={{ marginRight: rem(12) }} />
            <Text size="sm" fw={500}>
              Log out
            </Text>
          </UnstyledButton>
        </Stack>

        <Box
          mt="auto"
          p="md"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
          }}
        >
          <Menu shadow="md" width={200} position="top-end">
            <Menu.Target>
              <UnstyledButton style={{ width: "100%" }}>
                <Group gap="sm">
                  <Avatar radius="md" size="md" />
                  <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={700} c="white" truncate>
                      {user?.name ?? "User"}
                    </Text>
                    <Text size="xs" c={COLORS.sidebarText} fw={500}>
                      {user?.role ?? "—"}
                    </Text>
                  </Stack>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => navigate(settingsPath)}
              >
                Profile & settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={() => {
                  logout();
                  navigate(ROUTES.AUTH_LOGIN, { replace: true });
                }}
              >
                Log out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main bg={COLORS.mainBg} style={{ minHeight: "100vh" }}>
        <Box p={{ base: "md", sm: "35px" }}>{children}</Box>
      </AppShell.Main>
    </AppShell>
  );
}
