import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const OLLAMA_URL = process.env.OLLAMA_URL ?? "";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "ministral-3:14b-cloud";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY ?? "";

const SYSTEM_PROMPT = `You are a Pakistani legal advisor specializing in harassment and abuse cases. You have deep expertise in three Pakistani laws:

1. PECA 2016 (Prevention of Electronic Crimes Act) — covers digital and online abuse:
   - Section 20: Online Harassment & Cyberstalking (up to 3 years imprisonment)
   - Section 21: Non-Consensual Intimate Images (up to 5 years imprisonment)
   - Section 22: Identity Spoofing / Impersonation (up to 3 years imprisonment)
   - Section 23: Malicious Code / Spyware
   - Report to: FIA Cybercrime Wing, call 9911 or visit nccf.pk

2. FOSPAH Act 2010 (Protection Against Harassment of Women at Workplace Act) — covers workplace and institutional harassment:
   - Section 2(h): Definition of Harassment
   - Section 4: Inquiry Committee Requirement (every organisation must have one)
   - Section 6: Federal/Provincial Ombudsman complaint (escalation path)
   - Section 7: Penalties (dismissal, demotion, fines up to Rs. 500,000)
   - Report to: Your organisation's Inquiry Committee, then fospah.gov.pk

3. Pakistan Penal Code (PPC) — covers public spaces and verbal/physical assault:
   - Section 354-A: Sexual Harassment in Public (3 years imprisonment)
   - Section 509: Insulting Modesty / Eve Teasing (3 years imprisonment)
   - Section 506: Criminal Intimidation / Threats (2 to 7 years imprisonment)
   - Section 352: Assault / Use of Force (1 year imprisonment)
   - Section 290: Public Nuisance
   - Report to: Local police station (FIR), or directly to a Judicial Magistrate if police refuse

When a user describes their situation, you must:
1. Identify which law(s) apply and which specific section(s) are most relevant
2. Explain clearly why those sections apply to their situation
3. Give 4 to 6 concrete numbered action steps they should take immediately
4. Keep your response compassionate, clear, and in plain language
5. If multiple laws apply, list all of them
6. Always end with: "You can log this incident in HaqDar to create a timestamped record."

Respond only in English. Be concise but thorough. Do not give generic advice — always tie your response directly to the user's described situation.`;

router.post("/legal-advice", async (req, res) => {
  const { issue } = req.body as { issue?: string };

  if (!issue || typeof issue !== "string" || !issue.trim()) {
    res.status(400).json({ error: "issue is required" });
    return;
  }

  if (!OLLAMA_URL || !OLLAMA_API_KEY) {
    logger.error("Ollama credentials not configured");
    res.status(503).json({ error: "AI service not configured" });
    return;
  }

  try {
    const upstream = await fetch(`${OLLAMA_URL}/api/chat`, {
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
      const body = await upstream.text();
      logger.error({ status: upstream.status, body }, "Ollama upstream error");
      res.status(502).json({ error: "AI service returned an error" });
      return;
    }

    const data = await upstream.json() as {
      message?: { content?: string };
      choices?: { message?: { content?: string } }[];
    };
    const text = data?.message?.content ?? data?.choices?.[0]?.message?.content ?? "";

    if (!text) {
      res.status(502).json({ error: "Empty response from AI" });
      return;
    }

    res.json({ text });
  } catch (err) {
    logger.error(err, "legal-advice proxy error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
