import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

import { tool } from "@langchain/core/tools";
import { evalAndCaptureOutput } from "./evalAndCapture.js";

const jsExecutor = tool(
  async ({ code }) => {
    console.log("I should run the following code: ");
    console.log(code);
    console.log("---------------------------------");
    const result = await evalAndCaptureOutput(code);
    console.log("---------------------------------");

    console.log("result: ", result);
    return result;
  },
  {
    name: "run_javascript_code_tool",
    description: `
    Run general purpose javascript code. 
    This can be used to access Internet or do any computation that you need. 
    The output will be composed of the stdout and stderr. 
    The code should be written in a way that it can be executed with javascript eval in node environment.
  `,
    schema: z.object({
      code: z.string().describe("code to be executed"),
    }),
  }
);

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
  tools: [weatherTool, jsExecutor],
  checkpointSaver,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        //content: "Hello, what is the weather in Kyiv?",
        content: "What is the current price of bitcoin?",
      },
    ],
  },
  {
    configurable: { thread_id: 42 },
  }
);

// const followup = await agent.invoke(
//   {
//     messages: [
//       {
//         role: "user",
//         content: "What city I asked in previous question?",
//       },
//     ],
//   },
//   {
//     configurable: { thread_id: 42 },
//   }
// );

console.log("result: ", result.messages.at(-1)?.content);
//console.log("followup: ", followup.messages.at(-1)?.content);
