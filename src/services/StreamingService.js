import { EventEmitter } from "events";
import { openAIClient as client } from "../utils/openAIClient";
import {
  COORDINATOR_ASSISTANT_ID,
  SALES_ASSISTANT_ID,
  FORECAST_ASSISTANT_ID,
} from "../utils/assistantConstants";

export function orchestrateStreaming(userPrompt, threadId = null) {
  const emitter = new EventEmitter();
  let stopped = false;

  // Add this helper function at the beginning of orchestrateStreaming
  const checkForActiveRuns = async (threadId) => {
    try {
      if (!threadId) return false;

      // List runs on the thread
      const runs = await client.beta.threads.runs.list(threadId);

      // Check if any runs are still active
      const activeRuns = runs.data.filter((run) =>
        ["queued", "in_progress", "requires_action"].includes(run.status)
      );

      if (activeRuns.length > 0) {
        console.log(
          `Found active runs on thread ${threadId}:`,
          activeRuns.map((r) => r.id)
        );

        // For each active run, try to cancel it
        for (const run of activeRuns) {
          try {
            console.log(`Cancelling run ${run.id} on thread ${threadId}`);
            await client.beta.threads.runs.cancel(threadId, run.id);
            console.log(`Successfully cancelled run ${run.id}`);
          } catch (err) {
            console.warn(`Failed to cancel run ${run.id}:`, err.message);
          }
        }

        // Wait a bit to ensure cancellation is processed
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking for active runs:", error);
      return false;
    }
  };

  const emitUpdate = (type, content, handler) => {
    if (!stopped) {
      emitter.emit("update", {
        type,
        content,
        handler,
        timestamp: new Date(),
      });
    }
  };

  emitter.stop = () => {
    stopped = true;
    emitter.emit("stopped");
  };

  const runOrchestration = async () => {
    try {
      emitUpdate("status", "Orchestration started.");
      const orchestrationStartTime = Date.now();

      // 1) Create or reuse a thread
      let thread;
      if (threadId) {
        // Reuse the existing thread
        thread = { id: threadId };
        console.log("StreamingService: Reusing existing thread:", threadId);
        emitUpdate("debug", `Reusing existing thread: ${threadId}`);
      } else {
        // Create a new thread
        console.log("StreamingService: Creating new thread");
        thread = await client.beta.threads.create();
        if (stopped) return;
        console.log("StreamingService: Created new thread with ID:", thread.id);
        emitUpdate("debug", `Coordinator thread created: ${thread.id}`);
      }

      // Check for and cancel any active runs on the thread
      await checkForActiveRuns(thread.id);

      // Send user prompt
      await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userPrompt,
      });
      if (stopped) return { accumulatedText: "", finalRun: null };
      emitUpdate("debug", "User prompt sent to coordinator.");

      // Process a stream and get the final content
      const processStreamAndGetFinals = async (streamMethod, handlerName) => {
        if (stopped) return { accumulatedText: "", finalRun: null };

        let accumulatedText = "";
        let pendingSentence = "";
        let sentenceTimeout = null;
        let accumulatedChunk = "";

        const processAndEmitSentences = (text) => {
          pendingSentence += text;

          // Don't emit anything until we have a substantial amount of text
          if (
            pendingSentence.length < 30 &&
            !pendingSentence.includes(".") &&
            !pendingSentence.includes("!") &&
            !pendingSentence.includes("?")
          ) {
            return; // Wait for more text to accumulate
          }

          // Comprehensive regex for sentence detection
          const sentenceRegex = /([.!?](?:\s+|$)|\n+)/g;
          let match;
          let lastIndex = 0;

          let paragraphBuffer = "";
          let emitted = false;

          while ((match = sentenceRegex.exec(pendingSentence)) !== null) {
            // Get the complete sentence including punctuation
            const sentence = pendingSentence.slice(
              lastIndex,
              match.index + match[0].length
            );

            if (sentence.trim().length > 0) {
              // Add to paragraph buffer
              paragraphBuffer += sentence;

              // If enough text, emit the chunk
              if (paragraphBuffer.length > 120 || match[0].includes("\n")) {
                emitUpdate("text_chunk", paragraphBuffer, handlerName);
                paragraphBuffer = "";
                emitted = true;
              }
            }
            lastIndex = match.index + match[0].length;
          }

          if (emitted) {
            // Keep incomplete part for next time
            pendingSentence = pendingSentence.slice(lastIndex);

            if (sentenceTimeout) {
              clearTimeout(sentenceTimeout);
              sentenceTimeout = null;
            }
          } else {
            // If no complete sentence found, set timeout to emit anyway
            if (!sentenceTimeout && pendingSentence.trim().length > 0) {
              sentenceTimeout = setTimeout(() => {
                if (pendingSentence.trim().length > 0) {
                  if (accumulatedChunk.length > 0) {
                    accumulatedChunk += pendingSentence;
                    emitUpdate("text_chunk", accumulatedChunk, handlerName);
                    accumulatedChunk = "";
                  } else if (pendingSentence.trim().length > 10) {
                    emitUpdate("text_chunk", pendingSentence, handlerName);
                  }
                  pendingSentence = "";
                }
                sentenceTimeout = null;
              }, 750);
            }
          }
        };

        // Execute stream function
        const stream = streamMethod();
        if (stopped) return { accumulatedText: "", finalRun: null };

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
            processAndEmitSentences(content.text.value);
          } else if (content?.type === "image_file") {
            if (!accumulatedText.includes(`[IMAGE:${content.image_file.file_id}]`)) {
              accumulatedText += `[IMAGE:${content.image_file.file_id}]`;
            }
          }
        });

        stream.on("toolCallCreated", (toolCall) => {
          emitUpdate("tool_call_created", toolCall, handlerName);
        });

        stream.on("error", (error) => {
          if (stopped) return { accumulatedText: "", finalRun: null };
          console.error(`Stream error for ${handlerName}:`, error);
          emitUpdate(
            "error",
            `Stream processing error: ${error.message}`,
            handlerName
          );
        });

        // Wait for completion
        const finalRun = await stream.finalRun();
        if (stopped) return { accumulatedText: "", finalRun: null };

        // Process any remaining text
        let remainingChunk = accumulatedChunk || "";

        if (remainingChunk && remainingChunk.trim().length > 0) {
          if (pendingSentence && pendingSentence.trim().length > 0) {
            remainingChunk += pendingSentence;
          }
          emitUpdate("text_chunk", remainingChunk, handlerName);
        } else if (pendingSentence && pendingSentence.trim().length > 0) {
          emitUpdate("text_chunk", pendingSentence, handlerName);
        }

        // Clean up timeout
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

      if (stopped) return { accumulatedText: "", finalRun: null };

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
          if (stopped) return { accumulatedText: "", finalRun: null };

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
            if (stopped) return { accumulatedText: "", finalRun: null };

            await client.beta.threads.messages.create(subThread.id, {
              role: "user",
              content: finalSubPrompt,
            });
            if (stopped) return { accumulatedText: "", finalRun: null };

            const { accumulatedText: subText, finalRun: subRun } =
              await processStreamAndGetFinals(
                () =>
                  client.beta.threads.runs.stream(subThread.id, {
                    assistant_id: aid,
                  }),
                subHandlerName
              );
            if (stopped) return { accumulatedText: "", finalRun: null };

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
              if (stopped) return { accumulatedText: "", finalRun: null };

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
          if (stopped) return { accumulatedText: "", finalRun: null };
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

      // Log the thread ID before emitting the final answer
      console.log("Emitting final answer with thread ID:", thread.id);

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
