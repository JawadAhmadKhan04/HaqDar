const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";
const API_BASE = DOMAIN ? `https://${DOMAIN}/api` : "/api";

export interface LegalAdvice {
  text: string;
}

export async function getLegalAdvice(userIssue: string): Promise<LegalAdvice> {
  const response = await fetch(`${API_BASE}/legal-advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue: userIssue }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${response.status}`);
  }

  const data = await response.json() as { text?: string };
  if (!data.text) throw new Error("Empty response from AI");

  return { text: data.text };
}
