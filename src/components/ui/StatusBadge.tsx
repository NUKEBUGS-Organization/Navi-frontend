import { Badge } from "@mantine/core";

export type StatusVariant = "active" | "draft" | "planning" | "blocked" | "in_progress" | "not_started" | "completed";

const STATUS_CONFIG: Record<
  StatusVariant,
  { bg: string; color: string; label?: string }
> = {
  active: { bg: "#e6fcf5", color: "#099268" },
  in_progress: { bg: "#e7f5ff", color: "#228be6" },
  completed: { bg: "#e6fcf5", color: "#099268" },
  draft: { bg: "#f1f3f5", color: "#868e96" },
  planning: { bg: "#e7f5ff", color: "#1971c2" },
  blocked: { bg: "#fff5f5", color: "#fa5252" },
  not_started: { bg: "#e9ecef", color: "#495057" },
};

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: "xs" | "sm" | "md" | "lg";
  uppercase?: boolean;
}

function normalizeStatus(s: string): StatusVariant {
  const lower = s.toLowerCase().replace(/\s+/g, "_");
  if (lower === "in_progress" || lower === "in progress") return "in_progress";
  if (lower === "not_started" || lower === "not started") return "not_started";
  if (["active", "draft", "planning", "blocked", "completed"].includes(lower))
    return lower as StatusVariant;
  return "in_progress";
}

export function StatusBadge({
  status,
  variant,
  size = "sm",
  uppercase = true,
}: StatusBadgeProps) {
  const key = variant ?? normalizeStatus(status);
  const config = STATUS_CONFIG[key] ?? STATUS_CONFIG.in_progress;
  return (
    <Badge
      size={size}
      radius="sm"
      variant="filled"
      styles={{
        root: {
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 700,
        },
      }}
    >
      {uppercase ? status.toUpperCase() : status}
    </Badge>
  );
}
