import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import type { CSSProperties } from "react";

type ColorSchemeToggleProps = {
  /** When set, styles for placement on the navy sidebar (light icon affordance). */
  variant?: "default" | "sidebar";
  /** Smaller control for a single row with avatar / name (sidebar footer). */
  compact?: boolean;
  style?: CSSProperties;
};

export function ColorSchemeToggle({ variant = "default", compact = false, style }: ColorSchemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light");
  const isDark = computed === "dark";

  const sidebar = variant === "sidebar";
  const iconSize = compact ? 18 : 20;
  const actionSize = compact ? "md" : "lg";

  return (
    <Tooltip
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      position={sidebar && compact ? "left" : "right"}
    >
      <ActionIcon
        onClick={() => setColorScheme(isDark ? "light" : "dark")}
        variant={sidebar ? "subtle" : "default"}
        color={sidebar ? "gray" : undefined}
        size={actionSize}
        radius="md"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={
          sidebar
            ? { color: "rgba(255,255,255,0.85)", flexShrink: 0, ...style }
            : { flexShrink: 0, ...style }
        }
      >
        {isDark ? <IconSun size={iconSize} stroke={1.5} /> : <IconMoon size={iconSize} stroke={1.5} />}
      </ActionIcon>
    </Tooltip>
  );
}
