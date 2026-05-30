import { Router } from "express";
import healthRouter from "./health";
import courseRouter from "./course";

const router = Router();

router.use(healthRouter);
router.use("/courses", courseRouter);

export default router;