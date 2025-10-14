import React, { useState } from "react";
import { api } from "../utils/api";

const SpecialRequestForm = () => {
  const [type, setType] = useState("bulky");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("Submitting...");
    try {
      const res = await api.post("/api/special-requests", { type, description, preferredDate });
      setMsg(res.message || "Submitted");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <h1>Special Waste Collection</h1>
      <form onSubmit={submit} style={{ maxWidth: 520 }}>
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="bulky">Bulky</option>
          <option value="ewaste">E-Waste</option>
        </select>

        <label>Preferred Date</label>
        <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} required />

        <label>Description (optional)</label>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

        <div style={{ marginTop: 12 }}>
          <button type="submit">Submit Request</button>
        </div>
        <p style={{ color: "var(--muted)" }}>{msg}</p>
      </form>
    </>
  );
};

export default SpecialRequestForm;
