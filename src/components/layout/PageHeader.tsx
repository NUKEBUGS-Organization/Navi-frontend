import { Group, Stack, Title, Text, Breadcrumbs, Anchor } from "@mantine/core";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap">
      <Stack gap={4}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs separator=">" styles={{ separator: { color: "var(--mantine-color-dimmed)" } }}>
            {breadcrumbs.map((item) => (
              <Anchor
                key={item.title}
                href={item.href ?? "#"}
                size="sm"
                c="dimmed"
                fw={600}
              >
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
        )}
        <Title order={1} fw={800} fz={28}>
          {title}
        </Title>
        {subtitle && (
          <Text c="dimmed" fz="sm">
            {subtitle}
          </Text>
        )}
      </Stack>
      {actions}
    </Group>
  );
}
