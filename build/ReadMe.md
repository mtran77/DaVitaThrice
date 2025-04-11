This version of DannyDavita (DaVitaGPT) is built to run locally (on localhost) as a proof of concept. It connects to Confluence to retrieve tagged documents and uses OpenAI to answer user questions based on that content.


It is expected to have an .env file with an OpenAI API Key, Confluence email, and Confluence API Key. 
.gitignore is expected to include .env 
This version currently requires the following packages:
-npm install
-npm install express
-npm install dotenv node-fetch
-npm install -g http-server

to get started: 
-update tag list in openaiclient.mjs
-cd build
-node server.mjs
-open your browser and enter http://localhost:3000

Current Features:
-Conversational Front end with persisent chat history 
-Connects to confluence and uses tags/labels to indentify relevant documents
-Uses OpenAI to generate (context-aware) answers
-User-friendly Interface similar to ChatGpt
-Local Storage of messages (until cleared)

Notes:
-This current version (local hosted) is for demonstration only
-You MUST have access to a confluence space with labeled pages that match expected tags AND access to OpenAI
-You MUST have no restrictions on your confluence account to access all documents within your workspace. 

Future Work:
-This product will be hosted on Vercel 
-Config file addition for tags 


