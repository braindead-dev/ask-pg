export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type SharedChat = {
  id: string; // Unique identifier for the chat
  messages: Message[]; // Array of messages
  createdAt: Date; // When the chat was created
};
