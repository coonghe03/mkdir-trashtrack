import RecyclableSubmission from "../models/RecyclableSubmission.js";
import Payback from "../models/Payback.js";
import { createRecyclableSubmissionSchema, updateRecyclableSubmissionSchema } from "../validators/recyclable.schema.js";
import { calculatePayback } from "../utils/payback.js";

/**
 * Validate categories & weights, compute payback, and save.
 * Includes 4A (incorrect category/weight -> validation error).
 */
export const createRecyclableSubmission = async (req, res, next) => {
  try {
    const { error, value } = createRecyclableSubmissionSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details });

    const total = value.items.reduce((sum, item) => sum + calculatePayback(item.category, item.weightKG), 0);

    const doc = await RecyclableSubmission.create({
      resident: req.user._id,
      items: value.items,
      totalPayback: total
    });

    res.status(201).json({ message: "Submission received", data: doc });
  } catch (e) {
    next(e);
  }
};

export const listRecyclableSubmissions = async (req, res, next) => {
  try {
    const docs = await RecyclableSubmission.find({ resident: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: docs });
  } catch (e) {
    next(e);
  }
};

/**
 * Allow update/cancel before processing
 */
export const updateRecyclableSubmission = async (req, res, next) => {
  try {
    const { error, value } = updateRecyclableSubmissionSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details });

    const doc = await RecyclableSubmission.findOne({ _id: req.params.id, resident: req.user._id });
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (!["submitted", "processing"].includes(doc.status))
      return res.status(409).json({ message: "Only submitted/processing items can be updated/canceled" });

    if (value.items) {
      doc.items = value.items;
      doc.totalPayback = value.items.reduce((sum, i) => sum + calculatePayback(i.category, i.weightKG), 0);
    }
    if (value.status === "canceled") doc.status = "canceled";

    await doc.save();
    res.json({ message: "Submission updated", data: doc });
  } catch (e) {
    next(e);
  }
};

/**
 * Mark as completed -> credit payback & generate receipt
 * 10 / 10A extension behavior included
 */
export const completeRecyclableSubmission = async (req, res, next) => {
  try {
    const doc = await RecyclableSubmission.findOne({ _id: req.params.id, resident: req.user._id });
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.status === "completed") return res.status(409).json({ message: "Already completed" });

    // generate simple receipt no
    doc.status = "completed";
    doc.receiptNo = `RCPT-${Date.now()}`;
    await doc.save();

    // credit payback; simulate possible failure
    try {
      const pay = await Payback.create({
        resident: req.user._id,
        submission: doc._id,
        amount: doc.totalPayback,
        reason: "Recyclable payback",
        status: "credited"
      });
      return res.json({ message: "Submission completed. Payback credited.", data: { submission: doc, payback: pay } });
    } catch (creditErr) {
      // 10A: log and notify failure
      const pay = await Payback.create({
        resident: req.user._id,
        submission: doc._id,
        amount: doc.totalPayback,
        reason: "Recyclable payback",
        status: "failed",
        error: creditErr.message
      });
      return res.status(502).json({ message: "Submission closed but credit failed (logged).", data: { submission: doc, payback: pay } });
    }
  } catch (e) {
    next(e);
  }
};
