import { OpenRouter } from "@openrouter/sdk";

const getSantaFeedback = async (score: number, win: boolean): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      return "Santa is currently feeding the reindeer (No API Key).";
    }

    const client = new OpenRouter({ apiKey });

    const prompt = `
      You are Santa Claus.
      A player just finished playing "Elf Invaders" (a Space Invaders clone where elves rebelled).
      Their Score: ${score}.
      Result: ${win ? "They saved Christmas!" : "The elves took over."}

      Write a very short (max 2 sentences), funny, festive comment evaluating their performance for the "Naughty or Nice" list.
      Use emojis.
    `;

    // Free tier model - 50 requests/day, $0 cost
    console.log("Calling OpenRouter API...");
    const response = await client.chat.send({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [{ role: "user", content: prompt }]
    });

    let content = response.choices?.[0]?.message?.content || "Ho ho ho! Merry gaming!";
    // Clean up Mistral formatting tags
    content = content.replace(/<s>\s*\[OUT\]\s*/g, '').replace(/\s*\[\/OUT\]\s*/g, '').trim();
    return content;
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return "Santa's communication lines are frozen! (API Error)";
  }
};

export { getSantaFeedback };
