// aiquery.js (adapted for the browser)

// Fetch OpenAI response with tags
async function determineRelevantTags(question) {
  const OPENAI_API_KEY = 'your-openai-api-key'; // Directly set your API key or load securely

  const availableTags = [
    "training", "compliance", "general-medical", "kidney-disease",
    "kidney-dialysis", "medical-manual", "meeting_minutes", "scheduling"
  ];

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
    return extractedTags;
  } catch (error) {
    console.error("Error in determineRelevantTags:", error);
    return [];
  }
}

// Fetch documents from Confluence
async function fetchConfluenceDocsWithMeta(tags) {
  const CONFLUENCE_BASE_URL = 'https://miscapstones25.atlassian.net/wiki/rest/api';
  const AUTH_HEADER = `Basic ${btoa('your-email:your-api-token')}`; // Encoding email and API token

  const cqlQuery = tags.map(tag => `label = "${tag}"`).join(' OR ');
  const encodedCql = encodeURIComponent(`(${cqlQuery}) ORDER BY lastModified DESC`);
  const url = `${CONFLUENCE_BASE_URL}/content/search?limit=5&cql=${encodedCql}&expand=space,body.view`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': AUTH_HEADER
      }
    });

    if (!response.ok) {
      throw new Error(`Confluence fetch error: ${response.status}`);
    }

    const data = await response.json();
    const docContents = [];
    const sources = [];

    for (const doc of data.results) {
      const title = doc.title || 'Untitled';
      const body = doc.body?.view?.value || '';
      const webUrl = `https://miscapstones25.atlassian.net/wiki${doc._links.webui}`;

      if (body.length > 0) {
        docContents.push(`${title}:\n${stripHtml(body)}`);
        sources.push({ title, url: webUrl });
      }
    }

    if (docContents.length === 0) {
      console.log("No content in documents.");
      return null;
    }

    return {
      combinedContent: docContents.join('\n\n---\n\n'),
      sources
    };

  } catch (error) {
    console.error("Error during Confluence fetch:", error);
    return null;
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '');
}

// Full process for getting response from OpenAI and Confluence
async function runQuery(userMessage) {
  //tester 
  console.log(userMessage)

  const tags = await determineRelevantTags(userMessage);
  // if (tags.length === 0) {
  //   console.log("No tags found. Exiting.");
  //   return;
  // }

  const { combinedContent, sources } = await fetchConfluenceDocsWithMeta(tags);
  if (!combinedContent) {
    console.log("No documents found for these tags. Exiting.");
    return;
  }

  const prompt = `User question: ${userMessage}\n\nRelevant documents:\n${combinedContent}\n\nProvide a short and concise answer based only on these documents. 1-4 sentences. Include the titles of all documents used to form this answer.`;

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
        'Authorization': `Bearer your-openai-api-key`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Error calling OpenAI (final response):", response.status, response.statusText);
      return "There was an issue generating a response.";
    }

    const data = await response.json();
    const finalAnswer = data.choices[0]?.message?.content || "I couldn't generate a response.";
    return {
      answer: finalAnswer,
      sources
    };

  } catch (error) {
    console.error("Error during OpenAI response:", error);
    return { answer: "There was an issue retrieving a response." };
  }
}
