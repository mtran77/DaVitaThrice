// test created to test the interactions of openai and confluence during troubleshooting and debugging 

import dotenv from 'dotenv';
dotenv.config();

import readline from 'readline';
import { determineRelevantTags, fetchOpenAIResponse } from './openaiclient.js';
import { fetchConfluenceDocsWithMeta } from './confluenceclient.js';


// Prompt user for input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

async function runIntegrationTest() {
  console.log("Danny Davita - Terminal Integration Test");
  const question = await askQuestion("Enter your question: ");

  console.log("\nStep 1: Determining relevant tags from OpenAI...");
  const tags = await determineRelevantTags(question);
  if (tags.length === 0) {
    console.log("No tags found. Exiting.");
    return;
  }
  console.log("Tags identified:", tags.join(", "));

  console.log("\nStep 2: Fetching Confluence documents...");
  const { combinedContent, sources } = await fetchConfluenceDocsWithMeta(tags);
  if (!combinedContent) {
    console.log("No documents found for these tags. Exiting.");
    return;
  }
  console.log(`Retrieved ${sources.length} document(s) from Confluence.`);

  console.log("\nStep 3: Sending documents + question to OpenAI for final response...");
  const finalAnswer = await fetchOpenAIResponse(question, combinedContent);
  console.log("\nFinal Answer:\n");
  console.log(finalAnswer);

  console.log("Sources:");
  sources.forEach((src, i) => {
    console.log(`${i + 1}. ${src.title}: ${src.url}`);
  });
  

  console.log("\nIntegration test complete.\n");
}

runIntegrationTest();
