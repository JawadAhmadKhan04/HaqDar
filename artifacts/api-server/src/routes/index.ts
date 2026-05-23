import { Router, type IRouter } from "express";
import healthRouter from "./health";
import legalRouter from "./legal";
import ttsRouter from "./tts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(legalRouter);
router.use(ttsRouter);

export default router;
