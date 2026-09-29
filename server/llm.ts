import Anthropic from "@anthropic-ai/sdk";

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

const MODEL = "claude-haiku-4-5-20251001";
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

export async function witnessReply(system: string, history: Turn[]): Promise<string> {
  if (!client) {
    return "(Server has no ANTHROPIC_API_KEY set. Add one to .env and restart.)";
  }
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system,
    messages: history,
  });
  return res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}
