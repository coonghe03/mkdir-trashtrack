import SpecialRequest from "../models/SpecialRequest.js";
import { createSpecialRequestSchema, updateSpecialRequestSchema } from "../validators/specialRequest.schema.js";
import { REQUEST_STATUS } from "../utils/constants.js";
import { sendEmail } from "../utils/email.js";

/**
 * Naive conflict resolution: no more than N special pickups per day.
 * If full, suggest the next day.
 */
const MAX_PER_DAY = 20;

const findNextAvailableDate = async (date) => {
  const d = new Date(date);
  for (let i = 0; i < 10; i++) { // search up to 10 days ahead
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start); end.setDate(end.getDate() + 1);

    const count = await SpecialRequest.countDocuments({
      scheduledDate: { $gte: start, $lt: end },
      status: { $in: ["pending", "scheduled"] }
    });

    if (count < MAX_PER_DAY) return start;
    d.setDate(d.getDate() + 1);
  }
  return null;
};

export const createSpecialRequest = async (req, res, next) => {
  try {
    const { error, value } = createSpecialRequestSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details });

    const { preferredDate } = value;
    // Check capacity on preferred date
    const suggested = await findNextAvailableDate(preferredDate);
    if (!suggested) return res.status(409).json({ message: "No available dates within next 10 days." });

    // If preferred is available, schedule it; otherwise propose alternative (4B)
    const preferredStart = new Date(new Date(preferredDate).setHours(0,0,0,0));
    const isPreferredAvailable = (suggested.getTime() === preferredStart.getTime());
    const scheduledDate = isPreferredAvailable ? preferredStart : suggested;

    const doc = await SpecialRequest.create({
      resident: req.user._id,
      ...value,
      scheduledDate,
      status: isPreferredAvailable ? "scheduled" : "pending"
    });

    return res.status(201).json({
      message: isPreferredAvailable
        ? "Request scheduled."
        : "Preferred date unavailable. Alternative date proposed and saved as pending.",
      data: doc
    });
  } catch (e) {
    next(e);
  }
};

export const listSpecialRequests = async (req, res, next) => {
  try {
    const docs = await SpecialRequest.find({ resident: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: docs });
  } catch (e) {
    next(e);
  }
};

export const updateSpecialRequest = async (req, res, next) => {
  try {
    const { error, value } = updateSpecialRequestSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details });

    const doc = await SpecialRequest.findOne({ _id: req.params.id, resident: req.user._id });
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (!["pending", "scheduled"].includes(doc.status))
      return res.status(409).json({ message: "Only pending/scheduled requests can be updated/canceled" });

    if (value.preferredDate) {
      // re-run scheduling suggestion
      const suggested = await (async () => {
        const MAX = 20; // same as above
        const start = new Date(new Date(value.preferredDate).setHours(0,0,0,0));
        const end = new Date(start); end.setDate(end.getDate() + 1);
        const count = await SpecialRequest.countDocuments({
          scheduledDate: { $gte: start, $lt: end },
          status: { $in: ["pending", "scheduled"] },
          _id: { $ne: doc._id }
        });
        return count < MAX ? start : await (async () => {
          const next = new Date(start); next.setDate(next.getDate() + 1);
          return next;
        })();
      })();
      doc.scheduledDate = suggested;
    }

    if (value.description !== undefined) doc.description = value.description;
    if (value.status === "canceled") doc.status = "canceled";

    await doc.save();
    res.json({ message: "Request updated", data: doc });
  } catch (e) {
    next(e);
  }
};

const dayWindow = (d) => {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return { start, end };
};

export const checkAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });

    const base = new Date(date);
    const suggestions = [];
    let probe = new Date(base);

    // propose up to 5 dates that still have capacity
    while (suggestions.length < 5) {
      const { start, end } = dayWindow(probe);
      const count = await SpecialRequest.countDocuments({
        scheduledDate: { $gte: start, $lt: end },
        status: { $in: ["pending", "scheduled"] },
      });
      if (count < MAX_PER_DAY) suggestions.push(start.toISOString().slice(0,10));
      probe.setDate(probe.getDate() + 1);
      if (suggestions.length === 10) break; // safety
    }
    res.json({ data: suggestions });
  } catch (e) { next(e); }
};

export const cancelSpecialRequest = async (req, res, next) => {
  try {
    const doc = await SpecialRequest.findOne({ _id: req.params.id, resident: req.user._id });
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (!["pending", "scheduled"].includes(doc.status))
      return res.status(409).json({ message: "Only pending/scheduled can be canceled" });

    doc.status = "canceled";
    await doc.save();

    // notify
    await sendEmail({
      to: req.user.email,
      subject: "Special Waste Request Canceled",
      html: `<p>Your request (${doc._id}) has been canceled.</p>`
    });

    res.json({ message: "Request canceled", data: doc });
  } catch (e) { next(e); }
};