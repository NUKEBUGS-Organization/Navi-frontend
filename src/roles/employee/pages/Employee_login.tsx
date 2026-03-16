import { useState } from "react";
import {
  PasswordInput,
  Checkbox,
  Anchor,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Box,
  SimpleGrid,
  Image,
  Divider,
  Input,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ROUTES, THEME_BLUE } from "@/constants";
import logo from "@/assets/navi-logo.jpeg";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { login as apiLogin } from "@/api/auth";
import type { ApiError } from "@/api/client";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin, token, user, isReady } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isReady) return null;
  if (token && user) {
    const to = user.role === "super_admin" ? ROUTES.SUPER_ADMIN_DASHBOARD : ROUTES.ADMIN_DASHBOARD;
    return <Navigate to={to} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    console.log("Sign In — submitted data:", { email: normalizedEmail, password });
    setLoading(true);
    try {
      const data = await apiLogin(normalizedEmail, password);
      authLogin(data.access_token, data.user);
      const redirect =
        data.user.role === "super_admin"
          ? ROUTES.SUPER_ADMIN_DASHBOARD
          : ROUTES.ADMIN_DASHBOARD;
      navigate(redirect, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : (err as ApiError)?.message ?? "Invalid email or password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      w="100vw"
      h="100vh"
      style={{
        overflow: "hidden",
      }}
    >
      <SimpleGrid
        cols={isMobile ? 1 : 2}
        spacing={0}
        h="100%"
        style={{
          gridTemplateRows: isMobile ? "auto 1fr" : undefined,
        }}
      >
        <Stack
          bg={THEME_BLUE}
          h="100%"
          justify="center"
          align="center"
          px={isMobile ? "md" : 0}
          py={isMobile ? "lg" : 0}
        >
          <Group>
            <Image
              src={logo}
              h={isMobile ? "72px" : "100px"}
              w={isMobile ? "72px" : "100px"}
              radius="50%"
            />

            <Text
              c="white"
              mr={"10px"}
              size={isMobile ? "16px" : "20px"}
              ff="Inter"
              lh="28px"
            >
              Your Change Navigator.
            </Text>
          </Group>
        </Stack>
        <Stack
          bg="#FFFFFF"
          h="100%"
          justify={isMobile ? "flex-start" : "center"}
          align="center"
          gap={"0"}
          px={isMobile ? "md" : 0}
          py={isMobile ? "lg" : 0}
        >
          <Title c={"#0F2B5C"} fz={isMobile ? 22 : 28}>
            Welcome back
          </Title>
          <Text c="#64748B" size={isMobile ? "xs" : "sm"}>
            Sign in to your Navi account
          </Text>
          <Divider
            w={isMobile ? "100%" : "440px"}
            mt={"30px"}
            c={"#E2E8F0"}
            size={"sm"}
          />
          <form
            onSubmit={handleSubmit}
            style={{ width: isMobile ? "100%" : "440px", marginTop: 24 }}
          >
            <Stack gap="md">
              {error && (
                <Text c="red" size="sm" fw={600}>
                  {error}
                </Text>
              )}
              <Stack gap={4}>
                <Text c={"#0F2B5C"}>Email</Text>
                <Input
                  type="email"
                  placeholder="Please Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  styles={{ input: { height: "49px" } }}
                />
              </Stack>
              <Stack gap={4}>
                <Text c={"#0F2B5C"}>Password</Text>
                <PasswordInput
                  placeholder="Please Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  styles={{ input: { height: "49px" } }}
                />
              </Stack>
              <Group justify="space-between" wrap="wrap" gap="xs">
                <Checkbox
                  label="Remember me"
                  c={"#0F2B5C"}
                  checked={remember}
                  onChange={(e) => setRemember(e.currentTarget.checked)}
                />
                <Anchor>Forgot Password?</Anchor>
              </Group>
              <Button
                type="submit"
                mt="sm"
                w="100%"
                bg="#00A99D"
                c="white"
                h={"50px"}
                loading={loading}
              >
                Sign In
              </Button>
            </Stack>
          </form>
          <Divider
            my="xs"
            label="OR"
            labelPosition="center"
            w={isMobile ? "100%" : "440px"}
            mt={"30px"}
          />
          <Text mt={"30px"} ta="center">
            Don't have an account?{" "}
            <Anchor href={ROUTES.AUTH_SIGNUP}>
              Submit an organization request
            </Anchor>
          </Text>
        </Stack>
      </SimpleGrid>
    </Box>
  );
};

export default EmployeeLogin;
