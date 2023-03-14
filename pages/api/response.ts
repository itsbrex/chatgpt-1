import { OpenAIStream, OpenAIStreamPayload } from "@/utils/OpenAIStream";

type RequestData = {
  currentModel: string;
  message: string[];
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const runtime = "edge";

export default async function handler(request: Request) {
  const { currentModel, message } = (await request.json()) as RequestData;

  if (!message) {
    return new Response("No message in the request", { status: 400 });
  }

  const reqMessages = message.map((item: string, index: number) => {
    if (index % 2 === 0) {
      return {
        role: "user" as const,
        content: item,
      };
    } else {
      return {
        role: "assistant" as const,
        content: item,
      };
    }
  });

  const systemd = {
    role: "system" as const,
    content:
      "あなたは万能のアシスタントAIです。質問に最適な回答を作ってください。",
  };
  console.log([systemd, ...reqMessages]);

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    // model: `${currentModel}`,
    messages: [systemd, ...reqMessages],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
