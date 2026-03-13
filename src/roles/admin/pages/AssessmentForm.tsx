import React, { useState } from "react";
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  rem,
  Card,
  Progress,
  Stack,
  UnstyledButton,
  Divider,
  Center,
  AppShell,
} from "@mantine/core";
import {
  IconChevronRight,
  IconChevronLeft,
  IconCircleCheck,
  IconCircle,
  IconCircleDot,
  IconDeviceFloppy,
  IconUsers,
} from "@tabler/icons-react";

const THEME_BLUE = "#0f2b5c";

const ASSESSMENT_DATA = [
  {
    id: "cat_01",
    title: "Leadership Alignment",
    description:
      "Assess the extent to which organizational leaders are prepared to sponsor and lead the upcoming transformation initiatives.",
    questions: [
      {
        id: 1,
        text: "To what extent has the leadership team communicated a shared vision for this change?",
        minLabel: "NOT AT ALL",
        maxLabel: "COMPLETELY",
      },
      {
        id: 2,
        text: "How visible is executive sponsorship for the initiative across the organization?",
        minLabel: "INVISIBLE",
        maxLabel: "HIGHLY VISIBLE",
      },
      {
        id: 3,
        text: "How well do leaders model the behaviors expected from the change?",
        minLabel: "POORLY",
        maxLabel: "EXEMPLARY",
      },
    ],
  },
  {
    id: "cat_02",
    title: "Communication Readiness",
    description:
      "Evaluate the effectiveness of current communication channels.",
    questions: [
      {
        id: 4,
        text: "Are there clear channels for two-way feedback?",
        minLabel: "NONE",
        maxLabel: "MULTIPLE",
      },
    ],
  },
];

export default function AssessmentForm() {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const currentCategory = ASSESSMENT_DATA[currentCategoryIndex];

  const handleScoreChange = (questionId: number, score: number) => {
    setAnswers({ ...answers, [questionId]: score });
  };

  return (
    <AppShell navbar={{ width: 300, breakpoint: "sm" }} padding="0">
      <AppShell.Navbar
        p="xl"
        bg="white"
        style={{ borderRight: "1px solid #e9ecef" }}
      >
        <Box mb={40}>
          <Group justify="space-between" mb="xs">
            <Text fw={800} fz="sm">
              Overall Progress
            </Text>
            <Text fw={800} fz="sm" c="blue">
              67%
            </Text>
          </Group>
          <Progress value={67} color={THEME_BLUE} size="sm" radius="xl" />
        </Box>

        <Text fz={10} fw={800} c="dimmed" lts={1} mb="xl">
          CATEGORIES
        </Text>

        <Stack gap={0} style={{ flex: 1 }}>
          {ASSESSMENT_DATA.map((cat, index) => (
            <CategoryItem
              key={cat.id}
              title={cat.title}
              status={
                index === currentCategoryIndex
                  ? "Current"
                  : index < currentCategoryIndex
                    ? "Completed"
                    : "Not started"
              }
              active={index === currentCategoryIndex}
              onClick={() => setCurrentCategoryIndex(index)}
            />
          ))}
        </Stack>

        <Box mt="auto">
          <Divider mb="xl" />
          <Button
            variant="subtle"
            leftSection={<IconDeviceFloppy size={18} />}
            color="gray"
            fw={700}
            fullWidth
            justify="flex-start"
          >
            Save and Exit
          </Button>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main bg="#f8f9fa">
        <Box
          p={rem(60)}
          style={{
            maxWidth: rem(1000),
            margin: "0 auto",
            paddingBottom: rem(120),
          }}
        >
          <Group gap="xs" mb="xs">
            <IconUsers size={18} color={THEME_BLUE} />
            <Text fz={12} fw={800} c="dimmed" lts={1.5}>
              CATEGORY 0{currentCategoryIndex + 1}
            </Text>
          </Group>

          <Title order={1} fw={900} fz={rem(42)} mb="lg">
            {currentCategory.title}
          </Title>
          <Text
            fz="lg"
            c="dimmed"
            fw={500}
            mb={50}
            style={{ maxWidth: rem(700) }}
          >
            {currentCategory.description}
          </Text>

          <Stack gap={30}>
            {currentCategory.questions.map((q) => (
              <QuestionCard
                key={q.id}
                number={q.id}
                text={q.text}
                minLabel={q.minLabel}
                maxLabel={q.maxLabel}
                value={answers[q.id]}
                onSelect={(val: number) => handleScoreChange(q.id, val)}
              />
            ))}
          </Stack>
        </Box>

        <Box
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            left: 300,
            backgroundColor: "white",
            borderTop: "1px solid #dee2e6",
            padding: "20px 40px",
          }}
        >
          <Group justify="space-between">
            <Button
              variant="transparent"
              leftSection={<IconChevronLeft size={20} />}
              c="gray.6"
              fw={700}
              disabled={currentCategoryIndex === 0}
              onClick={() => setCurrentCategoryIndex(currentCategoryIndex - 1)}
            >
              Previous Category
            </Button>

            <Group gap="xl">
              <Text fz="sm" fw={600} c="dimmed">
                Step {currentCategoryIndex + 1} of {ASSESSMENT_DATA.length}
              </Text>
              <Button
                bg={THEME_BLUE}
                h={48}
                px={rem(40)}
                radius="md"
                fw={700}
                rightSection={<IconChevronRight size={18} />}
                onClick={() => {
                  if (currentCategoryIndex < ASSESSMENT_DATA.length - 1) {
                    setCurrentCategoryIndex(currentCategoryIndex + 1);
                  }
                }}
              >
                Next Category
              </Button>
            </Group>
          </Group>
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

function CategoryItem({ title, status, active, onClick }: any) {
  const isCompleted = status === "Completed";
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        padding: "16px 0",
        borderRight: active ? `3px solid ${THEME_BLUE}` : "none",
        backgroundColor: active ? "#f1f3f9" : "transparent",
        marginRight: active ? rem(-24) : 0,
        paddingLeft: active ? rem(20) : 0,
      }}
    >
      <Group wrap="nowrap" align="flex-start" gap="md">
        <Box mt={3}>
          {isCompleted ? (
            <IconCircleCheck size={20} color="#40c057" fill="#ebfbee" />
          ) : active ? (
            <IconCircleDot size={20} color={THEME_BLUE} />
          ) : (
            <IconCircle size={20} color="#dee2e6" />
          )}
        </Box>
        <Stack gap={2}>
          <Text fw={800} fz="sm" c={active ? "dark" : "dimmed"}>
            {title}
          </Text>
          <Text fz={10} fw={700} c={isCompleted ? "teal" : "dimmed"}>
            {status}
          </Text>
        </Stack>
      </Group>
    </UnstyledButton>
  );
}

function QuestionCard({
  number,
  text,
  minLabel,
  maxLabel,
  value,
  onSelect,
}: any) {
  return (
    <Card withBorder radius="lg" p={40} shadow="xs">
      <Title order={4} fw={800} mb="xl">
        <span style={{ marginRight: "10px" }}>{number}.</span> {text}
      </Title>

      <Group justify="space-between" mb="xs">
        <Text fz={10} fw={800} c="dimmed" lts={1}>
          {minLabel}
        </Text>
        <Text fz={10} fw={800} c="dimmed" lts={1}>
          {maxLabel}
        </Text>
      </Group>

      <SimpleGrid cols={5} spacing="md">
        {[1, 2, 3, 4, 5].map((num) => (
          <Button
            key={num}
            variant={value === num ? "filled" : "outline"}
            color={value === num ? "blue" : "gray"}
            h={55}
            radius="md"
            fz="lg"
            fw={800}
            bg={value === num ? THEME_BLUE : "white"}
            style={{
              border: value === num ? "none" : "1px solid #dee2e6",
              color: value === num ? "white" : "#495057",
            }}
            onClick={() => onSelect(num)}
          >
            {num}
          </Button>
        ))}
      </SimpleGrid>
    </Card>
  );
}

function SimpleGrid({ children, cols, spacing }: any) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: rem(spacing === "md" ? 20 : 10),
      }}
    >
      {children}
    </Box>
  );
}
