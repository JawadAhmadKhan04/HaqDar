import { Router, type IRouter } from "express";
import healthRouter from "./health";
import legalRouter from "./legal";
import ttsRouter from "./tts";
import sttRouter from "./stt";

const router: IRouter = Router();

router.use(healthRouter);
router.use(legalRouter);
router.use(ttsRouter);
router.use(sttRouter);

export default router;
