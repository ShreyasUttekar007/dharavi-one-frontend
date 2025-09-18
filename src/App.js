import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import UpdateLogin from "./components/UpdateLogin";
import Register from "./components/Register";
import WelcomePage from "./components/WelcomePage";
import DeityStructure from "./components/DeityStructure";
import StructuresTable from "./components/StructureTable";
import UpdateStructure from "./components/UpdateStructure";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/update" element={<UpdateLogin />} />
        <Route
          path="/nWuRGm1GvLXyCmQ6TbxqfQ7YasvDlY8z87TxUHrX0HUhX0Pxa9"
          element={<ProtectedRoute element={<Register />} />}
        />
        <Route
          path="/welcome"
          element={<ProtectedRoute element={<WelcomePage />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/deity-structures"
          element={<ProtectedRoute element={<DeityStructure />} />}
        />
         <Route path="/structure-data" element={<StructuresTable />} />
        <Route path="/update/:id" element={<UpdateStructure />} />
      </Routes>
    </Router>
  );
};

export default App;
