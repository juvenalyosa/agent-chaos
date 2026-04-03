const form = document.querySelector("#control-form");
const startButton = document.querySelector("#start-button");
const stopButton = document.querySelector("#stop-button");
const resetButton = document.querySelector("#reset-button");
const pullButton = document.querySelector("#pull-button");
const languageInput = document.querySelector("#language");
const runState = document.querySelector("#run-state");
const turnCount = document.querySelector("#turn-count");
const ollamaState = document.querySelector("#ollama-state");
const feedback = document.querySelector("#feedback");
const transcript = document.querySelector("#transcript");
const agentList = document.querySelector("#agent-list");
const topicDisplay = document.querySelector("#topic-display");
const pullLog = document.querySelector("#pull-log");
const modelInput = document.querySelector("#model");
const topicInput = document.querySelector("#topic");
const intervalInput = document.querySelector("#intervalMs");
const maxTurnsInput = document.querySelector("#maxTurns");

let appState = null;
const translations = {
  en: {
    pageTitle: "Agent Chaos",
    eyebrow: "Ollama Multi-Agent Sandbox",
    heroTitle: "Fifteen random agents, one shared room.",
    heroCopy:
      "Start a local conversation, watch the transcript stream in real time, and kill it the second it gets boring.",
    runStateLabel: "Run State",
    turnsLabel: "Turns",
    ollamaLabel: "Ollama",
    controlsTitle: "Controls",
    controlsCopy:
      "Default model is `gemma4`. Pull it locally first if it is not already installed in Ollama.",
    modelLabel: "Model tag",
    languageLabel: "Language",
    topicLabel: "Conversation seed",
    topicPlaceholder: "Give the room a topic, or leave this alone.",
    delayLabel: "Delay (ms)",
    maxTurnsLabel: "Max turns",
    startButton: "Start conversation",
    stopButton: "Stop",
    resetButton: "Reset",
    pullButton: "Pull model",
    pullLogTitle: "Model Pull Log",
    transcriptTitle: "Live Transcript",
    agentsTitle: "Agents",
    agentsCopy: "Who has spoken, and who looks ready to interrupt.",
    topicPrefix: "Topic",
    noPullStarted: "No pull started.",
    noMessages: "No messages yet.",
    waitingForTurn: "Waiting for a turn.",
    never: "never",
    lines_one: "1 line",
    lines_other: "{count} lines",
    lastSpokeAt: "Last spoke at {time}",
    hasNotSpoken: "Has not spoken yet",
    online: "Online ({count} models)",
    offline: "Offline ({message})",
    ready: "Ollama is reachable. Start the room when ready.",
    offlineMessage:
      "Ollama is offline right now. Start the Ollama app first, then pull the model.",
    modelMissing:
      "Ollama is online, but {model} is not installed locally yet. Click Pull model first.",
    startingConversation: "Starting conversation...",
    live: "Conversation is live.",
    stopped: "Conversation stopped.",
    reset: "Conversation reset.",
    startingPull: "Starting model pull...",
    started: "Conversation started.",
    failed: "Conversation failed.",
    pullFinished: "Model pull finished.",
    pullFinishedCode: "Model pull ended with exit code {code}.",
    disconnected: "Live updates disconnected. Refresh the page if the UI stalls.",
    agentThinking: "{name} is thinking...",
    idle: "Idle",
    running: "Running",
    stoppedByUser: "Stopped by user",
    reachedMaxTurns: "Reached max turns",
    stoppedAfterError: "Stopped after an Ollama error",
    alreadyStopped: "Already stopped",
    resetByUser: "Reset by user"
  },
  es: {
    pageTitle: "Caos de Agentes",
    eyebrow: "Sandbox Multiagente con Ollama",
    heroTitle: "Quince agentes aleatorios, una sola sala.",
    heroCopy:
      "Inicia una conversación local, mira la transcripción en tiempo real y córtala en cuanto se vuelva aburrida.",
    runStateLabel: "Estado",
    turnsLabel: "Turnos",
    ollamaLabel: "Ollama",
    controlsTitle: "Controles",
    controlsCopy:
      "El modelo por defecto es `gemma4`. Descárgalo primero si todavía no está instalado en Ollama.",
    modelLabel: "Etiqueta del modelo",
    languageLabel: "Idioma",
    topicLabel: "Semilla de conversación",
    topicPlaceholder: "Dale un tema a la sala o déjalo así.",
    delayLabel: "Retraso (ms)",
    maxTurnsLabel: "Máximo de turnos",
    startButton: "Iniciar conversación",
    stopButton: "Detener",
    resetButton: "Reiniciar",
    pullButton: "Descargar modelo",
    pullLogTitle: "Registro de descarga",
    transcriptTitle: "Transcripción en vivo",
    agentsTitle: "Agentes",
    agentsCopy: "Quién ya habló y quién parece listo para interrumpir.",
    topicPrefix: "Tema",
    noPullStarted: "No se ha iniciado ninguna descarga.",
    noMessages: "Todavía no hay mensajes.",
    waitingForTurn: "Esperando turno.",
    never: "nunca",
    lines_one: "1 línea",
    lines_other: "{count} líneas",
    lastSpokeAt: "Última vez que habló: {time}",
    hasNotSpoken: "Todavía no ha hablado",
    online: "En línea ({count} modelos)",
    offline: "Sin conexión ({message})",
    ready: "Ollama está disponible. Inicia la sala cuando quieras.",
    offlineMessage:
      "Ollama está desconectado ahora mismo. Abre Ollama primero y luego descarga el modelo.",
    modelMissing:
      "Ollama está en línea, pero {model} todavía no está instalado localmente. Pulsa Descargar modelo primero.",
    startingConversation: "Iniciando conversación...",
    live: "La conversación está en vivo.",
    stopped: "Conversación detenida.",
    reset: "Conversación reiniciada.",
    startingPull: "Iniciando descarga del modelo...",
    started: "Conversación iniciada.",
    failed: "La conversación falló.",
    pullFinished: "La descarga del modelo terminó.",
    pullFinishedCode: "La descarga terminó con el código {code}.",
    disconnected: "Las actualizaciones en vivo se desconectaron. Recarga la página si la interfaz se queda quieta.",
    idle: "Inactivo",
    running: "En ejecución",
    stoppedByUser: "Detenido por el usuario",
    reachedMaxTurns: "Se alcanzó el máximo de turnos",
    stoppedAfterError: "Detenido después de un error de Ollama",
    alreadyStopped: "Ya estaba detenido",
    resetByUser: "Reiniciado por el usuario"
  },
  de: {
    pageTitle: "Agentenchaos",
    eyebrow: "Ollama Multi-Agenten-Sandbox",
    heroTitle: "Fünfzehn zufällige Agenten, ein gemeinsamer Raum.",
    heroCopy:
      "Starte eine lokale Unterhaltung, beobachte das Live-Transkript und stoppe alles, sobald es langweilig wird.",
    runStateLabel: "Status",
    turnsLabel: "Züge",
    ollamaLabel: "Ollama",
    controlsTitle: "Steuerung",
    controlsCopy:
      "Das Standardmodell ist `gemma4`. Lade es zuerst herunter, falls es in Ollama noch nicht installiert ist.",
    modelLabel: "Modell-Tag",
    languageLabel: "Sprache",
    topicLabel: "Gesprächsthema",
    topicPlaceholder: "Gib dem Raum ein Thema oder lass es leer.",
    delayLabel: "Verzögerung (ms)",
    maxTurnsLabel: "Max. Züge",
    startButton: "Gespräch starten",
    stopButton: "Stoppen",
    resetButton: "Zurücksetzen",
    pullButton: "Modell laden",
    pullLogTitle: "Download-Protokoll",
    transcriptTitle: "Live-Transkript",
    agentsTitle: "Agenten",
    agentsCopy: "Wer schon gesprochen hat und wer gleich dazwischengehen will.",
    topicPrefix: "Thema",
    noPullStarted: "Noch kein Download gestartet.",
    noMessages: "Noch keine Nachrichten.",
    waitingForTurn: "Wartet auf den nächsten Zug.",
    never: "nie",
    lines_one: "1 Zeile",
    lines_other: "{count} Zeilen",
    lastSpokeAt: "Zuletzt gesprochen um {time}",
    hasNotSpoken: "Hat noch nicht gesprochen",
    online: "Online ({count} Modelle)",
    offline: "Offline ({message})",
    ready: "Ollama ist erreichbar. Starte den Raum, wenn du bereit bist.",
    offlineMessage:
      "Ollama ist gerade offline. Starte zuerst die Ollama-App und lade dann das Modell.",
    modelMissing:
      "{model} ist lokal noch nicht installiert. Klicke zuerst auf Modell laden.",
    startingConversation: "Gespräch wird gestartet...",
    live: "Das Gespräch läuft.",
    stopped: "Gespräch gestoppt.",
    reset: "Gespräch zurückgesetzt.",
    startingPull: "Modelldownload wird gestartet...",
    started: "Gespräch gestartet.",
    failed: "Das Gespräch ist fehlgeschlagen.",
    pullFinished: "Modelldownload abgeschlossen.",
    pullFinishedCode: "Der Modelldownload endete mit Code {code}.",
    disconnected: "Die Live-Verbindung wurde getrennt. Lade die Seite neu, wenn die Oberfläche hängen bleibt.",
    idle: "Leerlauf",
    running: "Läuft",
    stoppedByUser: "Vom Benutzer gestoppt",
    reachedMaxTurns: "Maximale Züge erreicht",
    stoppedAfterError: "Nach einem Ollama-Fehler gestoppt",
    alreadyStopped: "Bereits gestoppt",
    resetByUser: "Vom Benutzer zurückgesetzt"
  }
};

function t(key, variables = {}) {
  const template = translations.en[key] ?? key;

  return Object.entries(variables).reduce((message, [name, value]) => {
    return message.replaceAll(`{${name}}`, String(value));
  }, template);
}

function translateReason(reason) {
  const map = {
    Idle: t("idle"),
    Running: t("running"),
    "Stopped by user": t("stoppedByUser"),
    "Reached max turns": t("reachedMaxTurns"),
    "Stopped after an Ollama error": t("stoppedAfterError"),
    "Already stopped": t("alreadyStopped"),
    "Reset by user": t("resetByUser")
  };

  return map[reason] || reason;
}

function getAgentName(agentId) {
  return appState?.agents?.find((agent) => agent.id === agentId)?.name || "Agent";
}

function applyStaticText() {
  document.documentElement.lang = "en";
  document.title = t("pageTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
}

function modelLooksInstalled(requestedModel, installedModels) {
  const requested = requestedModel.trim();
  const requestedBase = requested.split(":")[0];

  return installedModels.some((installedModel) => {
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

function formatTime(value) {
  if (!value) {
    return t("never");
  }

  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

function setFeedback(message, tone = "") {
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function updateControls() {
  if (!appState) {
    return;
  }

  runState.textContent = appState.running
    ? t("running")
    : translateReason(appState.stopReason);
  turnCount.textContent = String(appState.turnCount);
  ollamaState.textContent = appState.ollama.ok
    ? t("online", { count: appState.ollama.models.length })
    : t("offline", { message: appState.ollama.message });

  startButton.disabled = appState.running;
  stopButton.disabled = !appState.running;
  resetButton.disabled = !appState.running && appState.messages.length === 0;
  pullButton.disabled = appState.pull.active;

  modelInput.value = appState.model;
  languageInput.value = appState.language;
  topicInput.value = appState.topic;
  intervalInput.value = appState.intervalMs;
  maxTurnsInput.value = appState.maxTurns;

  topicDisplay.textContent = `${t("topicPrefix")}: ${appState.topic}`;
  pullLog.textContent = appState.pull.lines.length
    ? appState.pull.lines.join("\n")
    : t("noPullStarted");
}

function renderTranscript() {
  if (!appState) {
    return;
  }

  transcript.innerHTML = "";

  if (!appState.messages.length && !appState.draftMessage) {
    const empty = document.createElement("div");
    empty.className = "message system";
    empty.textContent = t("noMessages");
    transcript.append(empty);
    return;
  }

  const renderedMessages = appState.draftMessage
    ? [...appState.messages, appState.draftMessage]
    : appState.messages;

  for (const message of renderedMessages) {
    const item = document.createElement("article");
    item.className = `message ${message.role}`;

    const head = document.createElement("div");
    head.className = "message-head";

    const speaker = document.createElement("div");
    speaker.className = "speaker";

    const swatch = document.createElement("span");
    swatch.className = "speaker-swatch";
    swatch.style.color = message.accent;
    swatch.style.background = message.accent;

    const name = document.createElement("span");
    name.textContent = message.speakerName;

    speaker.append(swatch, name);

    const time = document.createElement("time");
    time.className = "timestamp";
    time.textContent = formatTime(message.createdAt);

    const body = document.createElement("div");
    body.className = "message-body";
    body.textContent = message.content || (message.role === "draft" ? "..." : "");

    head.append(speaker, time);
    item.append(head, body);
    transcript.append(item);
  }

  transcript.scrollTop = transcript.scrollHeight;
}

function renderAgents() {
  if (!appState) {
    return;
  }

  agentList.innerHTML = "";

  for (const agent of appState.agents) {
    const card = document.createElement("article");
    card.className = "agent-card";

    if (agent.id === appState.currentSpeakerId) {
      card.classList.add("active");
    }

    const title = document.createElement("div");
    title.className = "agent-title";

    const name = document.createElement("div");
    name.className = "agent-name";

    const swatch = document.createElement("span");
    swatch.className = "speaker-swatch";
    swatch.style.color = agent.accent;
    swatch.style.background = agent.accent;

    const label = document.createElement("span");
    label.textContent = agent.name;

    const count = document.createElement("span");
    count.className = "agent-meta";
    count.textContent = agent.messageCount === 1
      ? t("lines_one")
      : t("lines_other", { count: agent.messageCount });

    name.append(swatch, label);
    title.append(name, count);

    const meta = document.createElement("div");
    meta.className = "agent-meta";
    meta.textContent = agent.lastSpokeAt
      ? t("lastSpokeAt", { time: formatTime(agent.lastSpokeAt) })
      : t("hasNotSpoken");

    const preview = document.createElement("div");
    preview.className = "agent-preview";
    preview.textContent = agent.lastMessage || t("waitingForTurn");

    card.append(title, meta, preview);
    agentList.append(card);
  }
}

function render() {
  applyStaticText();
  updateControls();
  renderTranscript();
  renderAgents();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}

async function loadState() {
  appState = await fetchJson("/api/state");
  render();

  if (!appState.ollama.ok) {
    setFeedback(
      t("offlineMessage"),
      "bad"
    );
    return;
  }

  if (!modelLooksInstalled(appState.model, appState.ollama.models)) {
    setFeedback(
      t("modelMissing", { model: appState.model }),
      "bad"
    );
    return;
  }

  if (appState.ollama.ok) {
    setFeedback(t("ready"), "good");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    setFeedback(t("startingConversation"), "");
    appState = await fetchJson("/api/start", {
      method: "POST",
      body: JSON.stringify({
        model: modelInput.value,
        language: languageInput.value,
        topic: topicInput.value,
        intervalMs: Number(intervalInput.value),
        maxTurns: Number(maxTurnsInput.value)
      })
    });
    render();
    setFeedback(t("live"), "good");
  } catch (error) {
    setFeedback(error.message, "bad");
  }
});

stopButton.addEventListener("click", async () => {
  try {
    appState = await fetchJson("/api/stop", { method: "POST", body: "{}" });
    render();
    setFeedback(t("stopped"), "");
  } catch (error) {
    setFeedback(error.message, "bad");
  }
});

resetButton.addEventListener("click", async () => {
  try {
    appState = await fetchJson("/api/reset", { method: "POST", body: "{}" });
    render();
    setFeedback(t("reset"), "");
  } catch (error) {
    setFeedback(error.message, "bad");
  }
});

pullButton.addEventListener("click", async () => {
  try {
    setFeedback(t("startingPull"), "");
    appState = await fetchJson("/api/pull-model", {
      method: "POST",
      body: JSON.stringify({ model: modelInput.value })
    });
    render();
  } catch (error) {
    setFeedback(error.message, "bad");
  }
});

const eventSource = new EventSource("/api/events");

eventSource.addEventListener("state", (event) => {
  appState = JSON.parse(event.data).state;
  render();
});

eventSource.addEventListener("started", (event) => {
  appState = JSON.parse(event.data).state;
  render();
  setFeedback(t("started"), "good");
});

eventSource.addEventListener("message", (event) => {
  appState = JSON.parse(event.data).state;
  render();
});

eventSource.addEventListener("turn-start", (event) => {
  appState = JSON.parse(event.data).state;
  render();
  const payload = JSON.parse(event.data);
  setFeedback(t("agentThinking", { name: getAgentName(payload.speakerId) }), "");
});

eventSource.addEventListener("stopped", (event) => {
  appState = JSON.parse(event.data).state;
  render();
  const payload = JSON.parse(event.data);
  setFeedback(translateReason(payload.reason) || t("stopped"), "");
});

eventSource.addEventListener("reset", (event) => {
  appState = JSON.parse(event.data).state;
  render();
  const payload = JSON.parse(event.data);
  setFeedback(translateReason(payload.reason) || t("reset"), "");
});

eventSource.addEventListener("error", (event) => {
  appState = JSON.parse(event.data).state;
  render();
  const payload = JSON.parse(event.data);
  setFeedback(payload.message || t("failed"), "bad");
});

eventSource.addEventListener("pull-output", (event) => {
  appState = JSON.parse(event.data).state;
  render();
});

eventSource.addEventListener("pull-finished", (event) => {
  appState = JSON.parse(event.data).state;
  render();
  const code = appState.pull.exitCode;
  setFeedback(
    code === 0
      ? t("pullFinished")
      : t("pullFinishedCode", { code }),
    code === 0 ? "good" : "bad"
  );
});

eventSource.onerror = () => {
  setFeedback(t("disconnected"), "bad");
};

await loadState();
