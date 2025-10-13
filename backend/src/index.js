import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import healthRoutes from "./routes/health.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";

const app = express();

// core middlewares
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// routes
app.use("/api/health", healthRoutes);

// health root (quick check)
app.get("/", (req, res) => {
  res.send("TrashTrack API is running 🚛♻️");
});

// errors
app.use(notFound);
app.use(errorHandler);

// start
const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};
start();
