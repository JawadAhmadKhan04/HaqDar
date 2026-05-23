export async function sha256(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

const OBF_KEY = "HqD@rS3cur3K3y!2024";

export function obfuscate(data: string): string {
  try {
    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ OBF_KEY.charCodeAt(i % OBF_KEY.length)
      );
    }
    return btoa(unescape(encodeURIComponent(result)));
  } catch {
    return btoa(data);
  }
}

export function deobfuscate(data: string): string {
  try {
    const decoded = decodeURIComponent(escape(atob(data)));
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ OBF_KEY.charCodeAt(i % OBF_KEY.length)
      );
    }
    return result;
  } catch {
    try {
      return atob(data);
    } catch {
      return data;
    }
  }
}
