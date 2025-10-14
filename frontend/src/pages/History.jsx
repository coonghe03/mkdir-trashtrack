import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

const History = () => {
  const [special, setSpecial] = useState([]);
  const [recycles, setRecycles] = useState([]);

  useEffect(() => {
    api.get("/api/special-requests").then(r => setSpecial(r.data || [])).catch(() => setSpecial([]));
    api.get("/api/recyclables").then(r => setRecycles(r.data || [])).catch(() => setRecycles([]));
  }, []);

  return (
    <>
      <h1>History</h1>

      <h3>Special Requests</h3>
      <ul>
        {special.map(s => (
          <li key={s._id}>
            {s.type} — {new Date(s.scheduledDate || s.preferredDate).toDateString()} — {s.status}
          </li>
        ))}
      </ul>

      <h3>Recyclable Submissions</h3>
      <ul>
        {recycles.map(x => (
          <li key={x._id}>
            {x.items.length} items — Rs. {x.totalPayback?.toFixed(2)} — {x.status}{x.receiptNo ? ` — ${x.receiptNo}` : ""}
          </li>
        ))}
      </ul>
    </>
  );
};

export default History;
