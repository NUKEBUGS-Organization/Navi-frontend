import React from "react";
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
  IconTarget,
  IconCheckbox,
  IconRoute,
  IconHierarchy,
  IconSettings,
} from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";
import naviLogo from "../../../assets/navi-logo.jpeg";

interface NavItem {
  icon: React.FC<IconProps>;
  label: string;
  path: string;
}

const COLORS = {
  sidebarBg: "#0f2b5c",
  sidebarActive: "rgba(255, 255, 255, 0.1)",
  sidebarText: "#94A3B8",
  activeText: "#FFFFFF",
  mainBg: "#F8F9FA",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: IconLayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: IconTarget, label: "Initiatives", path: "/admin/initiatives" },
    { icon: IconCheckbox, label: "Assessments", path: "/admin/assessments" },
    { icon: IconRoute, label: "Roadmap", path: "/admin/roadmap" },
    { icon: IconHierarchy, label: "Organization", path: "/admin/organization" },
    { icon: IconSettings, label: "Settings", path: "/admin/settings" },
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
            <img
              src={naviLogo}
              alt="Navi"
              style={{ height: 28, borderRadius: 6 }}
            />
            <Text fw={700} c="white">
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
          <img
            src={naviLogo}
            alt="Navi"
            style={{ height: 32, borderRadius: 8 }}
          />
          <Stack gap={0}>
            <Text
              fw={700}
              size="xl"
              c="white"
              lts={0.5}
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
          {navItems.map((item) => {
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
        </Stack>

        <Box
          mt="auto"
          p="md"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
          }}
        >
          <Group gap="sm">
            <Avatar radius="md" size="md" />
            <Stack gap={0}>
              <Text size="sm" fw={700} c="white">
                James Wilson
              </Text>
              <Text size="xs" c={COLORS.sidebarText} fw={500}>
                Chief Officer
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
