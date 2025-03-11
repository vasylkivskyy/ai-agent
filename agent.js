import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

import { tool } from "@langchain/core/tools";

const weatherTool = tool(
  async ({ query }) => {
    console.log("query: ", query);
    //TODO: implement fetching to API

    return "The weather in Kyiv is warm";
  },
  {
    name: "weather",
    description: "Get the weather in current location",
    schema: z.object({
      query: z.string().describe("The query to use in search"),
    }),
  }
);

const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-latest",
});

const checkpointSaver = new MemorySaver();

const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkpointSaver,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "Hello, what is the weather in Kyiv?",
      },
    ],
  },
  {
    configurable: { thread_id: 42 },
  }
);

const followup = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What city I asked in previous question?",
      },
    ],
  },
  {
    configurable: { thread_id: 42 },
  }
);

console.log("result: ", result.messages.at(-1)?.content);
console.log("followup: ", followup.messages.at(-1)?.content);
