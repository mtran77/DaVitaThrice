// responsible for sending a request from frontend to backend point

export async function runQuery(userInput) {
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: userInput })
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in runQuery:", error);
      return { answer: "There was an error processing your request." };
    }
  }
  