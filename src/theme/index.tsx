import { createTheme } from "@mantine/core";
import { DateInput, DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dateClasses from "./DateInput.module.css";

dayjs.extend(customParseFormat);

/** Display format for every date field: "Apr 27, 2026". */
const DATE_DISPLAY_FORMAT = "MMM D, YYYY";
const TYPED_DATE_FORMATS = [DATE_DISPLAY_FORMAT, "MMMM D, YYYY", "M/D/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

/**
 * Only accept complete dates while typing. dayjs's lenient fallback turns partial input
 * such as "4/2" into the year 2001, which made the calendar jump to the wrong year.
 */
function parseTypedDate(value: string): string | null {
  const parsed = dayjs(value.trim(), TYPED_DATE_FORMATS, true);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
}

const datePopoverProps = {
  withinPortal: true,
  zIndex: 10000,
  shadow: "lg",
  radius: "lg",
  offset: 6,
  transitionProps: { transition: "pop-top-left" as const, duration: 120 },
};

export const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: "Inter, sans-serif",
  components: {
    DateInput: DateInput.extend({
      defaultProps: {
        valueFormat: DATE_DISPLAY_FORMAT,
        dateParser: parseTypedDate,
        placeholder: "Select a date",
        highlightToday: true,
        clearable: true,
        leftSection: <IconCalendar size={18} stroke={1.8} />,
        leftSectionPointerEvents: "none",
        popoverProps: datePopoverProps,
      },
      classNames: dateClasses,
    }),
    DatePickerInput: DatePickerInput.extend({
      defaultProps: {
        valueFormat: DATE_DISPLAY_FORMAT,
        highlightToday: true,
        leftSection: <IconCalendar size={18} stroke={1.8} />,
        leftSectionPointerEvents: "none",
        popoverProps: datePopoverProps,
      },
      classNames: dateClasses,
    }),
  },
});
