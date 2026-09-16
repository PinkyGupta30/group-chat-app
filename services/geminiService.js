const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function getSuggestions(message) {

    const prompt = `
You are an AI assistant for a chat application.

User message:
"${message}"

Generate:
1. Three short predictive typing suggestions.
2. Three short smart replies.

Rules:
- Keep suggestions short and relevant.
- Keep replies natural and friendly.
- Content must be appropriate.
- Return ONLY JSON.

Return exactly:

{
  "typingSuggestions": ["...", "...", "..."],
  "smartReplies": ["...", "...", "..."]
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    return JSON.parse(response.text);
}

module.exports = {
    getSuggestions
};