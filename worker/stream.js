// Decode only the public answer field, never the agent's action JSON.
export function partialAnswer(raw) {
  const match = raw.match(/^\s*\{\s*"action"\s*:\s*"finish"\s*,\s*"answer"\s*:\s*"((?:[^"\\]|\\["\\/bfnrt]|\\u[0-9a-fA-F]{4})*)/);
  if (!match) return "";
  const text = JSON.parse(`"${match[1]}"`).slice(0, 8000);
  return text.replace(/[\uD800-\uDBFF]$/, "");
}

export async function* readLines(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const {done, value} = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, {stream: true});
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        yield buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
      }
      if (done) break;
    }
    if (buffer.trim()) yield buffer.trim();
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
}
