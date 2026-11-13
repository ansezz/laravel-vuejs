import { agentReadinessMarkdown } from "../../data/agent-readiness";
import { markdownResponse } from "../../lib/markdown";

export const GET = () => markdownResponse(agentReadinessMarkdown());
