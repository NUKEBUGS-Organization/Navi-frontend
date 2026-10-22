import { Stack } from "@mantine/core";
import AiInitiativeHealthCard from "./AiInitiativeHealthCard";
import AiAssessmentInsightsCard from "./AiAssessmentInsightsCard";
import AiAdoptionExplainCard from "./AiAdoptionExplainCard";

/** "AI Insights" tab on the initiative detail page. Each AI feature for a single initiative adds a card here. */
export default function AiInitiativeInsights({ initiativeId }: { initiativeId: string }) {
  return (
    <Stack gap="lg">
      <AiInitiativeHealthCard initiativeId={initiativeId} />
      <AiAdoptionExplainCard initiativeId={initiativeId} />
      <AiAssessmentInsightsCard initiativeId={initiativeId} />
    </Stack>
  );
}
