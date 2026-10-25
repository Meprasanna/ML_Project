import React from "react";
import { Route, Routes } from "react-router-dom";
import { Login, Signup, Home, Data, Predictions, Models } from "./Pages";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/data" element={<Data />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/models" element={<Models />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
