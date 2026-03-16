import {
  Card,
  Group,
  Badge,
  ActionIcon,
  Title,
  Avatar,
  Text,
  Stack,
  Progress,
} from "@mantine/core";
import { IconDots, IconCalendar } from "@tabler/icons-react";
import type { Task } from "@/types";
import { THEME_BLUE } from "@/constants";

export interface RoadmapTaskCardProps extends Task {
  onMenuClick: () => void;
}

export function TaskCard({
  status,
  title,
  owner,
  date,
  progress,
  isBlocked,
  onMenuClick,
}: RoadmapTaskCardProps) {
  return (
    <Card
      withBorder
      radius="lg"
      shadow="xs"
      p="xl"
      style={{ border: "1px solid #E9ECEF" }}
    >
      <Group justify="space-between" mb="md">
        <Badge
          variant="filled"
          bg={isBlocked ? "#fff5f5" : "#e7f5ff"}
          c={isBlocked ? "#fa5252" : "#228be6"}
          radius="sm"
          size="xs"
          fw={800}
          px={10}
          py={10}
        >
          {status.toUpperCase()}
        </Badge>
        <ActionIcon.Group>
          <ActionIcon variant="transparent" c="gray.3" onClick={onMenuClick}>
            <IconDots size={20} />
          </ActionIcon>
        </ActionIcon.Group>
      </Group>

      <Title order={4} fw={800} fz="md" mb="xl" style={{ lineHeight: 1.4 }}>
        {title}
      </Title>

      <Group justify="space-between" mb="lg">
        <Group gap="xs">
          <Avatar size="xs" radius="xl" color="blue" />
          <Text fz="xs" fw={700} c="dimmed">
            {owner}
          </Text>
        </Group>
        <Group gap={6}>
          <IconCalendar size={15} color="#94A3B8" />
          <Text fz="xs" fw={700} c="dimmed">
            {date}
          </Text>
        </Group>
      </Group>

      <Stack gap={8}>
        <Group justify="space-between">
          <Text fz={11} fw={700} c="dimmed">
            Progress
          </Text>
          <Text fz={11} fw={800}>
            {progress}%
          </Text>
        </Group>
        <Progress value={progress} color={THEME_BLUE} h={5} radius="xl" />
      </Stack>
    </Card>
  );
}

