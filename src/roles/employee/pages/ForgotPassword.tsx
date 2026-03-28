import { useState } from "react";
import {
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
  TextInput,
  PasswordInput,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES, THEME_BLUE } from "@/constants";
import logo from "@/assets/navi-logo.jpeg";
import { requestPasswordReset, resetPasswordWithOtp } from "@/api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSendCode = async () => {
    setError(null);
    setInfo(null);
    const e = email.trim().toLowerCase();
    if (!e) {
      setError("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(e);
      setInfo(res.message);
      setStep("reset");
    } catch (err) {
      const msg =
        (err as { message?: string }).message ??
        "Could not send reset email. Try again later.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    const e = email.trim().toLowerCase();
    if (!e) return;
    setLoading(true);
    try {
      const res = await requestPasswordReset(e);
      setInfo(res.message);
    } catch (err) {
      setError((err as { message?: string }).message ?? "Could not resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setInfo(null);
    const e = email.trim().toLowerCase();
    if (otp.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordWithOtp(e, otp, newPassword);
      setInfo(res.message);
      setTimeout(() => navigate(ROUTES.AUTH_LOGIN, { replace: true }), 2000);
    } catch (err) {
      setError((err as { message?: string }).message ?? "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="100vw" h="100vh" style={{ overflow: "hidden" }}>
      <SimpleGrid
        cols={isMobile ? 1 : 2}
        spacing={0}
        h="100%"
        style={{ gridTemplateRows: isMobile ? "auto 1fr" : undefined }}
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
              mr="10px"
              size={isMobile ? "16px" : "20px"}
              ff="'Montserrat', sans-serif"
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
          gap={0}
          px={isMobile ? "md" : 0}
          py={isMobile ? "lg" : 0}
        >
          <Title c="#0F2B5C" fz={isMobile ? 22 : 28} ta="center">
            {step === "email" ? "Forgot password" : "Reset password"}
          </Title>
          <Text c="#64748B" size={isMobile ? "xs" : "sm"} ta="center" maw={440} px="md">
            {step === "email"
              ? "Enter your account email. We will send a 6-digit code to reset your password."
              : `We sent a code to ${email.trim().toLowerCase()}. Enter it below with your new password.`}
          </Text>
          <Divider
            w={isMobile ? "100%" : "440px"}
            mt="30px"
            c="#E2E8F0"
            size="sm"
          />

          <Stack gap="md" mt="lg" w={isMobile ? "100%" : "440px"} maw="100%">
            {error && (
              <Text c="red" size="sm" fw={600}>
                {error}
              </Text>
            )}
            {info && (
              <Text c="teal.7" size="sm" fw={600}>
                {info}
              </Text>
            )}

            {step === "email" ? (
              <>
                <Stack gap={4}>
                  <Text c="#0F2B5C" size="sm" fw={600}>
                    Email
                  </Text>
                  <TextInput
                    type="email"
                    placeholder="Please enter your email"
                    value={email}
                    onChange={(ev) => setEmail(ev.currentTarget.value)}
                    styles={{ input: { height: "49px" } }}
                    autoComplete="email"
                  />
                </Stack>
                <Button
                  w="100%"
                  bg="#00A99D"
                  c="white"
                  h={50}
                  loading={loading}
                  onClick={handleSendCode}
                >
                  Send reset code
                </Button>
              </>
            ) : (
              <>
                <Stack gap={4}>
                  <Text c="#0F2B5C" size="sm" fw={600}>
                    6-digit code
                  </Text>
                  <TextInput
                    placeholder="000000"
                    value={otp}
                    onChange={(ev) =>
                      setOtp(ev.currentTarget.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    styles={{ input: { height: "49px", letterSpacing: 8, fontSize: 20 } }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </Stack>
                <Stack gap={4}>
                  <Text c="#0F2B5C" size="sm" fw={600}>
                    New password
                  </Text>
                  <PasswordInput
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(ev) => setNewPassword(ev.currentTarget.value)}
                    styles={{ input: { height: "49px" } }}
                    autoComplete="new-password"
                  />
                </Stack>
                <Stack gap={4}>
                  <Text c="#0F2B5C" size="sm" fw={600}>
                    Confirm password
                  </Text>
                  <PasswordInput
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(ev) => setConfirmPassword(ev.currentTarget.value)}
                    styles={{ input: { height: "49px" } }}
                    autoComplete="new-password"
                  />
                </Stack>
                <Button
                  w="100%"
                  bg="#00A99D"
                  c="white"
                  h={50}
                  loading={loading}
                  onClick={handleReset}
                >
                  Update password
                </Button>
                <Group justify="space-between" gap="sm">
                  <Anchor component={Link} to={ROUTES.AUTH_LOGIN} size="sm" fw={600}>
                    Back to sign in
                  </Anchor>
                  <Anchor size="sm" fw={600} onClick={handleResend} style={{ cursor: "pointer" }}>
                    Resend code
                  </Anchor>
                </Group>
              </>
            )}

            {step === "email" && (
              <Text ta="center" size="sm" c="dimmed">
                <Anchor component={Link} to={ROUTES.AUTH_LOGIN} fw={600}>
                  Back to sign in
                </Anchor>
              </Text>
            )}
          </Stack>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
