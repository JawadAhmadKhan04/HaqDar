import { Router, type IRouter } from "express";

const router: IRouter = Router();

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY ?? "";
const DEEPGRAM_TTS_URL = "https://api.deepgram.com/v1/speak";

// Detect whether a string is primarily Urdu/Arabic script
function detectUrdu(text: string): boolean {
  const urduChars = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  return urduChars / text.length > 0.3;
}

router.get("/tts", async (req, res) => {
  const text = ((req.query.text as string | undefined) ?? "").trim();

  if (!text) {
    res.status(400).json({ error: "Missing 'text' query parameter" });
    return;
  }

  if (!DEEPGRAM_API_KEY) {
    res.status(503).json({ error: "TTS not configured" });
    return;
  }

  const isUrdu = detectUrdu(text);
  // Deepgram Aura models — aura-asteria-en handles mixed-script content best
  // When Deepgram releases a dedicated Urdu model, swap the model param here
  const model = isUrdu ? "aura-stella-en" : "aura-asteria-en";

  let upstream: Response;
  try {
    upstream = await fetch(`${DEEPGRAM_TTS_URL}?model=${model}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text.slice(0, 2000) }),
    });
  } catch (err) {
    req.log.error({ err }, "tts: Deepgram fetch failed");
    res.status(502).json({ error: "Could not reach Deepgram" });
    return;
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    req.log.warn({ status: upstream.status, errText }, "tts: Deepgram error");
    res.status(502).json({ error: `Deepgram error ${upstream.status}` });
    return;
  }

  if (!upstream.body) {
    res.status(502).json({ error: "Empty audio body from Deepgram" });
    return;
  }

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const reader = upstream.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    req.log.error({ err }, "tts: stream write error");
    res.end();
  }
});

export default router;
