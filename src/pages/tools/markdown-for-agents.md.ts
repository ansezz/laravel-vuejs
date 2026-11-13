import { markdownToolMarkdown } from "../../data/agent-tools";
import { markdownResponse } from "../../lib/markdown";

export const GET = () => markdownResponse(markdownToolMarkdown());
