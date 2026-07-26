let latestCapture;
const captureButton = document.querySelector("#capture");
const downloadButton = document.querySelector("#download");
const status = document.querySelector("#status");
const preview = document.querySelector("#preview");

captureButton.addEventListener("click", async () => {
  captureButton.disabled = true;
  status.textContent = "Capturing visible main content…";
  const response = await chrome.runtime.sendMessage({
    protocolVersion: 1,
    operation: "CAPTURE_ACTIVE_TAB",
  });
  captureButton.disabled = false;
  if (!response?.ok) {
    status.textContent = response?.error || "Capture failed.";
    return;
  }
  latestCapture = response.result;
  const payload = latestCapture.payload;
  preview.hidden = false;
  preview.textContent = `${payload.title}\n${payload.url}\n\n${payload.text.slice(0, 900)}${payload.text.length > 900 ? "…" : ""}`;
  downloadButton.hidden = false;
  status.textContent = `Captured ${payload.text.length.toLocaleString()} characters. Review before importing.`;
});

downloadButton.addEventListener("click", () => {
  if (!latestCapture) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(latestCapture, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "resea-capture.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
