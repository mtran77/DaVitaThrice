// responsible for sending a request from frontend to backend point
// fix
// frontendAPI.js
export async function runQuery(question) {
  const response = await fetch("http://localhost:3000/api/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  const data = await response.json();
  return data;
}


