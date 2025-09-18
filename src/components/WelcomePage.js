import React, { useState, useEffect } from "react";
import localforage from "localforage";
import "../css/welcomepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faUsersLine } from "@fortawesome/free-solid-svg-icons";

const WelcomePage = () => {
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    localforage.getItem("userName").then((name) => name && setUserName(name));
    localforage.getItem("role1").then((r) => r && setRole(r));
  }, []);

  return (
    <>
      <div className="welcome-container">
        <h1>👋 Welcome, {userName}!</h1>
        <div className="buttons-container">
          <h2 className="head-text-welcome">Dashboards</h2>
          <div className="buttons">
            {role !== "mod" && role !== "hr" ? null : (
              <a href="/userdashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faUsersLine}
                  className="font-pdf"
                  size="3x"
                />
                User Data
              </a>
            )}
            <a href="/deity-structures" className="menu-buttons">
              <FontAwesomeIcon icon={faFolder} className="font-pdf" size="3x" />
              Deity-structures
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;
