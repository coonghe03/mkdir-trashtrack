import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("Signing in…");
    try {
      await login(email, password);
      nav("/");
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <div style={{ marginTop: 12 }}>
          <button type="submit">Login</button>
        </div>
        <p style={{ color: "var(--muted)" }}>{msg}</p>
      </form>
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
};

export default Login;
