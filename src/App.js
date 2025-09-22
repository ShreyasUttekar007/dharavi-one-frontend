import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import UpdateLogin from "./components/UpdateLogin";
import Register from "./components/Register";
import WelcomePage from "./components/WelcomePage";
import DeityStructure from "./components/DeityStructure";
import StructuresTable from "./components/StructureTable";
import UpdateStructure from "./components/UpdateStructure";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import { SidebarProvider } from "./context/SidebarContext";
import StructureSnapshots from "./components/StructureSnapshots";
import SchoolStructures from "./components/SchoolStructures";

/* ⬇️ NEW: global chat provider + floating button + modal */
import { ChatProvider } from "./context/ChatContext";
import ChatFloat from "./components/ChatFloat";
import ChatSheet from "./components/ChatSheet";
import ChatFab from "./components/ChatFab";
import SchoolsTable from "./components/SchoolsTable";
import UpdateSchool from "./components/UpdateSchool";

/* Layout for protected pages: shows header + sidebar + chat FAB */
const ProtectedLayout = () => (
  <SidebarProvider>
    <ChatProvider>
      {" "}
      {/* <-- new */}
      <Header />
      <SideBar />
      <Outlet />
      {/* Global chat controls for all logged-in routes */}
      <ChatFab />
      <ChatSheet />
    </ChatProvider>
  </SidebarProvider>
);

/* Layout for public pages: no header/sidebar/chat */
const PublicLayout = () => <Outlet />;

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes (no header/sidebar/chat) */}
        <Route element={<PublicLayout />}>
          <Route path="/alternate-login-drp" element={<Login />} />
          <Route path="/update" element={<UpdateLogin />} />
        </Route>

        {/* Protected routes (with header/sidebar/chat) */}
        <Route element={<ProtectedLayout />}>
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
          <Route
            path="/structure-data"
            element={<ProtectedRoute element={<StructuresTable />} />}
          />
          <Route
            path="/update/:id"
            element={<ProtectedRoute element={<UpdateStructure />} />}
          />
          <Route
            path="/snapshots"
            element={<ProtectedRoute element={<StructureSnapshots />} />}
          />
          <Route
            path="/schools"
            element={<ProtectedRoute element={<SchoolStructures />} />}
          />
          <Route
            path="/schools-table"
            element={<ProtectedRoute element={<SchoolsTable />} />}
          />
          <Route
            path="/schools/update/:id"
            element={<ProtectedRoute element={<UpdateSchool />} />}
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
