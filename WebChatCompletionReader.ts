import { ICompletionParameters } from "./types";

/**
 * @deprecated
 */
class ChatCompletionContentBuilder {
  providersMappers: Record<
    string,
    (chunk: string[], stream: boolean) => any[]
  > = {
    openai(chunk: string[], stream = false): any[] {
      return chunk.map((item: string) => {
        try {
          const data = JSON.parse(item.replace(/'/g, '"'));

          const content = !stream
            ? data.choices[0].message.content
            : data.choices[0].delta.content;

          const role = !stream
            ? data.choices[0].message.role
            : data.choices[0].delta.content;

          return {
            done: false,
            message: {
              content,
              role,
            },
          } as any;
        } catch (e) {
          return {
            done: false,
            message: {
              content: "",
              role: "",
            },
          } as any;
        }
      });
    },
  };

  run(providerName: string, splitted: string[], stream = false): any[] {
    if (typeof this.providersMappers[providerName] === "function") {
      return this.providersMappers[providerName]?.(splitted, stream);
    } else {
      throw Error("Chat completion data extractor not implemented yet");
    }
  }
} 

class WebChatCompletionReader {
  url: string;

  handlers: any;

  reader: ReadableStreamDefaultReader | undefined;

  constructor(url: string, handlers: any) {
    this.url = url;
    this.handlers = handlers;
  }

  close() {
    this.reader?.cancel();
    this.handlers.closeReadingCB?.();
  }

  /**
   * Init the chat completion
   * @param payload ICompletionParameters
   * @param headers Record
   */
  async init(payload:{message: string}) {
    try {
      await fetch(this.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (_res) => {
          if (!_res.ok) {
            const respJSON: any = {};
            this.handlers.handleReadingErrorCB?.(
              respJSON.error ?? _res.statusText
            );
            return;
          }

          // if (!payload.stream) {
          //   const data = await _res.json();
          //   const msg = data.choices[0]["message"]["content"];
          //   console.log("NO STREAMRESPONSE MSG", msg);
          //   this.handlers.startReadingCB?.(msg);
          //   this.close();
          //   return;
          // }

          this.reader = _res.body
            ?.pipeThrough(new TextDecoderStream())
            .getReader();

          let isFirst = true;

          // const mapped = new ChatCompletionContentBuilder();

          while (true) {
            const { done, value } = (await this.reader?.read()) as any;

            console.log("==========CHUNK INIT");
            console.log(value);
            console.log("==========CHUNK END");

            if (!value) {
              this.handlers.endReadingCB?.();
              this.close();
              return;
            }

            // // for json line based responses
            // let splittedJSONStrings: string[] = value
            //   .replace(/}\s*{/g, "}\n{") // device string in json lines
            //   .split("\n") // split lines to json array
            //   .map((item: string) => {
            //     try {
            //       // if can parse the json so return the string
            //       // else proceed to clean, remove unwanted chars an return, this should be ready to parse
            //       JSON.parse(item);
            //       console.log("=====PARSED", item);
            //       return item;
            //     } catch (e) {
            //       console.log("=====NONE_PARSED", item);
            //       return item
            //         .replace(/"/g, "_#_")
            //         .replace(/'/g, '"')
            //         .replace(/_#_/g, "&quot;");
            //     }
            //   });

            // if (JSON.parse(splittedJSONStrings[0]).error) {
            //   this.handlers.handleReadingErrorCB?.(
            //     JSON.parse(splittedJSONStrings[0]).error
            //   );
            // }

            // const AiEngineChatResponseList = mapped.run(
            //   payload.model!.split(":")[1], // model format is a urn urn:provider:model[:collection_id]
            //   splittedJSONStrings,
            //   payload.stream
            // );

            if (done) {
              // if (AiEngineChatResponseList.length >= 2) {
              //   AiEngineChatResponseList.splice(
              //     0,
              //     AiEngineChatResponseList.length - 2
              //   ).forEach((payload) => {
                  this.handlers.endReadingCB?.();
              //   });
              // }

              // AiEngineChatResponseList.forEach((payload) => {
                // this.handlers.endReadingCB?.(payload.message.content);
              // });

              this.close();

              break;
            }

            if (isFirst) {
              isFirst = false;

              // AiEngineChatResponseList.forEach((payload) => {
               this.handlers.startReadingCB?.(value);
              // });
            } else {
              // AiEngineChatResponseList.forEach((payload) => {
                this.handlers.whileReadingCB?.(value);
              // });
            }
          }
        })
        .catch((e) => {
          this.handlers.endReadingCB?.();
          this.close();
          console.log("Error Streaming", e.message);
        });
    } catch (e: any) {
      console.log("error fetching", e.message);
    }
  }
}

export default WebChatCompletionReader;
