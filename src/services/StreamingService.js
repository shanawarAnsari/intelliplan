import { EventEmitter } from "events";
import { openAIClient as client } from "../utils/openAIClient";
import {
  COORDINATOR_ASSISTANT_ID,
  SALES_ASSISTANT_ID,
  FORECAST_ASSISTANT_ID,
  REPORTGEN_ASSISTANT_ID,
} from "../utils/assistantConstants";

export function orchestrateStreaming(userPrompt, threadId = null) {
  const emitter = new EventEmitter();
  let stopped = false;

  const checkForActiveRuns = async (threadId) => {
    if (!threadId) return false;
    try {
      const runs = await client.beta.threads.runs.list(threadId);
      const activeRuns = runs.data.filter((run) =>
        ["queued", "in_progress", "requires_action"].includes(run.status)
      );

      if (activeRuns.length > 0) {
        console.log(`Found active runs on thread ${threadId}`);
        for (const run of activeRuns) {
          try {
            await client.beta.threads.runs.cancel(threadId, run.id);
          } catch (err) {
            console.warn(`Failed to cancel run ${run.id}`);
          }
        }
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
  const processStreamAndGetFinals = async (streamMethod, handlerName) => {
    if (stopped) return { accumulatedText: "", finalRun: null, images: [] };

    let accumulatedText = "";
    let pendingSentence = "";
    let sentenceTimeout = null;
    let accumulatedChunk = "";
    let detectedImages = [];
    let allDetectedImages = runOrchestration.allDetectedImages;

    const processAndEmitSentences = (text) => {
      pendingSentence += text;

      if (pendingSentence.length < 30 && !pendingSentence.match(/[.!?](\s|$)|\n/)) {
        return;
      }

      const sentenceRegex = /([.!?](?:\s+|$)|\n+)/g;
      let match;
      let lastIndex = 0;
      let paragraphBuffer = "";
      let emitted = false;

      while ((match = sentenceRegex.exec(pendingSentence)) !== null) {
        const sentence = pendingSentence.slice(
          lastIndex,
          match.index + match[0].length
        );

        if (sentence.trim().length > 0) {
          paragraphBuffer += sentence;

          if (paragraphBuffer.length > 120 || match[0].includes("\n")) {
            emitUpdate("text_chunk", paragraphBuffer, handlerName);
            paragraphBuffer = "";
            emitted = true;
          }
        }
        lastIndex = match.index + match[0].length;
      }

      if (emitted) {
        pendingSentence = pendingSentence.slice(lastIndex);

        if (sentenceTimeout) {
          clearTimeout(sentenceTimeout);
          sentenceTimeout = null;
        }
      } else if (!sentenceTimeout && pendingSentence.trim().length > 0) {
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
    };

    const stream = streamMethod();
    if (stopped) return { accumulatedText: "", finalRun: null };

    stream.on("connect", () => {
      emitUpdate("stream_connect", "Stream connected", handlerName);
    });

    stream.on("runCreated", (run) => {
      emitUpdate("run_created", run, handlerName);
    });

    stream.on("messageDelta", (messageDelta, snapshot) => {
      const content = messageDelta.content?.[0];
      if (!content) return;

      if (content?.type === "text" && content.text?.value) {
        accumulatedText += content.text.value;
        processAndEmitSentences(content.text.value);
      } else if (content?.type === "image_file") {
        if (!content.image_file || !content.image_file.file_id) {
          return;
        }

        const imageData = {
          fileId: content.image_file.file_id,
          url: content.image_file.url || null,
          detectedAt: new Date().toISOString(),
        };

        (async () => {
          if (!imageData.url) {
            try {
              const ImageService = await import("../services/ImageService");
              imageData.url = await ImageService.fetchImageFromOpenAI(
                imageData.fileId
              );
              emitUpdate("image", { ...imageData }, handlerName);
            } catch (imageError) {
              emitUpdate(
                "error",
                `Failed to fetch image: ${imageError.message}`,
                "ImageService"
              );
            }
          }
        })();

        detectedImages.push(imageData);
        allDetectedImages.push(imageData);
        emitUpdate("image", imageData, handlerName);
        emitUpdate(
          "debug",
          `Image detected: fileId=${content.image_file.file_id}`,
          handlerName
        );

        const imageMarker = `[IMAGE:${content.image_file.file_id}]`;
        if (!accumulatedText.includes(imageMarker)) {
          accumulatedText += imageMarker;
        }
      }
    });

    stream.on("toolCallCreated", (toolCall) => {
      emitUpdate("tool_call_created", toolCall, handlerName);
    });

    stream.on("error", (error) => {
      if (stopped) return { accumulatedText: "", finalRun: null };
      emitUpdate("error", `Stream processing error: ${error.message}`, handlerName);
    });

    const finalRun = await stream.finalRun();
    if (stopped) return { accumulatedText: "", finalRun: null, images: [] };

    let remainingChunk = accumulatedChunk || "";
    if (remainingChunk && remainingChunk.trim().length > 0) {
      if (pendingSentence && pendingSentence.trim().length > 0) {
        remainingChunk += pendingSentence;
      }
      emitUpdate("text_chunk", remainingChunk, handlerName);
    } else if (pendingSentence && pendingSentence.trim().length > 0) {
      emitUpdate("text_chunk", pendingSentence, handlerName);
    }

    if (sentenceTimeout) {
      clearTimeout(sentenceTimeout);
    }

    return { accumulatedText, finalRun, images: detectedImages };
  };
  const runOrchestration = async () => {
    try {
      emitUpdate("status", "Orchestration started.");
      const orchestrationStartTime = Date.now();
      runOrchestration.allDetectedImages = [];
      let allDetectedImages = runOrchestration.allDetectedImages;

      let thread = threadId ? { id: threadId } : await client.beta.threads.create();
      if (stopped) return;
      emitUpdate(
        "debug",
        threadId ? `Reusing thread: ${threadId}` : `Thread created: ${thread.id}`
      );

      await checkForActiveRuns(thread.id);

      await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userPrompt,
      });
      if (stopped) return;

      emitUpdate("status", "Streaming Coordinator...", "Coordinator");
      let { accumulatedText: coordinatorText, finalRun: currentRun } =
        await processStreamAndGetFinals(
          () =>
            client.beta.threads.runs.stream(thread.id, {
              assistant_id: COORDINATOR_ASSISTANT_ID,
            }),
          "Coordinator"
        );
      if (stopped) return;

      let finalAnswerText = coordinatorText;

      if (
        currentRun.status === "requires_action" &&
        currentRun.required_action?.type === "submit_tool_outputs"
      ) {
        const toolOutputs = [];
        const calls = currentRun.required_action.submit_tool_outputs.tool_calls;

        for (const call of calls) {
          if (stopped) return;
          if (call.type === "function") {
            const fnName = call.function.name;
            let args;
            try {
              args = JSON.parse(call.function.arguments);
            } catch (e) {
              toolOutputs.push({
                tool_call_id: call.id,
                output: "Error: Invalid JSON arguments",
              });
              continue;
            }

            const finalSubPrompt = args?.prompt?.trim() ? args.prompt : userPrompt;
            let assistantId = null;

            if (fnName === "predict") {
              assistantId = FORECAST_ASSISTANT_ID;
            } else if (fnName === "report") {
              assistantId = REPORTGEN_ASSISTANT_ID;
            } else {
              assistantId = SALES_ASSISTANT_ID;
            }

            const subThread = await client.beta.threads.create();
            if (stopped) return;

            await client.beta.threads.messages.create(subThread.id, {
              role: "user",
              content: finalSubPrompt,
            });
            if (stopped) return;

            const { accumulatedText: subText, finalRun: subRun } =
              await processStreamAndGetFinals(
                () =>
                  client.beta.threads.runs.stream(subThread.id, {
                    assistant_id: assistantId,
                  }),
                `Sub-${fnName.substring(0, 10)}`
              );
            if (stopped) return;

            if (subRun.status === "completed") {
              const msgs = await client.beta.threads.messages.list(subThread.id, {
                order: "desc",
                limit: 1,
              });

              if (
                fnName === "report" &&
                msgs.data.length > 0 &&
                msgs.data[0].content
              ) {
                for (const contentItem of msgs.data[0].content) {
                  debugger;
                  let fileIdToLog = null;
                  let fileTypeForLog = contentItem.type;

                  if (
                    contentItem.type === "image_file" &&
                    contentItem.image_file?.file_id
                  ) {
                    fileIdToLog = contentItem.image_file.file_id;
                  } else if (
                    contentItem.type === "file_citation" &&
                    contentItem.file_citation?.file_id
                  ) {
                    fileIdToLog = contentItem.file_citation.file_id;
                  }

                  if (fileIdToLog) {
                    console.log(
                      `File detected from '${fnName}' assistant. File ID: ${fileIdToLog}, Type: ${fileTypeForLog}`
                    );
                  }
                }
              }

              if (
                msgs.data.length > 0 &&
                msgs.data[0].content.some((c) => c.type === "image_file")
              ) {
                toolOutputs.push({
                  tool_call_id: call.id,
                  output: JSON.stringify({
                    text: subText,
                    images: msgs.data[0].content
                      .filter((c) => c.type === "image_file")
                      .map((c) => ({
                        fileId: c.image_file.file_id,
                        url: c.image_file.url,
                      })),
                  }),
                });
              } else {
                toolOutputs.push({ tool_call_id: call.id, output: subText });
              }
            } else {
              toolOutputs.push({
                tool_call_id: call.id,
                output: `Error: Sub-assistant ${fnName} failed.`,
              });
            }
          }
        }

        if (toolOutputs.length > 0) {
          const { accumulatedText: finalText } = await processStreamAndGetFinals(
            () =>
              client.beta.threads.runs.submitToolOutputsStream(
                thread.id,
                currentRun.id,
                { tool_outputs: toolOutputs }
              ),
            "CoordinatorFinal"
          );
          if (stopped) return;
          finalAnswerText = finalText;
        }
      }

      if (allDetectedImages.length > 0) {
        try {
          const ImageService = await import("../services/ImageService");
          for (const image of allDetectedImages) {
            if (!image.url) {
              try {
                image.url = await ImageService.fetchImageFromOpenAI(image.fileId);
              } catch (error) {
                console.error(`Error fetching image ${image.fileId}:`, error);
              }
            }
          }
        } catch (error) {
          console.error("Error importing ImageService:", error);
        }
      }

      // Extract file_id from attachments for file download
      let fileAttachmentId = null;
      if (
        Array.isArray(currentRun) === false &&
        currentRun &&
        currentRun.status === "completed"
      ) {
        // Try to get the last message in the thread
        const msgs = await client.beta.threads.messages.list(thread.id, {
          order: "desc",
          limit: 1,
        });
        if (
          msgs.data &&
          msgs.data.length > 0 &&
          msgs.data[0].attachments &&
          msgs.data[0].attachments.length > 0
        ) {
          fileAttachmentId = msgs.data[0].attachments[0].file_id;
        }
      }

      emitUpdate(
        "status",
        `Orchestration complete. Duration: ${
          (Date.now() - orchestrationStartTime) / 1000
        }s`
      );

      emitter.emit("finalAnswer", {
        answer: finalAnswerText,
        thread: thread,
        images: allDetectedImages,
        fileAttachmentId, // <-- pass file id for file download
      });
    } catch (error) {
      console.error("Orchestration error:", error);
      emitter.emit("error", {
        message: `Orchestration failed: ${error.message}`,
        error,
      });
    }
  };

  runOrchestration();
  return emitter;
}

export default {
  orchestrateStreaming,
};
