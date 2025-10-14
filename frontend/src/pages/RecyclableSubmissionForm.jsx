import React, { useState } from "react";
import { api } from "../utils/api";

const emptyItem = { category: "plastic", weightKG: "" };

const RecyclableSubmissionForm = () => {
  const [items, setItems] = useState([ { ...emptyItem } ]);
  const [msg, setMsg] = useState("");

  const updateItem = (idx, key, value) => {
    const next = items.slice();
    next[idx][key] = value;
    setItems(next);
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setMsg("Submitting...");
    const payload = {
      items: items.map(i => ({ category: i.category, weightKG: Number(i.weightKG) }))
    };
    try {
      const res = await api.post("/api/recyclables", payload);
      setMsg(`${res.message} | Estimated payback: Rs. ${res.data.totalPayback.toFixed(2)}`);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <h1>Recyclable Submission</h1>
      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        {items.map((it, idx) => (
          <div key={idx} className="card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12 }}>
              <div>
                <label>Category</label>
                <select value={it.category} onChange={(e) => updateItem(idx, "category", e.target.value)}>
                  <option>plastic</option><option>paper</option><option>glass</option><option>metal</option><option>ewaste</option>
                </select>
              </div>
              <div>
                <label>Weight (kg)</label>
                <input type="number" step="0.01" min="0.01" value={it.weightKG}
                       onChange={(e) => updateItem(idx, "weightKG", e.target.value)} required />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button type="button" onClick={() => removeItem(idx)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={addItem}>+ Add Item</button>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Submit Recyclables</button>
        </div>
        <p style={{ color: "var(--muted)" }}>{msg}</p>
      </form>
    </>
  );
};

export default RecyclableSubmissionForm;
