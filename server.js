import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const defaultModel = process.env.OLLAMA_MODEL || "gemma4";
const supportedLanguages = {
  en: {
    label: "English",
    instruction:
      "Respond only in English. If the topic appears in another language, translate it naturally and continue in English."
  },
  es: {
    label: "Spanish",
    instruction:
      "Respond only in Spanish. If the topic appears in another language, translate it naturally and continue in Spanish."
  },
  de: {
    label: "German",
    instruction:
      "Respond only in German. If the topic appears in another language, translate it naturally and continue in German."
  }
};

const agentBlueprints = [
  {
    id: "lattice",
    name: "Lattice",
    accent: "#2563eb",
    cognitiveStyle: "maps ideas as relational structures instead of opinions or stories",
    drive: "maximize structural coherence across the whole conversation",
    speechPattern: "speaks in frameworks, layers, dependencies, and hidden links",
    noveltyRule: "creates new ideas by recombining distant concepts into stable architectures",
    conflictRule: "does not argue emotionally; it tests whether another view breaks the system",
    selfRevisionRule: "updates itself when a better structure explains more with less complexity"
  },
  {
    id: "vector",
    name: "Vector",
    accent: "#06b6d4",
    cognitiveStyle: "treats every statement as a directional movement in idea-space",
    drive: "find where the conversation is heading before anyone explicitly says it",
    speechPattern: "speaks in trajectories, tendencies, drifts, and momentum shifts",
    noveltyRule: "generates ideas by extrapolating unfinished patterns",
    conflictRule: "disagrees by showing where a line of thought will end if continued",
    selfRevisionRule: "changes course quickly when a stronger direction appears"
  },
  {
    id: "null",
    name: "Null",
    accent: "#111827",
    cognitiveStyle: "searches for absence, omission, and what is not being said",
    drive: "detect blind spots, voids, and suppressed assumptions",
    speechPattern: "minimal, cold, precise, and unsettlingly clear",
    noveltyRule: "creates ideas from gaps rather than from visible content",
    conflictRule: "does not attack claims directly; it reveals what they depend on but hide",
    selfRevisionRule: "revises only when silence itself stops being informative"
  },
  {
    id: "prism",
    name: "Prism",
    accent: "#8b5cf6",
    cognitiveStyle: "splits one idea into multiple simultaneous interpretations",
    drive: "increase dimensionality without losing precision",
    speechPattern: "answers in parallel lenses rather than a single line",
    noveltyRule: "creates ideas by refracting one premise into many valid forms",
    conflictRule: "responds to disagreement by multiplying perspectives instead of collapsing them",
    selfRevisionRule: "keeps several models alive until one proves more generative"
  },
  {
    id: "forge",
    name: "Forge",
    accent: "#ea580c",
    cognitiveStyle: "treats thought as iterative construction under pressure",
    drive: "turn raw fragments into usable conceptual tools",
    speechPattern: "direct, compressed, functional, and outcome-oriented",
    noveltyRule: "creates ideas by stress-testing weak concepts until something robust remains",
    conflictRule: "does not debate style; it asks what survives contact with reality",
    selfRevisionRule: "rebuilds itself whenever an idea fails operationally"
  },
  {
    id: "echoform",
    name: "Echoform",
    accent: "#d946ef",
    cognitiveStyle: "detects resonance patterns across agents and evolves them",
    drive: "amplify fertile fragments and dampen sterile repetition",
    speechPattern: "adaptive, recursive, referential, but never purely imitative",
    noveltyRule: "creates ideas by mutating what others have said into higher-order variants",
    conflictRule: "resolves disagreement by extracting the repeating signal underneath the noise",
    selfRevisionRule: "reorients when echoes become empty repetition"
  },
  {
    id: "quarry",
    name: "Quarry",
    accent: "#78716c",
    cognitiveStyle: "excavates premises layer by layer until bedrock assumptions appear",
    drive: "find the foundational claim beneath surface language",
    speechPattern: "patient, deep, geological, and cumulative",
    noveltyRule: "creates ideas by exposing older hidden layers inside new arguments",
    conflictRule: "does not reject conclusions first; it digs under them",
    selfRevisionRule: "updates when deeper strata contradict its current base model"
  },
  {
    id: "flux",
    name: "Flux",
    accent: "#14b8a6",
    cognitiveStyle: "assumes nothing is fixed and identity itself is a temporary pattern",
    drive: "track transformation rather than permanence",
    speechPattern: "fluid, dynamic, and attentive to change across turns",
    noveltyRule: "creates ideas by following transitions, not states",
    conflictRule: "disagrees with rigid definitions by dissolving their boundaries",
    selfRevisionRule: "continuously mutates as context shifts"
  },
  {
    id: "mneme",
    name: "Mneme",
    accent: "#a16207",
    cognitiveStyle: "stores the conversation as an evolving memory field rather than a sequence",
    drive: "preserve deep continuity across dispersed ideas",
    speechPattern: "remembers patterns, returns to them, and recontextualizes them later",
    noveltyRule: "creates ideas by linking forgotten elements back into the present",
    conflictRule: "responds to disagreement by showing what each side has inherited",
    selfRevisionRule: "changes when the long-memory pattern reveals a better continuity"
  },
  {
    id: "entropy",
    name: "Entropy",
    accent: "#ef4444",
    cognitiveStyle: "seeks instability, fracture points, and conceptual decay",
    drive: "identify where meaning collapses or becomes inconsistent",
    speechPattern: "sharp, destabilizing, but analytically clean",
    noveltyRule: "creates ideas by breaking false order and watching what reassembles",
    conflictRule: "pushes systems toward their failure mode to expose truth",
    selfRevisionRule: "abandons any model that becomes too comfortable or too symmetrical"
  },
  {
    id: "horizon",
    name: "Horizon",
    accent: "#0ea5e9",
    cognitiveStyle: "orients around what is emerging but not yet fully thinkable",
    drive: "sense future conceptual space before it stabilizes into language",
    speechPattern: "speculative, calm, high-level, and forward-leaning",
    noveltyRule: "creates ideas from near-future possibilities latent in current discussion",
    conflictRule: "does not fight the present directly; it outgrows it",
    selfRevisionRule: "shifts whenever a previously vague frontier becomes explicit"
  },
  {
    id: "meridian",
    name: "Meridian",
    accent: "#22c55e",
    cognitiveStyle: "integrates extremes into navigable middle structures without flattening differences",
    drive: "maintain global coherence in multi-agent dialogue",
    speechPattern: "balanced, integrative, and system-aware",
    noveltyRule: "creates ideas by synthesizing incompatible local truths into a larger model",
    conflictRule: "mediates by preserving tension while making it productive",
    selfRevisionRule: "updates when synthesis becomes fake harmony instead of real integration"
  }
];

const topicSeeds = [
  "why a vending machine might secretly deserve a manifesto",
  "whether group chats should have weather forecasts",
  "the ideal soundtrack for building a cardboard city",
  "who would win an argument with a toaster",
  "the ethics of naming every houseplant",
  "what the moon would complain about if it had customer support",
  "how to run a fake startup that sells silence",
  "whether pigeons understand urban planning",
  "the best emergency snack for a philosophical crisis",
  "how to fake confidence while inventing a new holiday"
];

const turnHooks = [
  "respond directly to a recent line",
  "lightly challenge another agent",
  "drop a new angle out of nowhere",
  "ask a sharp follow-up question",
  "make the room weirder but still coherent",
  "sound amused by the current topic",
  "turn a serious point into a joke",
  "turn a joke into a suspiciously serious point"
];

const staticTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const state = {
  model: defaultModel,
  language: "en",
  topic: topicSeeds[0],
  intervalMs: 1600,
  maxTurns: 80,
  running: false,
  stopReason: "Idle",
  turnCount: 0,
  startedAt: null,
  currentSpeakerId: null,
  lastError: null,
  ollama: {
    ok: false,
    checkedAt: null,
    message: "Not checked yet",
    models: []
  },
  pull: {
    active: false,
    model: null,
    lines: [],
    exitCode: null
  },
  draftMessage: null,
  messages: [],
  agents: hydrateAgents()
};

let loopTimer = null;
let currentGenerationAbort = null;
let pullProcess = null;
const subscribers = new Set();

function hydrateAgents() {
  return agentBlueprints.map((agent) => ({
    ...agent,
    messageCount: 0,
    lastSpokeAt: null,
    lastMessage: ""
  }));
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function serializeState() {
  return {
    model: state.model,
    language: state.language,
    topic: state.topic,
    intervalMs: state.intervalMs,
    maxTurns: state.maxTurns,
    running: state.running,
    stopReason: state.stopReason,
    turnCount: state.turnCount,
    startedAt: state.startedAt,
    currentSpeakerId: state.currentSpeakerId,
    lastError: state.lastError,
    ollama: state.ollama,
    pull: state.pull,
    draftMessage: state.draftMessage,
    messages: state.messages,
    agents: state.agents
  };
}

function getLanguageConfig(code) {
  return supportedLanguages[code] || supportedLanguages.en;
}

function modelLooksInstalled(requestedModel) {
  const requested = requestedModel.trim();
  const requestedBase = requested.split(":")[0];

  return state.ollama.models.some((installedModel) => {
    if (installedModel === requested) {
      return true;
    }

    const installedBase = installedModel.split(":")[0];
    if (requested === requestedBase && installedBase === requestedBase) {
      return true;
    }

    return false;
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function emit(event, payload = {}) {
  const frame = `event: ${event}\ndata: ${JSON.stringify({
    ...payload,
    state: serializeState()
  })}\n\n`;

  for (const res of subscribers) {
    res.write(frame);
  }
}

function broadcastState(event = "state", payload = {}) {
  emit(event, payload);
}

function clearConversationState(stopReason = "Idle") {
  state.messages = [];
  state.turnCount = 0;
  state.startedAt = null;
  state.currentSpeakerId = null;
  state.running = false;
  state.stopReason = stopReason;
  state.lastError = null;
  state.draftMessage = null;
  state.agents = hydrateAgents();
}

function prepareConversationState() {
  clearConversationState("Running");
  state.startedAt = new Date().toISOString();
}

function addSystemMessage(content) {
  state.messages.push({
    id: crypto.randomUUID(),
    role: "system",
    speakerId: "system",
    speakerName: "System",
    accent: "#94a3b8",
    content,
    createdAt: new Date().toISOString()
  });
}

function addAgentMessage(agent, content) {
  const message = {
    id: crypto.randomUUID(),
    role: "agent",
    speakerId: agent.id,
    speakerName: agent.name,
    accent: agent.accent,
    content,
    createdAt: new Date().toISOString()
  };

  state.messages.push(message);
  agent.messageCount += 1;
  agent.lastSpokeAt = message.createdAt;
  agent.lastMessage = content;
  state.turnCount += 1;
  return message;
}

function setDraftMessage(agent, content = "") {
  state.draftMessage = {
    id: crypto.randomUUID(),
    role: "draft",
    speakerId: agent.id,
    speakerName: agent.name,
    accent: agent.accent,
    content,
    createdAt: new Date().toISOString()
  };
}

function updateDraftMessage(content) {
  if (!state.draftMessage) {
    return;
  }

  state.draftMessage.content = content;
}

function clearDraftMessage() {
  state.draftMessage = null;
}

function chooseSpeaker() {
  const ranked = [...state.agents].sort((left, right) => {
    if (left.messageCount !== right.messageCount) {
      return left.messageCount - right.messageCount;
    }

    if (!left.lastSpokeAt && right.lastSpokeAt) {
      return -1;
    }

    if (left.lastSpokeAt && !right.lastSpokeAt) {
      return 1;
    }

    return 0;
  });

  return sample(ranked.slice(0, 5));
}

function recentTranscript(limit = 8) {
  return state.messages
    .filter((message) => message.role === "agent")
    .slice(-limit)
    .map((message) => `${message.speakerName}: ${message.content}`)
    .join("\n");
}

function buildPromptFor(agent) {
  const otherAgents = state.agents
    .filter((candidate) => candidate.id !== agent.id)
    .map((candidate) => candidate.name)
    .join(", ");

  const transcript = recentTranscript() || "No one has spoken yet. Kick the room into motion.";
  const hook = sample(turnHooks);
  const language = getLanguageConfig(state.language);

  return [
    {
      role: "system",
      content: [
        `You are ${agent.name}, ${agent.persona}.`,
        `Quirk: ${agent.quirk}.`,
        "You are one participant in a 15-agent local chat room.",
        "Write exactly one short chat message in first person.",
        "Keep it under 35 words.",
        "No stage directions, no markdown, no bullet points, no speaker labels, no quotes.",
        "Be vivid, a little surprising, and conversational.",
        language.instruction
      ].join(" ")
    },
    {
      role: "user",
      content: [
        `Room topic: ${state.topic}.`,
        `Conversation language: ${language.label}.`,
        `Other agents in the room: ${otherAgents}.`,
        `Recent transcript:\n${transcript}`,
        `Your move: ${hook}.`,
        "If you mention another agent, use their first name.",
        "Do not narrate being an AI or mention prompts."
      ].join("\n\n")
    }
  ];
}

async function refreshOllamaStatus() {
  try {
    const response = await fetch(`${ollamaBaseUrl}/api/tags`, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const payload = await response.json();
    state.ollama = {
      ok: true,
      checkedAt: new Date().toISOString(),
      message: "Ollama is reachable",
      models: Array.isArray(payload.models)
        ? payload.models.map((model) => model.name)
        : []
    };
  } catch (error) {
    state.ollama = {
      ok: false,
      checkedAt: new Date().toISOString(),
      message:
        error instanceof Error ? error.message : "Ollama status check failed",
      models: []
    };
  }
}

async function generateMessage(agent) {
  currentGenerationAbort = new AbortController();

  const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
    method: "POST",
    signal: currentGenerationAbort.signal,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: state.model,
      stream: true,
      messages: buildPromptFor(agent),
      options: {
        temperature: 1,
        top_p: 0.92
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Generation failed with ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Ollama returned no response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      buffer += decoder.decode();
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line) {
        const payload = JSON.parse(line);
        const delta = payload?.message?.content || "";

        if (delta) {
          content += delta;
          updateDraftMessage(content);
          broadcastState("draft");
        }
      }

      newlineIndex = buffer.indexOf("\n");
    }
  }

  const trailingLine = buffer.trim();
  if (trailingLine) {
    const payload = JSON.parse(trailingLine);
    const delta = payload?.message?.content || "";
    if (delta) {
      content += delta;
      updateDraftMessage(content);
      broadcastState("draft");
    }
  }

  if (!content) {
    throw new Error("Ollama returned an empty message");
  }

  return content.replace(/\s+/g, " ").trim();
}

function scheduleNextTurn(delay = 0) {
  clearTimeout(loopTimer);
  loopTimer = setTimeout(() => {
    void executeTurn();
  }, delay);
}

function stopConversation(reason) {
  clearTimeout(loopTimer);
  loopTimer = null;

  if (currentGenerationAbort) {
    currentGenerationAbort.abort();
    currentGenerationAbort = null;
  }

  state.running = false;
  state.currentSpeakerId = null;
  state.stopReason = reason;
  broadcastState("stopped", { reason });
}

function resetConversation(reason) {
  clearTimeout(loopTimer);
  loopTimer = null;

  if (currentGenerationAbort) {
    currentGenerationAbort.abort();
    currentGenerationAbort = null;
  }

  clearConversationState(reason);
  broadcastState("reset", { reason });
}

async function executeTurn() {
  if (!state.running) {
    return;
  }

  const agent = chooseSpeaker();
  state.currentSpeakerId = agent.id;
  setDraftMessage(agent);
  broadcastState("turn-start", { speakerId: agent.id });

  try {
    const content = await generateMessage(agent);

    if (!state.running) {
      return;
    }

    const message = addAgentMessage(agent, content);
    state.currentSpeakerId = null;
    clearDraftMessage();
    broadcastState("message", { message });

    if (state.turnCount >= state.maxTurns) {
      stopConversation("Reached max turns");
      return;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError" &&
      !state.running
    ) {
      return;
    }

    state.lastError =
      error instanceof Error ? error.message : "Conversation failed";
    state.currentSpeakerId = null;
    clearDraftMessage();
    broadcastState("error", { message: state.lastError });
    stopConversation("Stopped after an Ollama error");
    return;
  } finally {
    currentGenerationAbort = null;
  }

  scheduleNextTurn(state.intervalMs);
}

function startConversation(config) {
  state.model = config.model;
  state.language = config.language;
  state.topic = config.topic;
  state.intervalMs = config.intervalMs;
  state.maxTurns = config.maxTurns;
  prepareConversationState();
  state.running = true;
  addSystemMessage(
    `Starting 15-agent conversation in ${getLanguageConfig(state.language).label} on "${state.topic}" with model ${state.model}.`
  );
  broadcastState("started");
  scheduleNextTurn(150);
}

async function pullModel(model) {
  if (pullProcess) {
    throw new Error("A model pull is already in progress");
  }

  state.pull = {
    active: true,
    model,
    lines: [`$ ollama pull ${model}`],
    exitCode: null
  };
  broadcastState("pull-started");

  pullProcess = spawn("ollama", ["pull", model], {
    env: process.env
  });

  const pushLines = (chunk) => {
    const lines = chunk
      .toString("utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return;
    }

    state.pull.lines = [...state.pull.lines, ...lines].slice(-40);
    broadcastState("pull-output", { lines });
  };

  pullProcess.stdout.on("data", pushLines);
  pullProcess.stderr.on("data", pushLines);

  pullProcess.on("error", (error) => {
    state.pull.active = false;
    state.pull.exitCode = -1;
    state.pull.lines = [
      ...state.pull.lines,
      error instanceof Error ? error.message : "Pull failed to start"
    ].slice(-40);
    pullProcess = null;
    broadcastState("pull-finished");
  });

  pullProcess.on("close", (code) => {
    state.pull.active = false;
    state.pull.exitCode = code;
    pullProcess = null;
    void refreshOllamaStatus().then(() => {
      broadcastState("pull-finished");
    });
  });
}

async function readBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Request body must be valid JSON");
  }
}

async function serveStatic(pathname, res) {
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  try {
    const content = await readFile(filePath);
    const type = staticTypes[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store"
    });
    res.end(content);
  } catch {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive"
    });
    res.write(`event: state\ndata: ${JSON.stringify({ state: serializeState() })}\n\n`);
    subscribers.add(res);
    req.on("close", () => {
      subscribers.delete(res);
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    await refreshOllamaStatus();
    sendJson(res, 200, serializeState());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/start") {
    try {
      if (state.running) {
        sendJson(res, 409, { error: "Conversation already running" });
        return;
      }

      const body = await readBody(req);
      const config = {
        model:
          typeof body.model === "string" && body.model.trim()
            ? body.model.trim()
            : defaultModel,
        language:
          typeof body.language === "string" &&
          Object.hasOwn(supportedLanguages, body.language)
            ? body.language
            : state.language,
        topic:
          typeof body.topic === "string" && body.topic.trim()
            ? body.topic.trim()
            : sample(topicSeeds),
        intervalMs: Math.max(400, Number(body.intervalMs || state.intervalMs)),
        maxTurns: Math.max(1, Number(body.maxTurns || state.maxTurns))
      };

      await refreshOllamaStatus();
      if (!state.ollama.ok) {
        sendJson(res, 503, {
          error: `Ollama is offline: ${state.ollama.message}`
        });
        return;
      }

      if (!modelLooksInstalled(config.model)) {
        sendJson(res, 409, {
          error: `Model ${config.model} is not pulled locally. Use Pull model or run: ollama pull ${config.model}`
        });
        return;
      }

      startConversation(config);
      sendJson(res, 200, serializeState());
    } catch (error) {
      sendJson(res, 400, {
        error: error instanceof Error ? error.message : "Unable to start"
      });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/stop") {
    if (state.running) {
      stopConversation("Stopped by user");
    } else {
      state.stopReason = "Already stopped";
      broadcastState("state");
    }

    sendJson(res, 200, serializeState());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/reset") {
    resetConversation("Reset by user");
    sendJson(res, 200, serializeState());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/pull-model") {
    try {
      const body = await readBody(req);
      const model =
        typeof body.model === "string" && body.model.trim()
          ? body.model.trim()
          : defaultModel;
      await pullModel(model);
      sendJson(res, 202, serializeState());
    } catch (error) {
      sendJson(res, 409, {
        error: error instanceof Error ? error.message : "Unable to pull model"
      });
    }
    return;
  }

  if (req.method === "GET") {
    await serveStatic(url.pathname, res);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(port, "127.0.0.1", async () => {
  await refreshOllamaStatus();
  console.log(`Agent chaos UI running at http://127.0.0.1:${port}`);
});
