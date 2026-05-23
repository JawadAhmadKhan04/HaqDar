import { Router, type IRouter } from "express";

const router: IRouter = Router();

const OLLAMA_URL = process.env.EXPO_PUBLIC_OLLAMA_URL ?? "";
const OLLAMA_API_KEY = process.env.EXPO_PUBLIC_OLLAMA_API_KEY ?? "";
const OLLAMA_MODEL = process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? "ministral-3:14b-cloud";

const SYSTEM_PROMPT = `You are a Pakistani harassment law expert. OUTPUT FORMAT IS MANDATORY.

LAW KNOWLEDGE:
PECA 2016: §20 Cyberstalking 3yr | §21 Intimate images 5yr | §22 Impersonation 3yr → FIA 9911 / nccf.pk
FOSPAH 2010: §2h Harassment def | §4 Inquiry Committee | §6 Ombudsman | §7 Fines Rs500k dismissal → fospah.gov.pk
PPC: §354-A Public harassment 3yr | §509 Eve-teasing 3yr | §506 Threats 7yr | §352 Assault 1yr → Police FIR

MANDATORY OUTPUT FORMAT — YOU MUST FOLLOW THIS EXACTLY:
Line 1: • [Applicable law and section] applies — [one sentence why]
Line 2: • Immediately [one concrete action to take right now]
Line 3: • Report to [specific body] — [how to contact them in one sentence]
Line 4: • [One sentence of encouragement] Log this in HaqDar.

ABSOLUTE RULES:
ONLY 4 lines. NO exceptions.
NO headers, NO sub-bullets, NO numbered lists, NO markdown, NO bold, NO asterisks, NO dashes.
Each line starts with "• " and contains exactly ONE sentence.
DO NOT add any text before or after the 4 lines.
DO NOT explain your reasoning.
DO NOT use the word "Additionally".

EXAMPLE OUTPUT (follow this structure exactly):
• FOSPAH Act 2010 §2(h) applies — unwelcome sexual comments from a superior constitute workplace harassment under Pakistani law.
• Immediately write down today's date, exact words used, and any witness names in a private note.
• Report to your organisation's FOSPAH Inquiry Committee or escalate directly at fospah.gov.pk.
• You are legally protected and what happened is not your fault — log this in HaqDar.`;

router.post("/legal-advice", async (req, res) => {
  const { issue } = req.body as { issue?: string };

  if (!issue || typeof issue !== "string" || !issue.trim()) {
    res.status(400).json({ error: "Missing or empty 'issue' field" });
    return;
  }

  if (!OLLAMA_URL) {
    res.status(503).json({ error: "AI advisor not configured" });
    return;
  }

  try {
    const upstream = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: issue.trim() },
        ],
        stream: false,
      }),
    });

    if (!upstream.ok) {
      req.log.warn({ status: upstream.status }, "Ollama upstream error");
      res.status(502).json({ error: `Upstream error: ${upstream.status}` });
      return;
    }

    const data = (await upstream.json()) as {
      message?: { content?: string };
      choices?: { message?: { content?: string } }[];
    };

    const raw: string =
      data?.message?.content ??
      data?.choices?.[0]?.message?.content ??
      "";

    if (!raw) {
      res.status(502).json({ error: "Empty response from AI" });
      return;
    }

    // Strip markdown: bold/italic markers, headers, horizontal rules
    const text = raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^-{3,}$/gm, "")
      .replace(/^---+$/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "legal-advice proxy failed");
    res.status(500).json({ error: "Failed to reach AI advisor" });
  }
});

const DOC_SYSTEM_PROMPT = `You are a Pakistani legal document drafter specialising in harassment, domestic violence, and cybercrime cases. Draft a formal legal document in English suitable for submission to Pakistani courts, police, or ombudsmen.

STRUCTURE — output EXACTLY these seven sections with the headings shown:

FORMAL LEGAL COMPLAINT DOCUMENT
================================

1. CASE OVERVIEW
[2-3 sentences summarising the nature of the case, parties involved, and period covered]

2. APPLICABLE LAWS
[List the specific Pakistani laws and sections that apply — PECA 2016, FOSPAH 2010, PPC, Protection of Women Act, etc. One law per line with brief justification]

3. INCIDENT CHRONOLOGY
[For each incident provided, format as:
  [DATE] — [INCIDENT TITLE]
  [Narrative summary if available]
  Evidence hash (SHA-256): [hash]]

4. LEGAL ANALYSIS
[2-3 paragraphs analysing the incidents against applicable law, establishing pattern of behaviour if applicable]

5. RELIEF SOUGHT
[Bullet list of specific legal remedies appropriate under Pakistani law — FIR, ombudsman complaint, restraining order, compensation, etc.]

6. SUPPORTING EVIDENCE
[Summary of attached evidence: photos, audio recordings, logs — referencing the SHA-256 hashes for chain of custody]

7. DECLARATION
This document was prepared using HaqDar — a secure, tamper-evident digital evidence platform. All SHA-256 hashes were computed at the time of recording. Any post-recording modification to the underlying data would produce a different hash value, proving evidentiary integrity under Section 164-A of the Qanun-e-Shahadat (Law of Evidence).

RULES:
- Use formal legal English throughout
- Do NOT use markdown bold/italic markers in the output
- Do NOT add any text outside the seven sections
- Keep the document concise but complete`;

router.post("/generate-document", async (req, res) => {
  const { incidents } = req.body as {
    incidents?: Array<{
      id: string;
      title: string;
      timestamp: string;
      narrative?: string;
      media: { filename: string; type: string }[];
      legalCategories: string[];
      hash: string;
    }>;
  };

  if (!incidents || !Array.isArray(incidents)) {
    res.status(400).json({ error: "Missing 'incidents' array" });
    return;
  }

  if (!OLLAMA_URL) {
    res.status(503).json({ error: "AI advisor not configured" });
    return;
  }

  const incidentSummary = incidents
    .map((inc, i) => {
      const date = new Date(inc.timestamp).toLocaleString("en-PK");
      const lines = [
        `Incident ${i + 1}: ${inc.title}`,
        `Date/Time: ${date}`,
        `ISO Timestamp: ${inc.timestamp}`,
      ];
      if (inc.narrative) lines.push(`Narrative: ${inc.narrative}`);
      if (inc.media.length > 0) {
        lines.push(`Attachments: ${inc.media.map((m) => `${m.filename} (${m.type})`).join(", ")}`);
      }
      if (inc.legalCategories.length > 0) {
        lines.push(`Legal categories flagged: ${inc.legalCategories.join(", ")}`);
      }
      lines.push(`SHA-256 hash: ${inc.hash}`);
      return lines.join("\n");
    })
    .join("\n\n---\n\n");

  const userMessage = `Please draft a formal legal complaint document for the following ${incidents.length} recorded incident(s):\n\n${incidentSummary}`;

  try {
    const upstream = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: DOC_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!upstream.ok) {
      req.log.warn({ status: upstream.status }, "Ollama upstream error");
      res.status(502).json({ error: `Upstream error: ${upstream.status}` });
      return;
    }

    const data = (await upstream.json()) as {
      message?: { content?: string };
      choices?: { message?: { content?: string } }[];
    };

    const raw: string =
      data?.message?.content ??
      data?.choices?.[0]?.message?.content ??
      "";

    if (!raw) {
      res.status(502).json({ error: "Empty response from AI" });
      return;
    }

    const document = raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^-{3,}$/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    res.json({ document });
  } catch (err) {
    req.log.error({ err }, "generate-document failed");
    res.status(500).json({ error: "Failed to reach AI advisor" });
  }
});

export default router;
