import React from "react";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  return (
    <>
      <h1>Admin Panel</h1>
      <p>Only admins can view this area.</p>
      <ul>
        <li><Link to="/admin/queue">Requests Queue</Link></li>
        <li><Link to="/admin/capacity">Capacity & Conflicts</Link></li>
        <li><Link to="/admin/reports">Payback Reports</Link></li>
      </ul>
    </>
  );
};

export default AdminPanel;
