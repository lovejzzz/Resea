export const uid = (prefix = "id") =>
  `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

export const isoNow = () => new Date().toISOString();

export const addDays = (iso: string, days: number) => {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const formatDate = (iso?: string) => {
  if (!iso) return "Not yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
};

export const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function sourceDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "local source";
  }
}

export function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
