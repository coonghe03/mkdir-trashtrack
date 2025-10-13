import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createRecyclableSubmission,
  listRecyclableSubmissions,
  updateRecyclableSubmission,
  completeRecyclableSubmission
} from "../controllers/recyclable.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", listRecyclableSubmissions);
router.post("/", createRecyclableSubmission);
router.patch("/:id", updateRecyclableSubmission);
router.post("/:id/complete", completeRecyclableSubmission);

export default router;
