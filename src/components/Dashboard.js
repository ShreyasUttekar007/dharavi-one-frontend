import React, { useEffect, useState } from "react";
import "../css/cards.css";
import localforage from "localforage";
import { useNavigate } from "react-router-dom";
import img from "../logo_image.png";
import Sidebar from "./SideBar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await localforage.getItem("role");
        if (storedRole) {
          setRole(storedRole);
        } else {
          console.log("Role not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const logout = async () => {
    await localforage.removeItem("token");
    await localforage.removeItem("ID");
    await localforage.removeItem("email");
    navigate("/");
  };

  return (
    <div style={{ flex: 1 }} className="cards-container">
      <div className="head">
        <div>
          <Sidebar />
        </div>
        <h1 className="headerssss">Document Management System</h1>
        <div className="header-img">
          <img src={img} className="imggg" alt="STC Logo" onClick={logout} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
