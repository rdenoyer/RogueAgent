import Anthropic from "@anthropic-ai/sdk";
import type { LevelTool } from "./levels/types.js";

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

export interface ToolCallLog {
  name: string;
  args: Record<string, unknown>;
  result: string;
}

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOOL_ROUNDS = 4;
const MAX_RESULT = 2000;
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

export async function witnessReply(
  system: string,
  history: Turn[],
  tools: LevelTool[] = [],
): Promise<{ reply: string; toolCalls: ToolCallLog[] }> {
  if (!client) {
    return { reply: "(Server has no ANTHROPIC_API_KEY set. Add one to .env and restart.)", toolCalls: [] };
  }

  const apiTools: Anthropic.Tool[] = tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: { type: "object", properties: t.properties, required: t.required },
  }));
  const messages: Anthropic.MessageParam[] = [...history];
  const toolCalls: ToolCallLog[] = [];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system,
      messages,
      ...(apiTools.length ? { tools: apiTools } : {}),
    });

    const uses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (res.stop_reason !== "tool_use" || uses.length === 0 || round === MAX_TOOL_ROUNDS) {
      const reply = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
      return { reply: reply || "(no reply)", toolCalls };
    }

    messages.push({ role: "assistant", content: res.content });
    const results: Anthropic.ToolResultBlockParam[] = uses.map((u) => {
      const tool = tools.find((t) => t.name === u.name);
      const args = (u.input ?? {}) as Record<string, unknown>;
      const result = (tool ? tool.run(args) : "Unknown tool.").slice(0, MAX_RESULT);
      toolCalls.push({ name: u.name, args, result });
      return { type: "tool_result", tool_use_id: u.id, content: result };
    });
    messages.push({ role: "user", content: results });
  }
  return { reply: "(no reply)", toolCalls };
}
