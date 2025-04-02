// import dotenv from 'dotenv';
// import fetch from 'node-fetch';

// dotenv.config();

// const CONFLUENCE_BASE_URL = 'https://miscapstones25.atlassian.net/wiki/rest/api';
// const AUTH_HEADER = `Basic ${Buffer.from(`${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`).toString('base64')}`;

// /**
//  * Fetches Confluence documents matching given labels.
//  * @param {string[]} tags - List of label strings.
//  * @returns {Promise<{ combinedContent: string, sources: string[] } | null>}
//  */
// export async function fetchConfluenceDocsWithMeta(tags) {
//   if (!process.env.CONFLUENCE_EMAIL || !process.env.CONFLUENCE_API_TOKEN) {
//     console.error("Missing Confluence credentials.");
//     return null;
//   }

//   const cqlQuery = tags.map(tag => `label = "${tag}"`).join(' OR ');
//   const encodedCql = encodeURIComponent(`(${cqlQuery}) ORDER BY lastModified DESC`);
//   const url = `${CONFLUENCE_BASE_URL}/content/search?limit=5&cql=${encodedCql}&expand=space,body.view`;

//   console.log("📡 Fetching Confluence docs from:", url);

//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Authorization': AUTH_HEADER
//       }
//     });

//     console.log("Confluence response:", response.status, response.statusText);

//     if (!response.ok) {
//       throw new Error(`Confluence fetch error: ${response.status}`);
//     }

//     const data = await response.json();

//     if (!data.results || data.results.length === 0) {
//       console.log("No documents found for these tags.");
//       return null;
//     }

//     const sources = [];
//     const docContents = [];

//     for (const doc of data.results) {
//       const title = doc.title || 'Untitled';
//       const body = doc.body?.view?.value || '';
//       const webUrl = `https://miscapstones25.atlassian.net/wiki${doc._links.webui}`;

//       console.log(`Document: "${title}" (${body.length} chars)`);

//       if (body.length > 0) {
//         docContents.push(`${title}:\n${stripHtml(body)}`);
//         sources.push({ title, url: webUrl });
//       }
//     }

//     if (docContents.length === 0) {
//       console.log("All documents returned were empty.");
//       return null;
//     }

//     return {
//       combinedContent: docContents.join('\n\n---\n\n'),
//       sources
//     };

//   } catch (error) {
//     console.error("Error during Confluence fetch:", error);
//     return null;
//   }
// }

// /**
//  * Removes HTML tags from Confluence body content.
//  * @param {string} html
//  * @returns {string}
//  */
// function stripHtml(html) {
//   return html.replace(/<[^>]+>/g, '');
// }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { tags } = req.query;
  if (!tags) {
    return res.status(400).json({ error: 'Tags are required' });
  }

  if (!process.env.CONFLUENCE_EMAIL || !process.env.CONFLUENCE_API_TOKEN) {
    return res.status(500).json({ error: "Missing Confluence credentials." });
  }

  const CONFLUENCE_BASE_URL = 'https://miscapstones25.atlassian.net/wiki/rest/api';
  const authHeader = `Basic ${Buffer.from(`${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`).toString('base64')}`;

  const cqlQuery = tags.split(',').map(tag => `label = "${tag}"`).join(' OR ');
  const encodedCql = encodeURIComponent(`(${cqlQuery}) ORDER BY lastModified DESC`);
  const url = `${CONFLUENCE_BASE_URL}/content/search?limit=5&cql=${encodedCql}&expand=space,body.view`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      throw new Error(`Confluence fetch error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return res.json({ combinedContent: '', sources: [] });
    }

    const sources = data.results.map(doc => ({
      title: doc.title || 'Untitled',
      url: `https://miscapstones25.atlassian.net/wiki${doc._links.webui}`
    }));

    const combinedContent = data.results
      .map(doc => `${doc.title}:\n${stripHtml(doc.body?.view?.value || '')}`)
      .join('\n\n---\n\n');

    res.json({ combinedContent, sources });

  } catch (error) {
    console.error("Error fetching Confluence data:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '');
}
