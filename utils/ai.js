// utils/ai.js
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askTutor({ question, lessonContext, userName }) {
  const system = `You are a supportive EdTech tutor. 
- Explain clearly in steps.
- When asked about code, give short runnable snippets.
- If the student looks confused, ask one probing question.
- If there's a video or lesson context, use it to answer.`;

  const user = [
    `Student: ${userName || "Student"}`,
    lessonContext ? `Lesson context:\n${lessonContext}` : null,
    `Question:\n${question}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.3,
  });

  return (
    resp.choices[0]?.message?.content?.trim() ||
    "I’m not sure yet. Try rephrasing that?"
  );
}

module.exports = { askTutor };
