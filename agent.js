import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";

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

const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "Hello, what is the weather in Kyiv?",
    },
  ],
});

console.log("result: ", result.messages.at(-1)?.content);
