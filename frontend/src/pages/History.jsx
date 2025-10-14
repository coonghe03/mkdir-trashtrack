import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

const History = () => {
  const [special, setSpecial] = useState([]);
  const [recycles, setRecycles] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const s = await api.get("/api/special-requests");
      const r = await api.get("/api/recyclables");
      setSpecial(s.data || []);
      setRecycles(r.data || []);
    } catch {
      setSpecial([]); setRecycles([]);
    }
  };

  useEffect(() => { load(); }, []);

  const cancelSpecial = async (id) => {
    if (!window.confirm("Cancel this special request?")) return;
    setMsg("Canceling...");
    try {
      await api.post(`/api/special-requests/${id}/cancel`, {});
      setMsg("Special request canceled.");
      await load();
    } catch (e) { setMsg(e.message); }
  };

  const rescheduleSpecial = async (id) => {
    const date = window.prompt("Enter preferred date (YYYY-MM-DD):");
    if (!date) return;
    setMsg("Checking availability...");
    try {
      const avail = await api.get(`/api/special-requests/availability?date=${date}`);
      const choice = avail.data?.[0];
      if (!choice) { setMsg("No available dates found."); return; }
      // Patch the preferredDate (server will set scheduledDate accordingly)
      await api.patch(`/api/special-requests/${id}`, { preferredDate: choice });
      setMsg(`Rescheduled to ${choice}.`);
      await load();
    } catch (e) { setMsg(e.message); }
  };

  const cancelRecycle = async (id) => {
    if (!window.confirm("Cancel this recyclable submission?")) return;
    setMsg("Canceling...");
    try {
      await api.patch(`/api/recyclables/${id}`, { status: "canceled" });
      setMsg("Submission canceled.");
      await load();
    } catch (e) { setMsg(e.message); }
  };

  const completeRecycle = async (id) => {
    if (!window.confirm("Mark as completed and credit payback?")) return;
    setMsg("Completing...");
    try {
      const r = await api.postNoBody(`/api/recyclables/${id}/complete`);
      setMsg(`${r.message} Receipt: ${r.data?.receipt?.receiptNo || "-"}`);
      await load();
    } catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <h1>History</h1>
      <p style={{ color: "var(--muted)" }}>{msg}</p>

      <h3>Special Requests</h3>
      {special.length === 0 ? <p>No special requests yet.</p> : (
        <ul>
          {special.map(s => (
            <li key={s._id} className="card" style={{ padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <strong>{s.type}</strong>
                  <div>Preferred: {new Date(s.preferredDate).toDateString()}</div>
                  <div>Scheduled: {s.scheduledDate ? new Date(s.scheduledDate).toDateString() : "-"}</div>
                  <div>Status: {s.status}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["pending", "scheduled"].includes(s.status) && (
                    <>
                      <button type="button" onClick={() => rescheduleSpecial(s._id)}>Reschedule</button>
                      <button type="button" onClick={() => cancelSpecial(s._id)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3>Recyclable Submissions</h3>
      {recycles.length === 0 ? <p>No recyclable submissions yet.</p> : (
        <ul>
          {recycles.map(x => (
            <li key={x._id} className="card" style={{ padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div>{x.items.length} items — Rs. {Number(x.totalPayback || 0).toFixed(2)}</div>
                  <div>Status: {x.status}{x.receiptNo ? ` — ${x.receiptNo}` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["submitted", "processing"].includes(x.status) && (
                    <>
                      <button type="button" onClick={() => cancelRecycle(x._id)}>Cancel</button>
                      <button type="button" onClick={() => completeRecycle(x._id)}>Complete</button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default History;
