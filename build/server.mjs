app.use(express.static('public'));

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { runIntegrationTestForQuery } from './public/apiIntegration.mjs';
import { determineRelevantTags, fetchOpenAIResponse } from '../clients/openaiclient.js';
import { fetchConfluenceDocsWithMeta } from '../clients/confluenceclient.js';



const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/query', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing 'question' in request body." });
    }

    const result = await runIntegrationTestForQuery(question);
    if (result.error) {
      return res.status(200).json({ answer: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

