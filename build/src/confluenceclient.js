import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const CONFLUENCE_BASE_URL = 'https://miscapstones25.atlassian.net/wiki/rest/api';
const AUTH_HEADER = `Basic ${Buffer.from(`${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`).toString('base64')}`;

/**
 * Fetches the most recent Confluence documents based on relevant tags.
 * @param {string[]} tags - An array of tags to search with.
 * @returns {Promise<string|null>} - Concatenated document content or null if nothing found.
 */
export async function fetchConfluenceDocs(tags) {
  if (!tags || tags.length === 0) {
    console.log("No tags provided. Skipping Confluence request.");
    return null;
  }

  const cqlQuery = tags.map(tag => `label = "${tag}"`).join(' OR ');
  const encodedCql = encodeURIComponent(`(${cqlQuery}) ORDER BY lastModified DESC`);
  const url = `${CONFLUENCE_BASE_URL}/content/search?limit=2&cql=${encodedCql}&expand=space,body.view`;

  console.log("Fetching Confluence docs from:", url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': AUTH_HEADER
      }
    });

    console.log("Confluence response:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Confluence fetch error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("No documents found for these tags.");
      return null;
    }

    // Return document content as a single string
    const content = data.results.map(doc => `${doc.title}: ${doc.body?.view?.value || 'No content available.'}`).join("\n");
    return content;

  } catch (error) {
    console.error("Error fetching from Confluence:", error);
    return null;
  }
}
