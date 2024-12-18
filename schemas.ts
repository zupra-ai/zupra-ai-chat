// export type HTTPMethod = "POST" | "GET";

// /**
//  * @deprecated
//  */
// export interface LLMCompletionResponse {
//   model: string;
//   created_at: Date;

//   response: string;
//   message: { role: string; content: string }; // used by ollama

//   done: boolean;
//   done_reason?: string;
//   context?: Array<number | string>;
//   total_duration?: number;
//   load_duration?: number;
//   prompt_eval_count?: number;
//   prompt_eval_duration?: number;
//   eval_count?: number;
//   eval_duration?: number;
// }

// /**
//  * @deprecated
//  */
// export interface IChunkedResponseReaderHandlers {
//   verbose?: boolean;
//   whileReadingCB: (data: string) => void;
//   handleReadingErrorCB?: (errMsg: string) => void;
//   startReadingCB?: (data: string) => void;
//   endReadingCB?: (data?: string) => void;
//   closeReadingCB?: () => void;
// }
