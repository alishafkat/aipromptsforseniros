export default async function handler(req, res) {

  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "https://aipromptsforseniors.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured." });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Valid messages array required." });
    }

    // Convert conversation into plain text prompt
    const prompt = messages
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API error"
      });
    }

    return res.status(200).json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}
