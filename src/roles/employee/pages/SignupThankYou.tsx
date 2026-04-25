import {
  Anchor,
  Button,
  List,
  Stack,
  Box,
  SimpleGrid,
  Text,
  Title,
  ThemeIcon,
  Group,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCircleCheck } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { AUTH_HERO_BG, AUTH_LOGO_HEIGHT, ROUTES, THEME_BLUE } from "@/constants";
import { NaviLogo } from "@/components/ui/NaviLogo";

/** Confirmation after submitting the public organization signup form (UAT: prominent next step vs. small toast). */
export default function SignupThankYou() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box w="100vw" mih="100vh" style={{ overflow: "auto" }}>
      <SimpleGrid cols={isMobile ? 1 : 2} spacing={0} mih="100vh">
        <Stack
          bg={AUTH_HERO_BG}
          justify="center"
          align="center"
          px={isMobile ? "md" : "xl"}
          py={isMobile ? "xl" : "xl"}
          mih={isMobile ? 200 : "100vh"}
          style={isMobile ? undefined : { borderRight: "1px solid #e9ecef" }}
        >
          <Group wrap="wrap" justify="center" gap="sm">
            <NaviLogo height={isMobile ? AUTH_LOGO_HEIGHT.mobile : AUTH_LOGO_HEIGHT.desktop} />
            <Text
              c="white"
              size={isMobile ? "lg" : "xl"}
              ff="'Montserrat', sans-serif"
              lh={1.35}
              maw={360}
              ta={isMobile ? "center" : "left"}
            >
              Your Change Navigator.
            </Text>
          </Group>
        </Stack>

        <Stack
          bg="#FFFFFF"
          justify="center"
          align="flex-start"
          px={isMobile ? "md" : 48}
          py={isMobile ? "xl" : 48}
          gap="lg"
          maw={560}
          mx={isMobile ? 0 : "auto"}
          w="100%"
        >
          <ThemeIcon size={56} radius="xl" color="teal" variant="light">
            <IconCircleCheck size={32} stroke={2} />
          </ThemeIcon>
          <Title order={1} c="#0F2B5C" fz={isMobile ? 26 : 32} lh={1.2}>
            Thank you — we received your request
          </Title>
          <Text c="#64748B" size="md" lh={1.6}>
            Our team will review your organization details and follow up by email. You will hear from us at the
            address you provided once your workspace is ready.
          </Text>

          <Box w="100%">
            <Text fw={700} c="#0F2B5C" mb="sm">
              While you wait
            </Text>
            <List spacing="xs" size="sm" c="#475569" icon={<Text c={THEME_BLUE}>•</Text>}>
              <List.Item>
                <Text size="sm" component="span">
                  Explore{" "}
                  <Anchor href="https://changewithnavi.com" target="_blank" rel="noreferrer" fw={600}>
                    articles and resources on leading change
                  </Anchor>{" "}
                  with clarity and accountability.
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm" component="span">
                  Join our mailing list for product updates:{" "}
                  <Anchor href="https://zc.vg/ZNmeY" target="_blank" rel="noreferrer" fw={600}>
                    https://zc.vg/ZNmeY
                  </Anchor>
                </Text>
              </List.Item>
            </List>
          </Box>

          <Button component={Link} to={ROUTES.AUTH_LOGIN} radius="md" size="md" bg="#00A99D" mt="md">
            Back to sign in
          </Button>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
