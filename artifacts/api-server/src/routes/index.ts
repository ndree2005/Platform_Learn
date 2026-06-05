import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import authRouter from "./auth";
import coursesRouter from "./course";
import assignmentsRouter from "./assignments";
import progressRouter from "./progress";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(coursesRouter);
router.use(assignmentsRouter);
router.use(progressRouter);

export default router;
