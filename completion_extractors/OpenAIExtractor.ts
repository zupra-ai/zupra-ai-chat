import { ICompletionExtractor } from "./CompletionExtractor.interface";

class OpenAIExtractor implements ICompletionExtractor {
  extract(response: any): any {
    return response;
  }
}

export default OpenAIExtractor;
