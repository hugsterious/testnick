import express from "express";
import { getUsers, updateManager } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate, getUsers);
router.put("/:userId/manager", authenticate, updateManager);

export default router;
