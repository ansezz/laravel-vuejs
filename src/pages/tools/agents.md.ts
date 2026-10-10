import { agentsMarkdown } from "../../data/dev-tools";
import { markdownResponse } from "../../lib/markdown";

export const GET = () => markdownResponse(agentsMarkdown());
