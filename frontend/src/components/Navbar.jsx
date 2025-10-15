import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth() || {};

  return (
    <header className="container" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h2 style={{ margin: 0 }}>TrashTrack</h2>
        </Link>

        <nav style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
          {user ? (
            <>
              <NavLink to="/" end>Dashboard</NavLink>
              <NavLink to="/special">Special Request</NavLink>
              <NavLink to="/recycle">Recyclables</NavLink>
              <NavLink to="/history">History</NavLink>
              <NavLink to="/rewards">Rewards</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/notifications">Notifications</NavLink>
              {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
              <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
