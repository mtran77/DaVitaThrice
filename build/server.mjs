import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { determineRelevantTags, fetchOpenAIResponse } from "./clients/openaiclient.mjs";
import { fetchConfluenceDocsWithMeta } from "./clients/confluenceclient.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/ask", async (req, res) => {
  const { question } = req.body;
  console.log("📨 Received question:", question);

  try {
    const tags = await determineRelevantTags(question);
    if (!tags.length) return res.status(400).json({ error: "No tags found." });

    const docs = await fetchConfluenceDocsWithMeta(tags);
    const answer = await fetchOpenAIResponse(question, docs);

    res.json({ answer });
  } catch (error) {
    console.error("❌ Backend error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening at http://localhost:${PORT}`);
});
