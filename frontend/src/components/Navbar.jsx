import React from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="container" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h2 style={{ margin: 0 }}>TrashTrack</h2>
        </Link>
        <nav style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/special">Special Request</NavLink>
          <NavLink to="/recycle">Recyclables</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/rewards">Rewards</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
