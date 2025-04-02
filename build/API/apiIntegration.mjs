// apiIntegration.mjs
import { fetchConfluenceDocsWithMeta } from '../confluenceclient.js';
import { determineRelevantTags, fetchOpenAIResponse } from '../clients/openaiclient.js';



export async function runIntegrationTestForQuery(question) {
  // Step 1: Determine relevant tags
  const tags = await determineRelevantTags(question);
  if (tags.length === 0) {
    return { error: "No relevant tags found." };
  }

  // Step 2: Fetch Confluence documents
  const { combinedContent, sources } = await fetchConfluenceDocsWithMeta(tags);
  if (!combinedContent) {
    return { error: "No documents found for these tags." };
  }

  // Step 3: Send documents and question to OpenAI for the final answer
  const finalAnswer = await fetchOpenAIResponse(question, combinedContent);
  
  return { answer: finalAnswer, sources };
}
