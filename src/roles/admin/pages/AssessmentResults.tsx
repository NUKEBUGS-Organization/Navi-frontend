import AdminLayout from "../layout/AdminLayout";
import {
  Grid,
  Card,
  Text,
  Group,
  Title,
  Progress,
  Badge,
  Avatar,
  Stack,
  Box,
  rem,
  Button,
  Breadcrumbs,
  Anchor,
  Rating,
  Divider,
  SimpleGrid,
  ThemeIcon,
} from "@mantine/core";
import {
  IconReload,
  IconRoute,
  IconCalendarStats,
  IconCircleCheck,
  IconAlertTriangle,
  IconBulb,
  IconMessageDots,
  IconHierarchy,
  IconArrowRight,
} from "@tabler/icons-react";
import { useNavigate } from 'react-router-dom';

const THEME_BLUE = "#0f2b5c";
const GREEN = "#40c057";
const ORANGE = "#fab005";
const RED = "#fa5252";

export default function AssessmentResults() {
  const navigate = useNavigate();
    const breadcrumbs = [
      { title: "Assessments", href: "#" },
      { title: "Results", href: "#" },
    ].map((item, index) => (
      <Anchor href={item.href} key={index} fz="xs" c="dimmed" fw={600}>
        {item.title}
      </Anchor>
    ));

    return (
      <AdminLayout>
        <Group justify="space-between" mb={40} align="flex-end">
          <Stack gap={5}>
            <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
            <Title order={1} fw={900} fz={rem(36)} c="#1A1D1E">
              Assessment Results
            </Title>
            <Group gap={8}>
              <IconCalendarStats size={16} color="#94A3B8" />
              <Text fz="sm" c="dimmed" fw={600}>
                Completed on Oct 24, 2023 by Alex Johnson
              </Text>
            </Group>
          </Stack>
          <Group gap="md">
            <Button
              variant="outline"
              color="gray.4"
              c="dark"
              leftSection={<IconReload size={18} />}
              radius="md"
              h={45}
              px="xl"
              fw={700}
              onClick={() => navigate('/admin/assessments/form')}
            >
              Retake Assessment
            </Button>
            <Button
              leftSection={<IconRoute size={18} />}
              bg={THEME_BLUE}
              radius="md"
              h={45}
              px="xl"
              fw={700}
            >
              View Roadmap
            </Button>
          </Group>
        </Group>

        <Card withBorder radius="lg" p={0} mb={30} shadow="xs">
          <Grid gutter={0}>
            <Grid.Col
              span={{ base: 12, md: 4 }}
              style={{ borderRight: "1px solid #f1f3f5" }}
            >
              <Stack align="center" justify="center" h="100%" py={40}>
                <Text fz="xs" fw={800} c="dimmed" lts={1.5}>
                  READINESS SCORE
                </Text>
                <Text
                  fz={rem(80)}
                  fw={900}
                  style={{ lineHeight: 1 }}
                  c={THEME_BLUE}
                >
                  3.6
                </Text>
                <Rating
                  value={3.5}
                  fractions={2}
                  readOnly
                  color="orange"
                  size="lg"
                />
                <Badge
                  variant="light"
                  color="orange"
                  radius="xl"
                  size="lg"
                  mt="md"
                  px="xl"
                  fw={800}
                >
                  MEDIUM RISK
                </Badge>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }} p={40}>
              <Title order={3} fw={800} mb="lg">
                Performance Interpretation
              </Title>
              <Text
                fz="md"
                c="dimmed"
                fw={500}
                style={{ lineHeight: 1.7 }}
                mb={30}
              >
                Your score indicates a moderate level of readiness for complex
                enterprise transitions. While your strategic planning capabilities
                are strong, there is a noted gap in execution agility and
                communication transparency. Strengthening core leadership
                competencies, particularly in cross-functional coordination, will
                move you into the low-risk category.
              </Text>
              <SimpleGrid cols={2} spacing="md">
                <Box
                  p="md"
                  bg="#ebfbee"
                  style={{
                    borderRadius: "12px",
                    borderLeft: `4px solid ${GREEN}`,
                  }}
                >
                  <Group gap="xs">
                    <IconCircleCheck size={20} color={GREEN} />
                    <Stack gap={0}>
                      <Text fz={11} fw={800} c={GREEN}>
                        STRONG AREA
                      </Text>
                      <Text fz="sm" fw={700}>
                        Strategic Vision
                      </Text>
                    </Stack>
                  </Group>
                </Box>
                <Box
                  p="md"
                  bg="#fff9db"
                  style={{
                    borderRadius: "12px",
                    borderLeft: `4px solid ${ORANGE}`,
                  }}
                >
                  <Group gap="xs">
                    <IconAlertTriangle size={20} color={ORANGE} />
                    <Stack gap={0}>
                      <Text fz={11} fw={800} c={ORANGE}>
                        CRITICAL FOCUS
                      </Text>
                      <Text fz="sm" fw={700}>
                        Execution Agility
                      </Text>
                    </Stack>
                  </Group>
                </Box>
              </SimpleGrid>
            </Grid.Col>
          </Grid>
        </Card>

        <Grid gutter="xl" mb={40}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card withBorder radius="lg" p={40} shadow="xs" h="100%">
              <Title order={4} fw={800} mb={30}>
                Scores by Dimension
              </Title>
              <Stack gap={25}>
                <DimensionRow
                  label="Leadership & Governance"
                  score={4.2}
                  color={GREEN}
                />
                <DimensionRow
                  label="Internal Communication"
                  score={2.8}
                  color={ORANGE}
                />
                <DimensionRow
                  label="Strategic Alignment"
                  score={4.5}
                  color={GREEN}
                />
                <DimensionRow
                  label="Operational Agility"
                  score={1.9}
                  color={RED}
                />
                <DimensionRow
                  label="Organizational Resilience"
                  score={3.2}
                  color={ORANGE}
                />
                <DimensionRow
                  label="Innovation Capacity"
                  score={3.5}
                  color={ORANGE}
                />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder radius="lg" p={40} shadow="xs" h="100%">
              <Title order={4} fw={800} mb={30}>
                Risk Classification
              </Title>
              <Stack gap="xl">
                <RiskLevel
                  color={GREEN}
                  title="Low Risk (4.0 - 5.0)"
                  desc="High level of readiness. Organization is well-prepared for scaling and change."
                />
                <RiskLevel
                  color={ORANGE}
                  title="Medium Risk (2.5 - 3.9)"
                  desc="Moderate gaps identified. Key processes need refinement to ensure success."
                />
                <RiskLevel
                  color={RED}
                  title="High Risk (0.0 - 2.4)"
                  desc="Critical vulnerabilities. Significant intervention required before proceeding."
                />
              </Stack>
              <Box mt={50} p="md" bg="#f8f9fa" style={{ borderRadius: "8px" }}>
                <Text
                  fz={11}
                  c="dimmed"
                  fw={500}
                  ta="center"
                  style={{ lineHeight: 1.5 }}
                >
                  Scores are calculated based on weighted inputs from 42 unique
                  data points.
                </Text>
              </Box>
            </Card>
          </Grid.Col>
        </Grid>

        {/* 4. RECOMMENDED FOCUS AREAS */}
        <Title order={3} fw={800} mb="xl">
          Recommended Focus Areas
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          <FocusCard
            icon={IconBulb}
            title="Agility Coaching"
            desc="Introduce Scrum/Kanban frameworks to middle management to reduce decision-making bottlenecks by 30%."
          />
          <FocusCard
            icon={IconMessageDots}
            title="Feedback Loops"
            desc="Implement bi-weekly anonymous pulse surveys to capture and address team sentiments in real-time."
          />
          <FocusCard
            icon={IconHierarchy}
            title="Silo Elimination"
            desc="Kick off cross-departmental 'tiger teams' to tackle high-priority initiatives and break down barriers."
          />
        </SimpleGrid>
      </AdminLayout>
    );
}

function DimensionRow({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <Box>
      <Group justify="space-between" mb={8}>
        <Text fz="sm" fw={700}>
          {label}
        </Text>
        <Text fz="sm" fw={800}>
          {score}/5
        </Text>
      </Group>
      <Progress value={(score / 5) * 100} color={color} h={10} radius="xl" />
    </Box>
  );
}

function RiskLevel({
  color,
  title,
  desc,
}: {
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <Group align="flex-start" wrap="nowrap">
      <Box
        w={12}
        h={12}
        mt={5}
        style={{ borderRadius: "50%", backgroundColor: color, flexShrink: 0 }}
      />
      <Stack gap={2}>
        <Text fz="sm" fw={800}>
          {title}
        </Text>
        <Text fz="xs" c="dimmed" fw={500} style={{ lineHeight: 1.5 }}>
          {desc}
        </Text>
      </Stack>
    </Group>
  );
}

function FocusCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <Card
      withBorder
      radius="lg"
      p="xl"
      shadow="xs"
      style={{ transition: "0.2s", cursor: "pointer" }}
    >
      <ThemeIcon
        variant="light"
        color="gray"
        size={48}
        radius="md"
        mb="xl"
        bg="#f1f3f5"
      >
        <Icon size={24} color={THEME_BLUE} />
      </ThemeIcon>
      <Title order={4} fw={800} mb="sm">
        {title}
      </Title>
      <Text fz="sm" c="dimmed" fw={500} mb="xl" style={{ lineHeight: 1.6 }}>
        {desc}
      </Text>
      <Group gap={5} style={{ marginTop: "auto" }}>
        <Text fz="xs" fw={800} c={THEME_BLUE}>
          View Resource
        </Text>
        <IconArrowRight size={14} color={THEME_BLUE} stroke={3} />
      </Group>
    </Card>
  );
}
