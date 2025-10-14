import React, { useMemo, useState } from "react";
import { api } from "../utils/api";

const emptyItem = { category: "plastic", weightKG: "" };

const rates = { plastic: 40, paper: 20, glass: 10, metal: 70, ewaste: 0 };

const RecyclableSubmissionForm = () => {
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const totalPreview = useMemo(() =>
    items.reduce((sum, it) => sum + (rates[it.category] || 0) * (Number(it.weightKG) || 0), 0)
  , [items]);

  const validate = () => {
    const e = {};
    if (items.length === 0) e.items = "Add at least one item";
    items.forEach((it, idx) => {
      if (!["plastic","paper","glass","metal","ewaste"].includes(it.category)) e[`category_${idx}`] = "Invalid";
      if (!it.weightKG || Number(it.weightKG) <= 0) e[`weight_${idx}`] = "Enter weight > 0";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const updateItem = (idx, key, value) => {
    const next = items.slice();
    next[idx][key] = value;
    setItems(next);
  };
  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setMsg("Submitting...");
    const payload = { items: items.map(i => ({ category: i.category, weightKG: Number(i.weightKG) })) };
    try {
      const res = await api.post("/api/recyclables", payload);
      setMsg(`${res.message} | Estimated payback: Rs. ${res.data.totalPayback.toFixed(2)}`);
      setItems([{ ...emptyItem }]);
    } catch (err) { setMsg(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <h1>Recyclable Submission</h1>
      <p style={{ color: "var(--muted)" }}>Estimated payback preview: Rs. {totalPreview.toFixed(2)}</p>
      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        {items.map((it, idx) => (
          <div key={idx} className="card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12 }}>
              <div>
                <label>Category</label>
                <select value={it.category} onChange={(e) => updateItem(idx, "category", e.target.value)} disabled={loading}>
                  <option>plastic</option><option>paper</option><option>glass</option><option>metal</option><option>ewaste</option>
                </select>
                {errors[`category_${idx}`] && <div style={{ color: "var(--danger)" }}>{errors[`category_${idx}`]}</div>}
              </div>
              <div>
                <label>Weight (kg)</label>
                <input type="number" step="0.01" min="0.01" value={it.weightKG}
                       onChange={(e) => updateItem(idx, "weightKG", e.target.value)} disabled={loading} />
                {errors[`weight_${idx}`] && <div style={{ color: "var(--danger)" }}>{errors[`weight_${idx}`]}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button type="button" onClick={() => removeItem(idx)} disabled={loading}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        {errors.items && <div style={{ color: "var(--danger)" }}>{errors.items}</div>}
        <button type="button" onClick={addItem} disabled={loading}>+ Add Item</button>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Recyclables"}</button>
        </div>
        <p style={{ color: "var(--muted)" }}>{msg}</p>
      </form>
    </>
  );
};

export default RecyclableSubmissionForm;
