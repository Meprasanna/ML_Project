import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Login, Signup, Home, Data, Predictions, Models } from "./Pages";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes: redirect to / if already authenticated */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected Routes: Auth Guard redirects unauthenticated users to /login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/data" element={<Data />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/models" element={<Models />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
