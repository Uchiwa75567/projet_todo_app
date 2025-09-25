import { Router } from "express";
import { getHistory } from "../controllers/ActionLogController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/history", authMiddleware, getHistory);
export default router;
