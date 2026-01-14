import express from "express";
import { provisionClient } from "../../controllers/provisioning.controller";
import { requireAdminSecret } from "../../middleware/adminSecret";

const router: express.Router = express.Router();

router.post("/", requireAdminSecret, provisionClient);

export default router;
