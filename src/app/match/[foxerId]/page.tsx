import MatchConfig from "@/features/match/components/MatchConfig";
import { fetchEventTemplateById } from "@/features/event/api/event-templates";

export default function MatchConfigPage() {
  return <MatchConfig fetchTemplate={fetchEventTemplateById} />;
}
