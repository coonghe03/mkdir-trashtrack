import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

const Dashboard = () => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.get("/api/health").then(setHealth).catch(() => setHealth({ status: "error" }));
  }, []);

  return (
    <>
      <h1>Dashboard</h1>
      <p>Quick overview of your submissions and upcoming pickups.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <div className="card">Backend health: {health?.status ?? "…"}</div>
        <div className="card">Pending Special Requests</div>
        <div className="card">Recent Recyclables</div>
      </div>
    </>
  );
};

export default Dashboard;
