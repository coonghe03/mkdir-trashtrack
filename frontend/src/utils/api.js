export const api = {
  get: async (path) => {
    const res = await fetch(path, { credentials: "include" });
    if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
    return res.json();
  },
  post: async (path, body) => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} failed (${res.status})`);
    return res.json();
  },
  patch: async (path, body) => {
    const res = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`PATCH ${path} failed (${res.status})`);
    return res.json();
  }
};
