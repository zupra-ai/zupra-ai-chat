import OpenAIExtractor from "./OpenAIExtractor";

export interface ICompletionExtractor {
  extract(response: any): any;
}

export class CompletionExtractorFactory {
  create(modelId: string): ICompletionExtractor {
    if(modelId.includes("openai")){
      return new OpenAIExtractor();
    }
    throw new Error("Invalid modelId");
  }
}