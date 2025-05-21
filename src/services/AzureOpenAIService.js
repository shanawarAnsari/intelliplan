import { openAIClient as client } from "../utils/openAIClient";


const COORDINATOR_ID = process.env.REACT_APP_COORDINATOR_ASSISTANT_ID;
const SALES_ID = process.env.REACT_APP_SALES_ASSISTANT_ID;
const FORECAST_ID = process.env.REACT_APP_FORECAST_ASSISTANT_ID;

async function waitOnRun(threadId, runId) {
  let run = await client.beta.threads.runs.retrieve(threadId, runId);
  while (["queued", "in_progress"].includes(run.status)) {
    await new Promise((r) => setTimeout(r, 1000));
    run = await client.beta.threads.runs.retrieve(threadId, runId);
  }
  return run;
}

function extractContentFromMessage(message) {
  let textContent = "";
  let imageFiles = [];

  if (!message.content || !Array.isArray(message.content)) {
    return { text: message.content || "", images: [] };
  }


  for (const block of message.content) {
    if (block.type === "text") {
      const value =
        (typeof block.text === "object" ? block.text.value : block.text.value) ?? "";
      textContent += value;


      const regex = /!\[.*?\]\(attachment:\/\/(.*?)\)/g;
      let match;

      while ((match = regex.exec(value)) !== null) {

        const attachmentId = match[1];
        if (attachmentId) {
          imageFiles.push({
            fileId: attachmentId,
            url: null,
            isAttachment: true,
            position: match.index,
          });
        }
      }
    } else if (block.type === "code") {
      textContent += block.code?.value ?? "";
    } else if (block.type === "image_file") {
      imageFiles.push({
        fileId: block.image_file?.file_id,
        url: block.image_file?.url,
        isAttachment: false,
      });
    }
  }

  return { text: textContent, images: imageFiles };
}

export async function orchestrate(userPrompt, onProgressUpdate) {
  const progress = (text) => {
    if (onProgressUpdate) {
      onProgressUpdate({ type: "status", text });
    }
  };

  progress("Orchestration started.");


  const thread = await client.beta.threads.create();
  progress(`Coordinator assiatant launched`);

  await client.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userPrompt,
  });
  progress("Sent user prompt to coordinator.");


  progress("Running coordinator assistant...");
  let run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: COORDINATOR_ID,
  });
  progress(`Waiting for completion...`);
  run = await waitOnRun(thread.id, run.id);
  progress("Coordinator run completed.");


  if (run.status === "requires_action" && run.required_action) {
    progress(`Coordinator requires action`);
    const toolResults = [];
    const calls = run.required_action.submit_tool_outputs.tool_calls;

    for (const call of calls) {
      const fnName = call.function.name;
      const args = JSON.parse(call.function.arguments);
      progress(`Handling tool call: ${fnName} with args: ${JSON.stringify(args)}`);

      let finalSubPrompt =
        args && typeof args.prompt === "string" && args.prompt.trim() !== ""
          ? args.prompt
          : userPrompt;

      const aid =
        fnName === "get_sales_data"
          ? SALES_ID
          : fnName === "predict"
            ? SALES_ID
            : FORECAST_ID;

      progress(`Routing to specialized assistant with prompt: "${finalSubPrompt}"`);

      progress("Creating sub-thread...");
      const subThread = await client.beta.threads.create();

      await client.beta.threads.messages.create(subThread.id, {
        role: "user",
        content: finalSubPrompt,
      });

      progress(`Running sub-assistant...`);
      let subRun = await client.beta.threads.runs.create(subThread.id, {
        assistant_id: aid,
      });
      subRun = await waitOnRun(subThread.id, subRun.id);
      progress(`Sub-assistant run completed.`);
      if (subRun.status === "completed") {
        const msgs = await client.beta.threads.messages.list(subThread.id, {
          order: "desc",
          limit: 1,
        });
        const lastMsg = msgs.data[0];
        const content = extractContentFromMessage(lastMsg);


        if (content.images && content.images.length > 0) {

          const result = JSON.stringify({
            text: content.text,
            images: content.images,
          });
          progress(
            `Sub-assistant output received with text and ${content.images.length} images`
          );
          toolResults.push({ tool_call_id: call.id, output: result });
        } else {

          const result = content.text;
          progress(`Sub-assistant output received: "${result.substring(0, 50)}..."`);
          toolResults.push({ tool_call_id: call.id, output: result });
        }
      } else {
        toolResults.push({
          tool_call_id: call.id,
          output: `Error: Sub-agent ${fnName} failed.`,
        });
      }
    }


    if (toolResults.length > 0) {
      progress(
        `Submitting ${toolResults.length} tool outputs back to coordinator...`
      );
      run = await client.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
        tool_outputs: toolResults,
      });
      progress("Tool outputs submitted. Waiting for coordinator to process...");
      console.log(`[DEBUG] Submitted outputs, new run id: ${run.id}`);
      run = await waitOnRun(thread.id, run.id);
      progress("Coordinator processing of tool outputs completed.");
    }
  } else {
    progress(
      "No tool actions required by coordinator, or run status was not 'requires_action'."
    );
    console.log(
      "[DEBUG] No tools requested by coordinator or run status is not 'requires_action'."
    );
  }

  if (run.status === "completed") {
    const messages = await client.beta.threads.messages.list(thread.id, {
      order: "desc",
      limit: 10,
    });
    const finalMsg = messages.data[0];
    const response = extractTextFromMessage(finalMsg);
    progress("Final response received from coordinator.");
    console.log(`[DEBUG] Final coordinator response: ${JSON.stringify(response)}`);
    return response;
  } else {
    progress(
      `Error: Coordinator run ${run.id} did not complete successfully. Status: ${run.status}`
    );
    console.error(
      `[ERROR] Coordinator run ${run.id} did not complete successfully. Status: ${run.status}`
    );

    if (run.last_error) {
      progress(`Run failed with error: ${run.last_error.message}`);
      console.error(
        `[ERROR] Run failed with error: ${run.last_error.message} (Code: ${run.last_error.code})`
      );
    }
    return "Error: Could not get a response from the assistant.";
  }
}
