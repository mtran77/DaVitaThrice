// server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { runIntegrationTestForQuery } from './API/apiIntegration.mjs';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Serve static frontend files from clients/public
app.use(express.static(path.join(__dirname, 'clients', 'public')));

// API endpoint
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

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
