export interface IPlaygroundCompletionParameters {
    /**
     * UUID that represents the id of the current preset selected
     */
    presetId?: string;
    stream?: boolean; 
    modelId: string | null;
    collection: string | null;
    temperature: number;
    topK: number;
    topP: number;
    maxTokens: number;
    response_format: "text" | "json_object";
    messages?: ICompletionMessage[];
  }

  export interface ICompletionMessage {
    role: "assistant" | "system" | "user";
    content: string;
  }

  export interface UserMessage {
    role: "user";
    content: string;
  }

  export interface AssistantMessage {
    role: "assistant";
    content: string;
  }

  export type HTTPMethod = "POST" | "GET";

  export interface ICompletionParameters {
    stream?: boolean;
    model: string | null;
    temperature: number;
    top_k: number;
    top_p: number;
    max_tokens: number;
    response_format: { type: "text" | "json_object" };
    messages?: ICompletionMessage[];
  }