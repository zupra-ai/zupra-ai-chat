// import { ICompletionParameters } from "@/app/domain/models";
import CompletionReadableStream from "./CompletionReadableStream";

 async function LLMCompletionResponse(
  basePath = "", 
  headers: Record<string, any>, 
  payload: any):Promise<Response> { 

    const streamReader = new CompletionReadableStream(
        basePath,
        headers,
        payload
      );

    return new Response(await streamReader.fetch().catch((e) => {
      return JSON.stringify({"error": e.message})
    }))
}

export default LLMCompletionResponse
