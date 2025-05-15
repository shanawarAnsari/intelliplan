import { EventEmitter } from "events";
import { openAIClient as client } from "../utils/openAIClient";
import {
  COORDINATOR_ASSISTANT_ID,
  SALES_ASSISTANT_ID,
  FORECAST_ASSISTANT_ID,
} from "../utils/assistantConstants";

export function orchestrateStreaming(userPrompt) {
  const emitter = new EventEmitter();

  const emitUpdate = (type, content, handler) => {
    emitter.emit("update", {
      type,
      content,
      handler,
      timestamp: new Date(),
    });
  };

  const runOrchestration = async () => {
    try {
      emitUpdate("status", "Orchestration started.");
      const orchestrationStartTime = Date.now();

      // 1) Create a thread
      const thread = await client.beta.threads.create();
      emitUpdate("debug", `Coordinator thread created: ${thread.id}`);

      // Send user prompt
      await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userPrompt,
      });
      emitUpdate("debug", "User prompt sent to coordinator.");

      // Process a stream and get the final content
      const processStreamAndGetFinals = async (streamMethod, handlerName) => {
        let accumulatedText = "";
        let pendingSentence = "";
        let sentenceTimeout = null;
        let accumulatedChunk = ""; // Define this variable in the outer scope so it's accessible throughout the function
        const processAndEmitSentences = (text) => {
          pendingSentence += text;

          // Look for sentence endings (., !, ?)
          const sentenceRegex = /([.!?:])\s+|\n+/g;
          let match;
          let lastIndex = 0;
          let sentenceCount = 0;
          // Reset accumulatedChunk for this round of processing
          accumulatedChunk = "";
          let emitted = false;

          while ((match = sentenceRegex.exec(pendingSentence)) !== null) {
            const sentence = pendingSentence.slice(lastIndex, match.index + 1);
            if (sentence.trim().length > 0) {
              accumulatedChunk += sentence;
              sentenceCount++;

              // Emit chunks when we have 2-3 sentences or if the chunk is getting large
              if (sentenceCount >= 2 || accumulatedChunk.length > 150) {
                emitUpdate("text_chunk", accumulatedChunk, handlerName);
                accumulatedChunk = "";
                sentenceCount = 0;
                emitted = true;
              }
            }
            lastIndex = match.index + match[0].length;
          }
          if (emitted) {
            // Keep the incomplete part for next time
            pendingSentence = pendingSentence.slice(lastIndex);

            // Reset the timeout since we emitted something
            if (sentenceTimeout) {
              clearTimeout(sentenceTimeout);
              sentenceTimeout = null;
            }
          } else {
            // If no complete sentence was found, set a timeout to emit anyway after a delay
            // This handles cases where text doesn't end with proper punctuation
            if (!sentenceTimeout && pendingSentence.trim().length > 0) {
              sentenceTimeout = setTimeout(() => {
                if (pendingSentence.trim().length > 0) {
                  // Add any pending content to our accumulated chunk
                  if (accumulatedChunk.length > 0) {
                    accumulatedChunk += pendingSentence;
                    emitUpdate("text_chunk", accumulatedChunk, handlerName);
                    accumulatedChunk = "";
                  } else if (pendingSentence.trim().length > 10) {
                    // Only emit if it's a substantial chunk
                    emitUpdate("text_chunk", pendingSentence, handlerName);
                  }
                  pendingSentence = "";
                }
                sentenceTimeout = null;
              }, 750); // 0.75 second timeout for smoother experience
            }
          }
        };

        // Execute the function that starts the stream
        const stream = streamMethod();

        // Attach event listeners
        stream.on("connect", () => {
          emitUpdate("stream_connect", "Stream connected", handlerName);
        });

        stream.on("runCreated", (run) => {
          emitUpdate("run_created", run, handlerName);
        });

        stream.on("messageDelta", (messageDelta, snapshot) => {
          const content = messageDelta.content?.[0];
          if (content?.type === "text" && content.text?.value) {
            accumulatedText += content.text.value;
            // Process the new text and emit complete sentences
            processAndEmitSentences(content.text.value);
          } else if (content?.type === "image_file") {
            // Store image information but only emit in final answer
            if (!accumulatedText.includes(`[IMAGE:${content.image_file.file_id}]`)) {
              accumulatedText += `[IMAGE:${content.image_file.file_id}]`;
            }
          }
        });

        stream.on("toolCallCreated", (toolCall) => {
          emitUpdate("tool_call_created", toolCall, handlerName);
        });

        // Listen for other events including errors
        stream.on("error", (error) => {
          console.error(`Stream error for ${handlerName}:`, error);
          emitUpdate(
            "error",
            `Stream processing error: ${error.message}`,
            handlerName
          );
        });
        // Wait for stream completion
        const finalRun = await stream.finalRun();

        // Create a local copy to work with in case outer scope variable is reset elsewhere
        let remainingChunk = accumulatedChunk || "";

        // Emit any remaining text in either accumulated chunk or pending sentence
        if (remainingChunk && remainingChunk.trim().length > 0) {
          if (pendingSentence && pendingSentence.trim().length > 0) {
            remainingChunk += pendingSentence;
          }
          emitUpdate("text_chunk", remainingChunk, handlerName);
        } else if (pendingSentence && pendingSentence.trim().length > 0) {
          emitUpdate("text_chunk", pendingSentence, handlerName);
        }

        // Clean up any pending timeout
        if (sentenceTimeout) {
          clearTimeout(sentenceTimeout);
        }

        return { accumulatedText, finalRun };
      };

      // 2) Start coordinator run with streaming
      emitUpdate("status", "Streaming Coordinator (Initial Run)...", "Coordinator");
      let { accumulatedText: coordinatorInitialText, finalRun: currentRun } =
        await processStreamAndGetFinals(
          () =>
            client.beta.threads.runs.stream(thread.id, {
              assistant_id: COORDINATOR_ASSISTANT_ID,
            }),
          "Coordinator"
        );
      emitUpdate(
        "debug",
        `Coordinator initial run ended. Status: ${currentRun.status}`,
        "Coordinator"
      );

      let finalAnswerText = coordinatorInitialText;

      // 3) Handle tool calls if needed
      if (
        currentRun.status === "requires_action" &&
        currentRun.required_action?.type === "submit_tool_outputs"
      ) {
        emitUpdate("status", "Coordinator requires tool calls...");
        const toolOutputs = [];
        const calls = currentRun.required_action.submit_tool_outputs.tool_calls;

        for (const call of calls) {
          if (call.type === "function") {
            const fnName = call.function.name;
            let args;
            try {
              args = JSON.parse(call.function.arguments);
            } catch (e) {
              emitUpdate(
                "error",
                `Failed to parse arguments for ${fnName}: ${e.message}`
              );
              toolOutputs.push({
                tool_call_id: call.id,
                output: "Error: Invalid JSON arguments",
              });
              continue;
            }

            emitUpdate(
              "debug",
              `Handling tool call: ${fnName} with args: ${JSON.stringify(args)}`,
              "Coordinator"
            );

            let finalSubPrompt =
              args && typeof args.prompt === "string" && args.prompt.trim() !== ""
                ? args.prompt
                : userPrompt;

            const aid =
              fnName === "get_sales_data"
                ? SALES_ASSISTANT_ID
                : fnName === "forecast"
                ? FORECAST_ASSISTANT_ID
                : FORECAST_ASSISTANT_ID;

            const subHandlerName = `Sub-${fnName.substring(0, 10)}`;
            emitUpdate(
              "status",
              `Streaming Sub-Assistant: ${fnName}...`,
              subHandlerName
            );

            const subThread = await client.beta.threads.create();
            await client.beta.threads.messages.create(subThread.id, {
              role: "user",
              content: finalSubPrompt,
            });

            const { accumulatedText: subText, finalRun: subRun } =
              await processStreamAndGetFinals(
                () =>
                  client.beta.threads.runs.stream(subThread.id, {
                    assistant_id: aid,
                  }),
                subHandlerName
              );

            emitUpdate(
              "debug",
              `Sub-assistant ${fnName} run ended. Status: ${subRun.status}`,
              subHandlerName
            );

            // Check for images in the response
            if (subRun.status === "completed") {
              const msgs = await client.beta.threads.messages.list(subThread.id, {
                order: "desc",
                limit: 1,
              });

              if (msgs.data[0].content.some((c) => c.type === "image_file")) {
                // If there are images, provide a structured response
                let responseWithImages = {
                  text: subText,
                  images: msgs.data[0].content
                    .filter((c) => c.type === "image_file")
                    .map((c) => ({
                      fileId: c.image_file.file_id,
                      url: c.image_file.url,
                    })),
                };
                toolOutputs.push({
                  tool_call_id: call.id,
                  output: JSON.stringify(responseWithImages),
                });
              } else {
                // Text-only response
                toolOutputs.push({ tool_call_id: call.id, output: subText });
              }
            } else {
              toolOutputs.push({
                tool_call_id: call.id,
                output: `Error: Sub-agent ${fnName} failed.`,
              });
            }
          }
        }

        // 4) Submit tool outputs back to coordinator
        if (toolOutputs.length > 0) {
          emitUpdate(
            "status",
            "Submitting tool outputs to Coordinator...",
            "CoordinatorFinal"
          );
          const { accumulatedText: finalText, finalRun: finalRun } =
            await processStreamAndGetFinals(
              () =>
                client.beta.threads.runs.submitToolOutputsStream(
                  thread.id,
                  currentRun.id,
                  { tool_outputs: toolOutputs }
                ),
              "CoordinatorFinal"
            );
          finalAnswerText = finalText;
          emitUpdate(
            "debug",
            `Coordinator final run after tools. Status: ${finalRun.status}`,
            "CoordinatorFinal"
          );
        }
      }

      const orchestrationEndTime = Date.now();
      emitUpdate(
        "status",
        `Orchestration complete. Duration: ${
          (orchestrationEndTime - orchestrationStartTime) / 1000
        }s`
      );
      emitter.emit("finalAnswer", { answer: finalAnswerText, thread: thread });
    } catch (error) {
      console.error("Orchestration error:", error);
      emitter.emit("error", {
        message: `Orchestration failed: ${error.message}`,
        error,
      });
    }
  };

  // Start the async process
  runOrchestration();
  return emitter;
}

export default {
  orchestrateStreaming,
};
