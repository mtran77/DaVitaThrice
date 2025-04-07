// for handling OpenAI API Calls
//_______________________

import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log("Loaded API Key:", OPENAI_API_KEY);
console.log("Using OpenAI key:", OPENAI_API_KEY ? "Loaded" : "Missing");

// approved tags (move to a config file or database later)
const availableTags = [
  "training", "compliance", "general-medical", "kidney-disease", 
  "kidney-dialysis", "medical-manual", "meeting_minutes", "scheduling"
];

//delay function - helps with fetch timeouts
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//Get relevant tags from OpenAI based on question
export async function determineRelevantTags(question) {
  const payload = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an AI assistant that selects the most relevant tags for a question. You must choose ONLY from this list of tags: ${availableTags.join(", ")}. Your response must be a comma-separated list of only the tag names exactly as written.`
      },
      {
        role: 'user',
        content: `Question: "${question}"\nWhich tags are relevant?`
      }
    ]
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Error calling OpenAI (tag detection):", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const extractedTags = data.choices[0].message.content
    .split(",")
    .map(tag => tag.trim());
  
  console.log("Relevant tags identified:", extractedTags);
  return extractedTags;
  
  } catch (error) {
    console.error("Error in determineRelevantTags:", error);
    return [];
  }
}

//Use documents + question to generate final response
export async function fetchOpenAIResponse(question, context) {
  // edited to add error message per output instructions DS
  // added additional 'no context' check DS
  if (!context) {
    console.log("No context provided. Skipping OpenAI response.");
    return "I'm sorry, there are no documents that are relevant to the question in Confluence.";
  }  
// end error message edits DS

// prompt edits below DS
  const prompt = `
  You are an assistant. Your job is to answer questions using only the provided documents. Follow these rules:
  
  - Be clear, concise (5 sentences maximum).
  - Always cite the document title(s) and include a working link if possible.
  - Do not answer questions if the context is not sufficient; instead, say: “I'm sorry, there are no documents that are relevant to the question in Confluence.”
  - Do not make up information. Do not use outside knowledge.
  - Format like this: Your answer, then below: [document name]\nLink to source: https://...\n
  
  Question: ${question}
  
  Documents:
  ${context}
  `;
  // end prompt edits DS
  const payload = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        // below edited for reinforcement DS
        content: 'You are a helpful assistant named Danny. Only use the provided documents to answer. Limit the response to 5 sentences unless the question requires comparisons, quotes, or multi-step answers. Always include the document name and link used below your answer to the prompt.'
        // end reinforcement edits DS
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Error calling OpenAI (final response):", response.status, response.statusText);
      return "There was an issue generating a response.";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error("Error in fetchOpenAIResponse:", error);
    return "There was an issue retrieving a response.";
  }
}

//Full process from question to response
export async function generateResponse(question, context) {
  console.log("Waiting 5 seconds before calling OpenAI...");
  await wait(5000);

  try {
    const answer = await fetchOpenAIResponse(question, context);
    return answer;
  } catch (error) {
    console.error("Error in generateResponse:", error);
    return "There was a problem generating the answer.";
  }
}

