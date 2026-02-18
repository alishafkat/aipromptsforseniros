export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { messages } = req.body;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })
    });

    const data = await response.json();

    const reply = data.output[0].content[0].text;

    res.status(200).json({ reply });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Server error" });

  }
}
