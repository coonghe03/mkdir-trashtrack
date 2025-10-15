import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SpecialRequestForm from "./pages/SpecialRequestForm";
import RecyclableSubmissionForm from "./pages/RecyclableSubmissionForm";
import History from "./pages/History";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/Guards";

import AdminRequestsQueue from "./pages/AdminRequestsQueue";
import AdminCapacity from "./pages/AdminCapacity";
import AdminReports from "./pages/AdminReports";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/special" element={<ProtectedRoute><SpecialRequestForm /></ProtectedRoute>} />
            <Route path="/recycle" element={<ProtectedRoute><RecyclableSubmissionForm /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Admin-only */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/admin/queue" element={<AdminRoute><AdminRequestsQueue /></AdminRoute>} />
            <Route path="/admin/capacity" element={<AdminRoute><AdminCapacity /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
