import { Checkbox, Stack } from "@mantine/core";

export type RiskComplianceValue = { hseImpact: boolean; foodSafetyImpact: boolean };

/** HSE / Food Safety impact flags for an initiative (shown in the overview and Risk Monitoring pre-flight). */
export function RiskComplianceFields({
  value,
  onChange,
}: {
  value: RiskComplianceValue;
  onChange: (next: RiskComplianceValue) => void;
}) {
  return (
    <Stack gap="sm">
      <Checkbox
        label="HSE impact"
        description="This change affects Health, Safety or Environment (e.g. new equipment, processes, site layout, PPE)."
        checked={value.hseImpact}
        onChange={(e) => onChange({ ...value, hseImpact: e.currentTarget.checked })}
      />
      <Checkbox
        label="Food safety impact"
        description="This change affects food handling, storage, suppliers, allergens or HACCP controls."
        checked={value.foodSafetyImpact}
        onChange={(e) => onChange({ ...value, foodSafetyImpact: e.currentTarget.checked })}
      />
    </Stack>
  );
}
