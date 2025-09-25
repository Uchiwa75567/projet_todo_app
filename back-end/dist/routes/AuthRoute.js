import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { validate } from "../validators/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
const router = Router();
router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
export default router;
