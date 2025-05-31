import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddTask from "./components/AddTask";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AddTask/>} />
        {/* Remove direct route for modal */}
      </Routes>
    </Router>
  );
}

export default App;