import { Router, type IRouter } from "express";
import healthRouter from "./health";
import legalAdviceRouter from "./legalAdvice";

const router: IRouter = Router();

router.use(healthRouter);
router.use(legalAdviceRouter);

export default router;
