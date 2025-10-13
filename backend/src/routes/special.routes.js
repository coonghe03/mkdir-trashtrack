import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createSpecialRequest,
  listSpecialRequests,
  updateSpecialRequest
} from "../controllers/special.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", listSpecialRequests);
router.post("/", createSpecialRequest);
router.patch("/:id", updateSpecialRequest);

export default router;
