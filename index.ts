import { ChatOpenAI } from "@langchain/openai";
import {
  InMemoryChatMessageHistory,
  BaseChatMessageHistory,
  BaseListChatMessageHistory,
} from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// import { HumanMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: "YOUR_OPENAI_API_KEY",
});

// const res = await model.invoke([new HumanMessage({ content: "Hi! I'm Bob" })]);

// console.log({ res });

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an assistant that remembers all prompts a user shares with you.`,
  ],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
]);

const chain = prompt.pipe(model);

const withMessageHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: async (
    sessionId
  ): Promise<BaseChatMessageHistory | BaseListChatMessageHistory> => {
    if (messageHistories[sessionId] === undefined) {
      messageHistories[sessionId] = new InMemoryChatMessageHistory();
    }
    return messageHistories[sessionId];
  },
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});

const config = {
  configurable: {
    sessionId: "abc2",
  },
};

const response = await withMessageHistory.invoke(
  {
    input: "Hi! I'm Utsav",
  },
  config
);

console.log(response.content);

const followupResponse = await withMessageHistory.invoke(
  {
    input: "how tall is a giraffe?",
  },
  config
);

console.log(followupResponse.content);

// console.log({ mesages: await messageHistories["abc2"].getMessages() });

// console.log(response.content);
