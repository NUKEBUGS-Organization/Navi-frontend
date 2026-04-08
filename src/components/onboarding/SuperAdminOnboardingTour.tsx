import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Button, Group, Text, Title, Stack, Progress, List, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES, THEME_BLUE } from "@/constants";
import {
  REPLAY_SUPER_TOUR_EVENT,
  isSuperAdminWelcomeTourDone,
  markSuperAdminWelcomeTourDone,
  clearSuperAdminWelcomeTour,
} from "./onboardingTourStorage";

type Step = {
  title: string;
  body: string;
  bullets?: string[];
  path: string;
  goLabel: string;
};

const SUPER_STEPS: Step[] = [
  {
    title: "Review signup leads",
    body: "Organizations that requested access appear under Leads. Open a lead to pre-fill organization creation.",
    bullets: ["Approve or follow up before provisioning a workspace."],
    path: ROUTES.SUPER_ADMIN_LEADS,
    goLabel: "Open Leads",
  },
  {
    title: "Create or manage organizations",
    body: "Provision workspaces from the Organizations page. You can jump from a lead with a query link when supported.",
    path: ROUTES.SUPER_ADMIN_ORGS,
    goLabel: "Open Organizations",
  },
  {
    title: "Headcount & platform settings",
    body: "Approve pending employee counts from the Organizations table when shown. Use Settings for platform-level preferences.",
    path: ROUTES.SUPER_ADMIN_SETTINGS,
    goLabel: "Open Settings",
  },
];

export function SuperAdminOnboardingTour() {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(0);

  const userId = user?._id;
  const steps = useMemo(() => SUPER_STEPS, []);

  const openTour = useCallback(() => {
    setActive(0);
    setOpened(true);
  }, []);

  useEffect(() => {
    if (!isReady || !userId || user?.role !== "super_admin") return;
    if (isSuperAdminWelcomeTourDone(userId)) return;
    openTour();
  }, [isReady, userId, user?.role, openTour]);

  useEffect(() => {
    const onReplay = () => {
      if (!userId) return;
      clearSuperAdminWelcomeTour(userId);
      openTour();
    };
    window.addEventListener(REPLAY_SUPER_TOUR_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_SUPER_TOUR_EVENT, onReplay);
  }, [userId, openTour]);

  const finish = () => {
    if (userId) markSuperAdminWelcomeTourDone(userId);
    setOpened(false);
  };

  const skip = () => {
    if (userId) markSuperAdminWelcomeTourDone(userId);
    setOpened(false);
  };

  if (user?.role !== "super_admin") return null;

  const step = steps[active];
  const isLast = active === steps.length - 1;
  const progress = Math.round(((active + 1) / steps.length) * 100);

  return (
    <Modal
      opened={opened}
      onClose={skip}
      title={
        <Title order={4} fw={800} c={THEME_BLUE}>
          Welcome — Super Admin
        </Title>
      }
      centered
      size="lg"
      radius="lg"
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Step {active + 1} of {steps.length} — how to run the platform side of NAVI.
        </Text>
        <Progress value={progress} size="sm" color="teal" radius="xl" />

        <Title order={5} fw={800}>
          {step.title}
        </Title>
        <Text size="sm">{step.body}</Text>
        {step.bullets && (
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
            <Button variant="light" color="teal" onClick={() => navigate(step.path)}>
              {step.goLabel}
            </Button>
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
