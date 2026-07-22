import { askGemini } from "./chat.functions";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function askAssistant(
  message: string,
  history: ChatMessage[] = []
) {
  return await (askGemini as any)({
    data: {
      message,
      history,
    },
  });
}