const PROTOCOL_VERSION = 1;
const MAX_BYTES = 50 * 1024 * 1024;

chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId) chrome.sidePanel.open({ windowId: tab.windowId });
});

function validatePublicHttps(value) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Only HTTPS retrieval is allowed.");
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^127\.|^10\.|^192\.168\.|^169\.254\./.test(host)
  ) {
    throw new Error("Private-network retrieval is blocked.");
  }
  return url;
}

async function captureActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("http")) {
    throw new Error("Open a public web page before capture.");
  }
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content-script.js"],
  });
  return {
    protocolVersion: PROTOCOL_VERSION,
    requestId: crypto.randomUUID(),
    operation: "RESEARCH_RESULT",
    capturedAt: new Date().toISOString(),
    payload: result,
  };
}

async function permissionedFetch(rawUrl) {
  const url = validatePublicHttps(rawUrl);
  const originPattern = `${url.origin}/*`;
  const granted = await chrome.permissions.request({ origins: [originPattern] });
  if (!granted) throw new Error(`Access to ${url.hostname} was not granted.`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      credentials: "omit",
      redirect: "follow",
      signal: controller.signal,
    });
    const finalUrl = validatePublicHttps(response.url);
    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_BYTES) throw new Error("Source exceeds the 50 MB safety limit.");
    const type = response.headers.get("content-type") || "";
    if (!/text\/html|text\/plain|application\/pdf|application\/json/i.test(type)) {
      throw new Error(`Unsupported content type: ${type || "unknown"}.`);
    }
    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_BYTES) throw new Error("Source exceeds the 50 MB safety limit.");
    return {
      finalUrl: finalUrl.toString(),
      status: response.status,
      mimeType: type,
      byteLength: body.byteLength,
      retrievedAt: new Date().toISOString(),
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
    };
  } finally {
    clearTimeout(timeout);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.protocolVersion !== PROTOCOL_VERSION) {
    sendResponse({ ok: false, error: "Unsupported protocol." });
    return;
  }
  const operation =
    message.operation === "CAPTURE_ACTIVE_TAB"
      ? captureActiveTab()
      : message.operation === "FETCH_APPROVED_URL"
        ? permissionedFetch(message.url)
        : Promise.reject(new Error("Unsupported operation."));
  operation.then((result) => sendResponse({ ok: true, result })).catch((error) =>
    sendResponse({ ok: false, error: error instanceof Error ? error.message : "Capture failed." }),
  );
  return true;
});
