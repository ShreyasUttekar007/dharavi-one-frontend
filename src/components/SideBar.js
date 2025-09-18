import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faSignOutAlt,
  faUserPlus,
  faUsersLine,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

const SideBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [role2, setRole2] = useState("");

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const logout = async () => {
    await localforage.removeItem("token");
    await localforage.removeItem("ID");
    await localforage.removeItem("email");
    navigate("/");
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await localforage.getItem("role1");
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

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await localforage.getItem("role");
        if (storedRole) {
          setRole2(storedRole);
        } else {
          console.log("Role not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const storedEmail = await localforage.getItem("email");
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          console.log("Email not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };
    fetchUserEmail();
  }, []);

  const handleFormNavigation = (path) => {
    setShowFormModal(false);
    navigate(path);
  };

  return (
    <div>
      <div
        className={`w3-sidebar w3-bar-block w3-card w3-animate-left ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="close-div">
          <button className="sidebar-close-button" onClick={closeSidebar}>
            Close &times;
          </button>
          <a href="/welcome" className="w3-bar-item w3-button">
            <div className="main-text-box">
              <FontAwesomeIcon icon={faHouse} className="font-pdf2" size="1x" />
              Home
            </div>
          </a>
          {role !== "mod" || role === "ops" ? null : (
            <a href="/userdashboard" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faUsersLine}
                  className="font-pdf2"
                  size="1x"
                />
                User Data
              </div>
            </a>
          )}

          {role !== "mod" && role !== "hr" ? null : (
            <a
              href="/nWuRGm1GvLXyCmQ6TbxqfQ7YasvDlY8z87TxUHrX0HUhX0Pxa9"
              className="w3-bar-item w3-button"
            >
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faUserPlus}
                  className="font-pdf2"
                  size="1x"
                />
                Add User
              </div>
            </a>
          )}

          <a
            href="#"
            className="w3-bar-item w3-button"
            onClick={(e) => {
              e.preventDefault(); // prevents navigation
              setShowFormModal(true);
            }}
          >
            <div className="main-text-box">
              <FontAwesomeIcon
                icon={faFileAlt}
                className="font-pdf2"
                size="1x"
              />
              Choose Report Type
            </div>
          </a>

          <a href="/" className="w3-bar-item w3-button" onClick={logout}>
            <div className="main-text-box">
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className="font-pdf2"
                size="1x"
              />
              Logout
            </div>
          </a>
        </div>
      </div>

      <div id="main">
        <button id="openNav" className="sidebar-button" onClick={openSidebar}>
          &#9776;
        </button>
      </div>

      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select a Report Type</h3>
            <ul className="form-options">
              <li onClick={() => handleFormNavigation("/area-form")}>
                📍 Area
              </li>
              <li onClick={() => handleFormNavigation("/profile-form")}>
                👤 Person Profile
              </li>
              <li onClick={() => handleFormNavigation("/daily-dossier-form")}>
                📝 Daily Dossier
              </li>
            </ul>
            <button
              className="close-btn"
              onClick={() => setShowFormModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
