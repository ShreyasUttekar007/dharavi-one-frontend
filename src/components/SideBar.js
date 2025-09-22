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
  faFolder,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../logo_image.png";
import { useSidebar } from "../context/SidebarContext";

const SideBar = () => {
  const { sidebarOpen, close, open, toggle } = useSidebar(); // <— same state
  const [showFormModal, setShowFormModal] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const logout = async () => {
    await Promise.all([
      localforage.removeItem("token"),
      localforage.removeItem("ID"),
      localforage.removeItem("email"),
      localforage.removeItem("userName"),
      localforage.removeItem("role"),
      localforage.removeItem("role1"),
      localforage.removeItem("roles"),
      localforage.removeItem("location"),
      localforage.removeItem("stcCode"),
    ]);
    navigate("/");
    close();
  };

  useEffect(() => {
    (async () => {
      try {
        const [r1, mail, name] = await Promise.all([
          localforage.getItem("role1"),
          localforage.getItem("email"),
          localforage.getItem("userName"),
        ]);
        if (r1) setRole(r1);
        if (mail) setEmail(mail);
        if (name) setUserName(name);
      } catch (e) {
        console.error("Error fetching user context:", e);
      }
    })();
  }, []);

  return (
    <>
      <div
        className={`nb-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={close}
      />

      <aside
        className={`nb-sidebar ${sidebarOpen ? "open" : ""}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="nb-sidebar-head">
          <div className="nb-brand">
            <img src={logo} alt="Logo" />
            <div className="nb-brand-name">
              <span>Dharavi One</span>
              {userName ? <small>{userName}</small> : null}
            </div>
          </div>
        </div>

        <nav className="nb-nav">
          <a href="/welcome" className="nb-item" onClick={close}>
            <FontAwesomeIcon icon={faHouse} />
            <span>Home</span>
          </a>

          {(role === "mod" || role === "hr") && (
            <a href="/userdashboard" className="nb-item" onClick={close}>
              <FontAwesomeIcon icon={faUsersLine} />
              <span>User Data</span>
            </a>
          )}

          <a href="/deity-structures" className="nb-item" onClick={close}>
            <FontAwesomeIcon icon={faFolder} />
            <span>Religious Structures</span>
          </a>

          <a href="/schools" className="nb-item" onClick={close}>
            <FontAwesomeIcon icon={faFolder} />
            <span>School Structures</span>
          </a>

          <a href="/structure-data" className="nb-item" onClick={close}>
            <FontAwesomeIcon icon={faFolder} />
            <span>Structure Data</span>
          </a>
          <a href="/schools-table" className="nb-item" onClick={close}>
            <FontAwesomeIcon icon={faFolder} />
            <span>School Data</span>
          </a>

          {(role === "mod" || role === "hr") && (
            <a
              href="/nWuRGm1GvLXyCmQ6TbxqfQ7YasvDlY8z87TxUHrX0HUhX0Pxa9"
              className="nb-item"
              onClick={close}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Add User</span>
            </a>
          )}
        </nav>

        <div className="nb-footer">
          <button className="nb-logout" onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
