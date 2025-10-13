// Replace later with real JWT/session auth.
// For now, pretend the user is authenticated and inject a demo user id.
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    // In production: read token from headers, verify, load user
    // For scaffolding we upsert a demo user:
    let user = await User.findOne({ email: "demo@resident.local" });
    if (!user) {
      user = await User.create({
        email: "demo@resident.local",
        name: "Demo Resident",
        address: {
          line1: "123 Main St",
          city: "Colombo",
          postalCode: "00100",
          municipalAreaId: "CMC-01"
        }
      });
    }
    req.user = user; // attach to request
    next();
  } catch (e) {
    next(e);
  }
};
