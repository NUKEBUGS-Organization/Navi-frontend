import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Stack,
  Box,
} from "@mantine/core";

const LoginPage = () => {
  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Container size={420} w="100%">
        <Title ta="center" fw={900} order={2}>
          NAVI Platform
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Welcome back! Please enter your details.
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Stack>
            <TextInput
              label="Email Address"
              placeholder="admin@navi.com"
              required
            />
            <PasswordInput label="Password" placeholder="••••••••" required />
          </Stack>

          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember session" />
            <Anchor component="button" size="sm" fw={500}>
              Forgot password?
            </Anchor>
          </Group>

          <Button fullWidth mt="xl" radius="md" size="md">
            Sign in
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
