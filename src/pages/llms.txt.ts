import { llmsIndex, markdownResponse } from '../lib/markdown'
// https://llmstxt.org/ index of the site for language models.
export const GET = async () => markdownResponse(await llmsIndex(), 'text/plain')
