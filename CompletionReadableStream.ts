import { HTTPMethod } from "./types";

class CompletionReadableStream {
  // base url
  url: string = "";

  // custom headers
  headers?: Record<string, string> = {};

  // custom payload
  body?: Record<string, any>;

  // request method
  method: HTTPMethod = "POST";

  stream?: ReadableStream<null>;

  constructor(
    url: string,
    headers?: Record<string, string>,
    body?: Record<string, any>,
    method: HTTPMethod = "POST"
  ) {
    this.url = url;
    this.headers = headers;
    this.body = body;
    this.method = method;
  }

  async fetch(): Promise<ReadableStream| string> {
    const _self = this;

    const controller = new AbortController(); // Create an AbortController

    const signal = controller.signal; // Get the signal from the controller

    console.log("💚  fetching inference server ", this.body);

    const abortStream = (reader: any) => {
      reader?.cancel(); // Cancel the reader
      controller.abort(); // Abort the fetch request
      console.log("🔴 Stream aborted client closed connection");
    };

    try {
      const response = await fetch(_self.url, {
        method: _self.method,
        headers: _self.headers,
        body: JSON.stringify(_self.body),
        signal: signal,
      });

      console.log("response is ok?", response.ok)

      if (!response.ok) {
        const _error: string = await response.text();
        let errorObj: any = {};
        try {
          errorObj = JSON.parse(_error);
        } catch (e) {} 
        throw new Error(
          `HTTP Error! ${JSON.stringify(errorObj.detail) ?? "Unknown error"}`
        );
      }

      // if(!_self.body?.stream){
      //   const data =  await response.json()
      //   return JSON.stringify(data)
      // }

      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        .getReader();

      return new ReadableStream({
        async pull(controller) {
          console.log("⏬   pulling data");

          if (!reader) {
            throw new Error(`Invalid reader: ${response.status}`);
          }

          try {
            const { done, value } = await reader.read();

            if (done) {
              console.log("✅   streaming done!");
              controller.close();
              return;
            }
            console.log("🕐  streaming tokens...", value);
            controller.enqueue(value as any); // Pass the chunk to the next step
          } catch (error) {
            console.error("Error reading stream:", error);
            controller.error(error); // Signal an error to the stream
            abortStream(reader); // Abort the stream on error
          }
        },
        cancel() {
          abortStream(reader); // Cleanup if the stream is canceled
        },
      });
    } catch (e: any) {
      throw new Error(`Error: ${e.message}`);
    }
  }
}

export default CompletionReadableStream;
