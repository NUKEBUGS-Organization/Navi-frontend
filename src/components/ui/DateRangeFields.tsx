import { Grid, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import type { ReactNode } from "react";
import { formatDateRange, parseDateOnly, parseDateRangeParts } from "@/utils";

type DateRangeFieldsProps = {
  /** Initiative `dateRange` string, e.g. "Apr 27, 2026 – Sep 30, 2026". */
  value: string;
  onChange: (dateRange: string) => void;
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  size?: "sm" | "md";
  error?: ReactNode;
};

/** Start / target-end calendar pickers that read and write an initiative `dateRange` string. */
export function DateRangeFields({
  value,
  onChange,
  startLabel = "Start date",
  endLabel = "Target end date",
  size = "md",
  error,
}: DateRangeFieldsProps) {
  const { start, end } = parseDateRangeParts(value);

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <DateInput
          label={typeof startLabel === "string" ? <Text fw={700} fz="sm" mb={4} span>{startLabel}</Text> : startLabel}
          size={size}
          value={start}
          defaultDate={start ?? new Date()}
          maxDate={end ?? undefined}
          onChange={(v) => onChange(formatDateRange(parseDateOnly(v), end))}
          error={error}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <DateInput
          label={typeof endLabel === "string" ? <Text fw={700} fz="sm" mb={4} span>{endLabel}</Text> : endLabel}
          size={size}
          value={end}
          minDate={start ?? undefined}
          defaultDate={start ?? new Date()}
          onChange={(v) => onChange(formatDateRange(start, parseDateOnly(v)))}
        />
      </Grid.Col>
    </Grid>
  );
}
