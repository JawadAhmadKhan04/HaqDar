import { Router, type IRouter } from "express";
import express from "express";

const router: IRouter = Router();

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY ?? "";
const DEEPGRAM_STT_URL =
  "https://api.deepgram.com/v1/listen?model=nova-3&language=ur&punctuate=true&smart_format=true";

router.post(
  "/stt",
  // Route-level raw body parser — only fires when Content-Type is non-JSON
  express.raw({ type: "*/*", limit: "50mb" }),
  async (req, res) => {
    if (!DEEPGRAM_API_KEY) {
      res.status(503).json({ error: "STT not configured" });
      return;
    }

    const audioBuffer = req.body as Buffer;
    if (!audioBuffer || !Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
      res.status(400).json({ error: "No audio data received" });
      return;
    }

    const contentType =
      (req.headers["content-type"] as string | undefined) ?? "audio/m4a";

    let upstream: Response;
    try {
      upstream = await fetch(DEEPGRAM_STT_URL, {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": contentType,
        },
        body: audioBuffer,
      });
    } catch (err) {
      req.log.error({ err }, "stt: Deepgram fetch failed");
      res.status(502).json({ error: "Could not reach Deepgram" });
      return;
    }

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      req.log.warn({ status: upstream.status, errText }, "stt: Deepgram error");
      res.status(502).json({ error: `Deepgram error ${upstream.status}` });
      return;
    }

    const data = (await upstream.json()) as {
      results?: {
        channels?: Array<{
          alternatives?: Array<{ transcript?: string }>;
        }>;
      };
    };

    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";

    res.json({ transcript });
  }
);

export default router;
