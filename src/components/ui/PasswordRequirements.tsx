import { Group, Stack, Text } from "@mantine/core";
import { IconCheck, IconCircle } from "@tabler/icons-react";

/** Mirrors the backend StrongPassword() policy in Navi-backend/src/features/auth/dto/auth.dto.ts. */
export const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: "At least 12 characters", test: (pw) => pw.trim().length >= 12 },
  { label: "One uppercase letter (A–Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number (0–9)", test: (pw) => /\d/.test(pw) },
  { label: "One special character, e.g. ! @ # $ %", test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
];

export function isStrongPassword(pw: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(pw));
}

/** Live checklist shown under a "new password" field; each rule turns green as it is met. */
export function PasswordRequirements({ value, extra }: { value: string; extra?: string[] }) {
  return (
    <Stack gap={4}>
      <Text size="xs" fw={700} c="dimmed">
        Your new password must have:
      </Text>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <Group key={rule.label} gap={6} wrap="nowrap">
            {ok ? (
              <IconCheck size={14} color="var(--mantine-color-teal-6)" stroke={3} />
            ) : (
              <IconCircle size={12} color="var(--mantine-color-gray-5)" />
            )}
            <Text size="xs" c={ok ? "teal.7" : "dimmed"} fw={ok ? 600 : 500}>
              {rule.label}
            </Text>
          </Group>
        );
      })}
      {extra?.map((note) => (
        <Text key={note} size="xs" c="dimmed">
          • {note}
        </Text>
      ))}
    </Stack>
  );
}
