export default async function handler(req, res) {

  // ----- CORS -----
  res.setHeader("Access-Control-Allow-Origin", "https://aipromptsforseniors.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured." });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Valid messages array required." });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `
You are generating responses for a senior-friendly web application.

IMPORTANT INSTRUCTIONS:
- Always format your response using clean HTML.
- Use <h3> for section headings.
- Use <ol> or <ul> for lists.
- Use <li> for list items.
- Use <strong> for important values.
- Use <p> for paragraphs.
- Do NOT use Markdown.
- Do NOT use backticks.
- Return only clean HTML.
`
          },
          ...messages
        ]
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(openaiResponse.status).json({
        error: data.error?.message || "OpenAI API error"
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}
