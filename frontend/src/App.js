import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SpecialRequestForm from "./pages/SpecialRequestForm";
import RecyclableSubmissionForm from "./pages/RecyclableSubmissionForm";
import History from "./pages/History";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/special" element={<SpecialRequestForm />} />
          <Route path="/recycle" element={<RecyclableSubmissionForm />} />
          <Route path="/history" element={<History />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
