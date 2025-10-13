import mongoose from "mongoose";
import { REQUEST_STATUS, SPECIAL_TYPES } from "../utils/constants.js";

const specialRequestSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: SPECIAL_TYPES, required: true },           // bulky or ewaste
    description: { type: String },                                         // optional
    preferredDate: { type: Date, required: true },
    scheduledDate: { type: Date },                                         // resolved date after conflict handling
    status: { type: String, enum: REQUEST_STATUS, default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("SpecialRequest", specialRequestSchema);
