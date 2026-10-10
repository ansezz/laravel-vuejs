import { llmsFull, markdownResponse } from '../lib/markdown'
export const GET = async () => markdownResponse(await llmsFull(), 'text/plain')
