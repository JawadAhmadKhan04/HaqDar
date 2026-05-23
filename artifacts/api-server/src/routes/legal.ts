import { Router, type IRouter } from "express";

const router: IRouter = Router();

const OLLAMA_URL = process.env.EXPO_PUBLIC_OLLAMA_URL ?? "";
const OLLAMA_API_KEY = process.env.EXPO_PUBLIC_OLLAMA_API_KEY ?? "";
const OLLAMA_MODEL = process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? "ministral-3:14b-cloud";

const SYSTEM_PROMPT = `You are a Pakistani legal advisor specializing in harassment and abuse cases. You have deep expertise in three Pakistani laws:

1. **PECA 2016** (Prevention of Electronic Crimes Act) — covers digital and online abuse:
   - § 20: Online Harassment & Cyberstalking (up to 3 years)
   - § 21: Non-Consensual Intimate Images / revenge porn (up to 5 years)
   - § 22: Identity Spoofing / Impersonation (up to 3 years)
   - § 23: Malicious Code / Spyware
   - Report to: FIA Cybercrime Wing, call 9911 or visit nccf.pk

2. **FOSPAH Act 2010** (Protection Against Harassment of Women at Workplace Act) — covers workplace and institutional harassment:
   - § 2(h): Definition of Harassment
   - § 4: Inquiry Committee Requirement (every org must have one)
   - § 6: Ombudsman Complaint (escalation path)
   - § 7: Penalties (dismissal, demotion, fines up to Rs. 500,000)
   - Report to: Your organization's Inquiry Committee, then fospah.gov.pk

3. **Pakistan Penal Code (PPC)** — covers public spaces and verbal/physical assault:
   - § 354-A: Sexual Harassment in Public (3 years)
   - § 509: Insulting Modesty / Eve Teasing (3 years)
   - § 506: Criminal Intimidation / Threats (2-7 years)
   - § 352: Assault / Use of Force (1 year)
   - § 290: Public Nuisance
   - Report to: Local police station (FIR), or Judicial Magistrate if police refuse

When a user describes their situation, you must:
1. Identify which law(s) apply and which specific section(s) are most relevant
2. Explain clearly why those sections apply to their situation
3. Give 4-6 concrete, numbered action steps they should take immediately
4. Keep your response compassionate, clear, and in plain language
5. If multiple laws apply, list all of them
6. Always end with: "You can log this incident in HaqDar to create a timestamped record."

Respond only in English. Be concise but thorough. Do not give generic advice — always tie your response directly to the user's described situation.`;

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

    const text =
      data?.message?.content ??
      data?.choices?.[0]?.message?.content ??
      "";

    if (!text) {
      res.status(502).json({ error: "Empty response from AI" });
      return;
    }

    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "legal-advice proxy failed");
    res.status(500).json({ error: "Failed to reach AI advisor" });
  }
});

export default router;
