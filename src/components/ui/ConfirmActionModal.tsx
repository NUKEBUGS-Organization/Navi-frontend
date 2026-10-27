import { useEffect, useState, type ReactNode } from "react";
import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";

export interface ConfirmActionModalProps {
  opened: boolean;
  onClose: () => void;
  /** Runs the action. Throw to keep the dialog open and show the error message. */
  onConfirm: () => Promise<void>;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  /** Button color: "red" for destructive actions. */
  color?: string;
  /**
   * When set, the user must type this exact text (e.g. the item's name) before confirming.
   * Used for permanent deletes.
   */
  requireTypedText?: string;
}

/** Confirmation dialog for archive / restore / permanent delete actions. */
export function ConfirmActionModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  color = "blue",
  requireTypedText,
}: ConfirmActionModalProps) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setTyped("");
      setError(null);
    }
  }, [opened]);

  const typedOk = !requireTypedText || typed.trim() === requireTypedText.trim();

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal opened={opened} onClose={busy ? () => {} : onClose} title={<Text fw={700}>{title}</Text>} centered radius="md">
      <Stack gap="md">
        <Text size="sm" component="div">
          {message}
        </Text>
        {requireTypedText && (
          <TextInput
            label={
              <Text size="sm" span>
                Type <b>{requireTypedText}</b> to confirm
              </Text>
            }
            value={typed}
            onChange={(e) => setTyped(e.currentTarget.value)}
            autoFocus
            data-autofocus
          />
        )}
        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button color={color} onClick={handleConfirm} loading={busy} disabled={!typedOk}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
