import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

const fmt = (d) => (d ? new Date(d).toDateString() : "-");

const AdminRequestsQueue = () => {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ status: "", type: "", q: "" });
  const [msg, setMsg] = useState("");

  const load = async () => {
    const qs = new URLSearchParams();
    if (filters.status) qs.set("status", filters.status);
    if (filters.type) qs.set("type", filters.type);
    if (filters.q) qs.set("q", filters.q);
    const r = await api.get(`/api/admin/special-requests?${qs.toString()}`);
    setRows(r.data || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const search = async (e) => {
    e.preventDefault();
    try { await load(); } catch (e) { setMsg(e.message); }
  };

  const schedule = async (id) => {
    const date = window.prompt("Schedule to date (YYYY-MM-DD):");
    if (!date) return;
    setMsg("Scheduling...");
    try {
      await api.patch(`/api/admin/special-requests/${id}/schedule`, { scheduledDate: date });
      setMsg("Scheduled.");
      await load();
    } catch (e) { setMsg(e.message); }
  };

  const setStatus = async (id, status) => {
    if (!window.confirm(`Set status to ${status}?`)) return;
    setMsg("Updating...");
    try {
      await api.patch(`/api/admin/special-requests/${id}/status`, { status });
      setMsg("Updated.");
      await load();
    } catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <h1>Requests Queue</h1>
      {msg && <p style={{ color: "var(--muted)" }}>{msg}</p>}

      <form onSubmit={search} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={filters.status} onChange={(e)=>setFilters({ ...filters, status: e.target.value })}>
          <option value="">Any status</option>
          <option>pending</option>
          <option>scheduled</option>
          <option>completed</option>
          <option>canceled</option>
        </select>
        <select value={filters.type} onChange={(e)=>setFilters({ ...filters, type: e.target.value })}>
          <option value="">Any type</option>
          <option>bulky</option>
          <option>ewaste</option>
        </select>
        <input placeholder="Resident email contains…" value={filters.q}
               onChange={(e)=>setFilters({ ...filters, q: e.target.value })} />
        <button type="submit">Filter</button>
      </form>

      {rows.length === 0 ? <p>No requests found.</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map((r) => (
            <li key={r._id} className="card" style={{ padding: 12, marginBottom: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto", gap: 8, alignItems: "center" }}>
                <div>
                  <strong style={{ textTransform: "capitalize" }}>{r.type}</strong><br />
                  <span style={{ color: "var(--muted)" }}>{r.resident?.name} &lt;{r.resident?.email}&gt;</span>
                </div>
                <div>Preferred: {fmt(r.preferredDate)}</div>
                <div>Scheduled: {fmt(r.scheduledDate)}</div>
                <div>Status: {r.status}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => schedule(r._id)}>Schedule</button>
                  {r.status !== "completed" && <button onClick={() => setStatus(r._id, "completed")}>Complete</button>}
                  {r.status !== "canceled" && <button onClick={() => setStatus(r._id, "canceled")}>Cancel</button>}
                </div>
              </div>
              {r.conflictNote && <div style={{ color: "var(--warning)", marginTop: 4 }}>Note: {r.conflictNote}</div>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default AdminRequestsQueue;
