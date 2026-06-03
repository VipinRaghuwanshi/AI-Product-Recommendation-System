export async function getRecommendations(userInput, products) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.error("Missing Groq API key");
    return [];
  }

  const prompt = `You are a product recommendation engine.
You must recommend products ONLY from the list provided.
Do NOT suggest products outside the list.
Do NOT explain your reasoning.
Return ONLY a raw JSON array of product names — no markdown, no backticks, no explanation.

User preference:
"${userInput}"

Available products:
${JSON.stringify(products, null, 2)}

Example output format:
["Galaxy A14","OnePlus Nord"]`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a product recommendation engine. Always respond with ONLY a valid JSON array. No markdown, no explanation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]) {
      console.error("Groq API Error:", data);
      return [];
    }

    let content = data.choices[0].message.content.trim();

    // ✅ Markdown backticks remove karo agar AI ne wrap kiya ho
    content = content.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
      console.error("Response is not an array:", parsed);
      return [];
    } catch (e) {
      console.error("Invalid JSON returned:", content);
      return [];
    }

  } catch (err) {
    console.error("AI request failed:", err);
    return [];
  }
}