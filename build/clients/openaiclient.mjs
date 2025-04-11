// for handling OpenAI API Calls
// sends prompts and generates responses. 
//_______________________

import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log("Using OpenAI key:", OPENAI_API_KEY ? "Loaded" : "Missing");

// approved tags (move to a config file or database later)
// https://miscapstones25.atlassian.net/wiki/labels/listlabels-alphaview.action
const availableTags = [
  "training", "compliance", "general-medical", "kidney-disease", 
  "kidney-dialysis", "medical-manual", "meeting_minutes", "scheduling"
];

//delay function - helps with fetch timeouts
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// get *relevant* tags from OpenAI based on question
export async function determineRelevantTags(question) {
  const payload = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Given a user question, return the most relevant tags from the provided list. Respond with a comma-separated list of tag names only.'
      },
      {
        role: 'user',
        content: `User question: "${question}"\nAvailable tags: ${availableTags.join(", ")}\nWhich tags are relevant?`
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
    const extractedTags = data.choices[0].message.content.split(",").map(tag => tag.trim());
    const validTags = extractedTags.filter(tag => availableTags.includes(tag));
    console.log("Relevant tags identified:", validTags);
    return validTags;
  } catch (error) {
    console.error("Error in determineRelevantTags:", error);
    return [];
  }
}

//Use documents + question to generate final response
export async function fetchOpenAIResponse(question, context) {
  if (!context) {
    console.log("No context provided. Skipping OpenAI response.");
    return "No relevant documents found.";
  }

  const prompt = `User question: ${question}\n\nRelevant documents:\n${context}\n\nProvide a short and concise answer based only on these documents. 1-4 sentences. Include the titles of all documents used to form this answer.`;

  const payload = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant providing clear answers based on provided documents only.'
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

