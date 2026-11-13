import { robotsToolMarkdown } from "../../data/agent-tools";
import { AI_BOTS } from "../../data/robots";
import { markdownResponse } from "../../lib/markdown";

export const GET = () => markdownResponse(robotsToolMarkdown(AI_BOTS));
