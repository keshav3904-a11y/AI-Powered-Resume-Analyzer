import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resumeRouter from "./resume";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/resume", resumeRouter);

export default router;
