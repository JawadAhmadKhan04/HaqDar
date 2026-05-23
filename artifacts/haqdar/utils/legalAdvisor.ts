export interface LegalAdvice {
  text: string;
}

export async function getLegalAdvice(userIssue: string): Promise<LegalAdvice> {
  const base = process.env.EXPO_PUBLIC_DOMAIN
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
    : "";

  const response = await fetch(`${base}/api/legal-advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue: userIssue }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err?.error ?? `Request failed: ${response.status}`);
  }

  const data = await response.json() as { text?: string };
  if (!data.text) throw new Error("Empty response from AI");

  return { text: data.text };
}
