// apiIntegration.mjs - handles the integration logic between confluence and openai
// processes user queries
import { fetchConfluenceDocsWithMeta } from '../clients/confluenceclient.mjs';
import { determineRelevantTags, fetchOpenAIResponse } from '../clients/openaiclient.mjs';


export async function runIntegrationTestForQuery(question) {
  // determine relevant tags
  const tags = await determineRelevantTags(question);
  if (tags.length === 0) {
    return { error: "No relevant tags found." };
  }

  // retrieve confluence documents
  const { combinedContent, sources } = await fetchConfluenceDocsWithMeta(tags);
  if (!combinedContent) {
    return { error: "No documents found for these tags." };
  }

  // send documents and question to OpenAI for the final answer
  const finalAnswer = await fetchOpenAIResponse(question, combinedContent);

  return { answer: finalAnswer, sources };
}
