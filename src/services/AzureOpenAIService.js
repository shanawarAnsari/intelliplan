import { openAIClient as client } from "../utils/openAIClient";

// Assistant IDs from .env
const COORDINATOR_ID = process.env.REACT_APP_COORDINATOR_ASSISTANT_ID;
const SALES_ID = process.env.REACT_APP_SALES_ASSISTANT_ID;
const FORECAST_ID = process.env.REACT_APP_FORECAST_ASSISTANT_ID;

async function waitOnRun(threadId, runId) {
  let run = await client.beta.threads.runs.retrieve(threadId, runId);
  while (["queued", "in_progress"].includes(run.status)) {
    await new Promise((r) => setTimeout(r, 1000)); // Increased timeout for potentially longer operations
    run = await client.beta.threads.runs.retrieve(threadId, runId);
  }
  return run;
}

function extractTextFromMessage(message) {
  let full = "";
  for (const block of message.content) {
    if (block.text) {
      if (typeof block.text === "object") {
        full += block.text.value ?? "";
      } else {
        full += block.text.value;
      }
    } else if (block.code) {
      full += block.code.value;
    }
  }
  return full;
}

export async function orchestrate(userPrompt, onProgressUpdate) {
  const progress = (text) => {
    if (onProgressUpdate) {
      onProgressUpdate({ type: "status", text });
    }
  };

  progress("Orchestration started.");

  // 1) Start a Coordinator thread
  const thread = await client.beta.threads.create();
  progress(`Coordinator assiatant launched`);

  await client.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userPrompt,
  });
  progress("Sent user prompt to coordinator.");

  // 2) Run the Coordinator assistant
  progress("Running coordinator assistant...");
  let run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: COORDINATOR_ID,
  });
  progress(`Waiting for completion...`);
  run = await waitOnRun(thread.id, run.id);
  progress("Coordinator run completed.");

  // 3) If it requested tools, handle each call
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
          : fnName === "forecast"
          ? SALES_ID
          : FORECAST_ID;

      progress(`Routing to specialized assistant with prompt: "${finalSubPrompt}"`);

      progress("Creating sub-thread...");
      const subThread = await client.beta.threads.create();

      await client.beta.threads.messages.create(subThread.id, {
        role: "user",
        content: finalSubPrompt, // finalSubPrompt is now guaranteed to be a string
      });

      progress(`Running sub-assistant...`);
      let subRun = await client.beta.threads.runs.create(subThread.id, {
        assistant_id: aid,
      });
      subRun = await waitOnRun(subThread.id, subRun.id);
      progress(`Sub-assistant run completed.`);

      if (subRun.status === "completed") {
        const msgs = await client.beta.threads.messages.list(subThread.id, {
          order: "desc", // Get the latest messages first
          limit: 1, // We only need the last message from the sub-assistant
        });
        const lastMsg = msgs.data[0];
        const result = extractTextFromMessage(lastMsg);
        progress(`Sub-assistant output received: "${result.substring(0, 50)}..."`);
        toolResults.push({ tool_call_id: call.id, output: result });
      } else {
        toolResults.push({
          tool_call_id: call.id,
          output: `Error: Sub-agent ${fnName} failed.`,
        });
      }
    }

    // 4) Return those outputs to the Coordinator run
    if (toolResults.length > 0) {
      progress(
        `Submitting ${toolResults.length} tool outputs back to coordinator...`
      );
      run = await client.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
        tool_outputs: toolResults,
      });
      progress("Tool outputs submitted. Waiting for coordinator to process...");
      run = await waitOnRun(thread.id, run.id);
      progress("Coordinator processing of tool outputs completed.");
    }
  } else {
    progress(
      "No tool actions required by coordinator, or run status was not 'requires_action'."
    );
  }

  // 5) Fetch and return the Coordinator's answer
  if (run.status === "completed") {
    const messages = await client.beta.threads.messages.list(thread.id, {
      order: "desc", // Get the latest messages first
      limit: 1, // We only need the last message from the coordinator
    });
    const finalMsg = messages.data[0]; // The last message should be the assistant's response
    const response = extractTextFromMessage(finalMsg);
    progress("Final response received from coordinator.");
    return response;
  } else {
    progress(
      `Error: Coordinator run ${run.id} did not complete successfully. Status: ${run.status}`
    );
    // Check for run.last_error to provide more details if available
    if (run.last_error) {
      progress(`Run failed with error: ${run.last_error.message}`);
    }
    return "Error: Could not get a response from the assistant.";
  }
}
