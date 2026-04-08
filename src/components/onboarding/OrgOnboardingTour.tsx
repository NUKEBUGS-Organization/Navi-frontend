import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Button, Group, Text, Title, Stack, Progress, List, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppRoutes } from "@/hooks/useAppRoutes";
import type { AppRoutes } from "@/constants/routes";
import type { UserRole } from "@/api/auth";
import { THEME_BLUE } from "@/constants";
import {
  REPLAY_ORG_TOUR_EVENT,
  isOrgWelcomeTourDone,
  markOrgWelcomeTourDone,
  clearOrgWelcomeTour,
} from "./onboardingTourStorage";

type Step = {
  title: string;
  body: string;
  bullets?: string[];
  path?: string;
  goLabel?: string;
};

function stepsForAdmin(r: AppRoutes): Step[] {
  return [
    {
      title: "Reset your password",
      body: "You may have received a temporary password. Update it now so your account stays secure.",
      path: r.SETTINGS,
      goLabel: "Open Settings",
    },
    {
      title: "Set up company departments",
      body: "Departments are used for initiatives, RACI, and user assignments. Add or edit them on your organization profile.",
      bullets: ["Use Organization → General Information to maintain the department list."],
      path: r.ORGANIZATION,
      goLabel: "Open Organization",
    },
    {
      title: "Import managers (CSV)",
      body: "Bulk-add managers with the same CSV tool. Each row: name, email, role, and departments (semicolon-separated).",
      bullets: [
        "Organization → Import CSV → paste rows with role set to manager.",
        "Example: Jane Manager,jane@co.com,manager,Engineering",
      ],
      path: r.ORGANIZATION,
      goLabel: "Go to Organization",
    },
    {
      title: "Import employees (CSV)",
      body: "Add staff the same way with role employee so they can sign in and see their initiatives and tasks.",
      bullets: ["Use role employee in the CSV. Departments should match what you configured earlier."],
      path: r.ORGANIZATION,
      goLabel: "Go to Organization",
    },
    {
      title: "Create your first initiative",
      body: "Initiatives anchor assessments, roadmaps, risks, communications, and the Knowledge Hub.",
      bullets: [
        "Initiatives → New Initiative.",
        "Under FAQs (optional), you can add items one by one or use Import from file (.csv / .txt with Question and Answer columns).",
      ],
      path: r.INITIATIVES,
      goLabel: "Open Initiatives",
    },
  ];
}

function stepsForManager(r: AppRoutes): Step[] {
  return [
    {
      title: "Reset your password",
      body: "If you have a temporary password, change it under Settings.",
      path: r.SETTINGS,
      goLabel: "Open Settings",
    },
    {
      title: "Review your initiatives",
      body: "You’ll see initiatives where you’re the change lead, on RACI, or in impacted departments.",
      path: r.INITIATIVES,
      goLabel: "Open Initiatives",
    },
    {
      title: "Roadmap & tasks",
      body: "Track phases, tasks, and comments. Completing work can earn kudos for your team.",
      path: r.ROADMAP,
      goLabel: "Open Roadmap",
    },
    {
      title: "Stakeholders & communications",
      body: "Map stakeholders and plan communications for initiatives you support.",
      path: r.STAKEHOLDERS,
      goLabel: "Open Stakeholders",
    },
    {
      title: "Assessments & Kudos",
      body: "Complete assessments when assigned. Use Kudos to recognize employees on initiatives you support.",
      bullets: ["Assessments for surveys; Kudos to award manager stars."],
      path: r.ASSESSMENTS,
      goLabel: "Open Assessments",
    },
  ];
}

function stepsForEmployee(r: AppRoutes): Step[] {
  return [
    {
      title: "Reset your password",
      body: "Update your password from Settings if you started with a temporary one.",
      path: r.SETTINGS,
      goLabel: "Open Settings",
    },
    {
      title: "Your dashboard",
      body: "See a snapshot of initiatives and activity that involve you.",
      path: r.DASHBOARD,
      goLabel: "Open Dashboard",
    },
    {
      title: "Initiatives & assessments",
      body: "Open an initiative to view details, FAQs, and assessments your org assigned.",
      path: r.INITIATIVES,
      goLabel: "Open Initiatives",
    },
    {
      title: "Roadmap tasks",
      body: "Find tasks assigned to you and add comments when collaboration is needed.",
      path: r.ROADMAP,
      goLabel: "Open Roadmap",
    },
    {
      title: "Knowledge Hub",
      body: "Browse FAQs and shared knowledge for initiatives you’re part of.",
      path: r.KNOWLEDGE_HUB,
      goLabel: "Open Knowledge Hub",
    },
  ];
}

function buildSteps(role: UserRole | undefined, routes: AppRoutes): Step[] {
  if (role === "manager") return stepsForManager(routes);
  if (role === "employee") return stepsForEmployee(routes);
  return stepsForAdmin(routes);
}

export function OrgOnboardingTour() {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const appRoutes = useAppRoutes();
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(0);

  const role = user?.role;
  const userId = user?._id;

  const steps = useMemo(() => {
    if (!role || role === "super_admin") return [];
    return buildSteps(role, appRoutes);
  }, [role, appRoutes]);

  const openTour = useCallback(() => {
    setActive(0);
    setOpened(true);
  }, []);

  useEffect(() => {
    if (!isReady || !userId || role === "super_admin") return;
    if (isOrgWelcomeTourDone(userId)) return;
    openTour();
  }, [isReady, userId, role, openTour]);

  useEffect(() => {
    const onReplay = () => {
      if (!userId) return;
      clearOrgWelcomeTour(userId);
      openTour();
    };
    window.addEventListener(REPLAY_ORG_TOUR_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_ORG_TOUR_EVENT, onReplay);
  }, [userId, openTour]);

  const finish = () => {
    if (userId) markOrgWelcomeTourDone(userId);
    setOpened(false);
  };

  const skip = () => {
    if (userId) markOrgWelcomeTourDone(userId);
    setOpened(false);
  };

  if (!role || role === "super_admin" || steps.length === 0) return null;

  const step = steps[active];
  const isLast = active === steps.length - 1;
  const progress = Math.round(((active + 1) / steps.length) * 100);

  return (
    <Modal
      opened={opened}
      onClose={skip}
      title={
        <Title order={4} fw={800} c={THEME_BLUE}>
          Welcome to NAVI
        </Title>
      }
      centered
      size="lg"
      radius="lg"
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Quick tour — step {active + 1} of {steps.length} (tailored for{" "}
          {role === "admin" ? "organization admins" : role === "manager" ? "managers" : "employees"}).
        </Text>
        <Progress value={progress} size="sm" color="teal" radius="xl" />

        <Title order={5} fw={800}>
          {step.title}
        </Title>
        <Text size="sm">{step.body}</Text>
        {step.bullets && step.bullets.length > 0 && (
          <List
            spacing="xs"
            size="sm"
            c="dimmed"
            icon={
              <ThemeIcon color="teal" size={22} radius="xl">
                <IconCheck size={14} />
              </ThemeIcon>
            }
          >
            {step.bullets.map((b) => (
              <List.Item key={b}>{b}</List.Item>
            ))}
          </List>
        )}

        <Group justify="space-between" wrap="wrap" mt="md">
          <Button variant="subtle" color="gray" onClick={skip}>
            Skip tour
          </Button>
          <Group gap="sm">
            {active > 0 && (
              <Button variant="default" onClick={() => setActive((a) => a - 1)}>
                Back
              </Button>
            )}
            {step.path && step.goLabel && (
              <Button
                variant="light"
                color="teal"
                onClick={() => {
                  navigate(step.path!);
                }}
              >
                {step.goLabel}
              </Button>
            )}
            {!isLast ? (
              <Button bg={THEME_BLUE} onClick={() => setActive((a) => a + 1)}>
                Next
              </Button>
            ) : (
              <Button bg={THEME_BLUE} onClick={finish}>
                Finish
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
