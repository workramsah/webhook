import express from "express";
import {
  webhookVerfication,
  webhookIncomingMessage,
  flowWebHookVerfication,
} from "../controllers/webhookController.js";

const router = express.Router();
router.post("/webhook", webhookIncomingMessage);
router.get("/webhook", webhookVerfication);
router.post("/flowwebhook", flowWebHookVerfication);
export default router;
