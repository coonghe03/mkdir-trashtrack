import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

const formatDate = (d) => {
  try { return new Date(d).toDateString(); } catch { return "-"; }
};

const History = () => {
  const [special, setSpecial] = useState([]);
  const [recycles, setRecycles] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const [s, r] = await Promise.all([
        api.get("/api/special-requests"),
        api.get("/api/recyclables"),
      ]);
      setSpecial(s.data || []);
      setRecycles(r.data || []);
      setMsg("");
    } catch (e) {
      setMsg(e.message || "Failed to load history");
      setSpecial([]);
      setRecycles([]);
    }
  };

  useEffect(() => { load(); }, []);

  // ---- Special Requests actions ----
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
      await api.patch(`/api/special-requests/${id}`, { preferredDate: choice });
      setMsg(`Rescheduled to ${choice}.`);
      await load();
    } catch (e) { setMsg(e.message); }
  };

  // ---- Recyclables actions ----
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

  // NEW: Download PDF using Authorized fetch -> blob
  const downloadPdf = async (id, filename = "receipt.pdf") => {
    setMsg("Preparing receipt...");
    try {
      const blob = await api.getBlob(`/api/recyclables/${id}/receipt.pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Receipt downloaded.");
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <>
      <h1>History</h1>
      {msg && <p style={{ color: "var(--muted)" }}>{msg}</p>}

      {/* Special Requests */}
      <h3>Special Requests</h3>
      {special.length === 0 ? (
        <p>No special requests yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {special.map((s) => (
            <li key={s._id} className="card" style={{ padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ textTransform: "capitalize" }}>{s.type}</strong>
                  <div>Preferred: {formatDate(s.preferredDate)}</div>
                  <div>Scheduled: {s.scheduledDate ? formatDate(s.scheduledDate) : "-"}</div>
                  <div>Status: {s.status}</div>

                  {Array.isArray(s.alternatives) && s.alternatives.length > 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                      Alternatives: {s.alternatives.map((d) => formatDate(d)).join(", ")}
                    </div>
                  )}

                  {s.conflictNote && (
                    <div style={{ fontSize: 12, color: "var(--warning)", marginTop: 4 }}>
                      Note: {s.conflictNote}
                    </div>
                  )}
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

      {/* Recyclable Submissions */}
      <h3>Recyclable Submissions</h3>
      {recycles.length === 0 ? (
        <p>No recyclable submissions yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {recycles.map((x) => (
            <li key={x._id} className="card" style={{ padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div>{x.items?.length || 0} items — Rs. {Number(x.totalPayback || 0).toFixed(2)}</div>
                  <div> Status: {x.status}{x.receiptNo ? ` — ${x.receiptNo}` : ""}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {["submitted", "processing"].includes(x.status) && (
                    <>
                      <button type="button" onClick={() => cancelRecycle(x._id)}>Cancel</button>
                      <button type="button" onClick={() => completeRecycle(x._id)}>Complete</button>
                    </>
                  )}
                  {x.status === "completed" && (
                    <button
                      type="button"
                      onClick={() => downloadPdf(x._id, (x.receiptNo || "receipt") + ".pdf")}
                    >
                      Download PDF
                    </button>
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
