import { Router, type IRouter } from "express";
import healthRouter from "./health";
import legalRouter from "./legal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(legalRouter);

export default router;
