import React, { useState, useEffect } from "react";
import localforage from "localforage";
import "../css/welcomepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faUsersLine } from "@fortawesome/free-solid-svg-icons";
import StructureSnapshots from "./StructureSnapshots";
import img from "../Web_Banner.png";


const WelcomePage = () => {
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    localforage.getItem("userName").then((name) => name && setUserName(name));
    localforage.getItem("role1").then((r) => r && setRole(r));
  }, []);

  return (
    <>
      <section className="welcome-banner">
        <img src={img} alt="Dharavi One banner" loading="lazy" />
      </section>
      <div className="welcome-wrap">
        <header className="welcome-hero">
          <h1 className="welcome-title">
            <span className="wave">👋</span> Welcome,{" "}
            <span className="grad">{userName || "Guest"}</span>
          </h1>
        </header>

        <section className="dashboards">
          <h2 className="section-title">Dashboards</h2>

          <div className="card-grid">
            {(role === "mod" || role === "hr") && (
              <a href="/userdashboard" className="dash-card">
                <div className="card-icon">
                  <FontAwesomeIcon icon={faUsersLine} />
                </div>
                <div className="card-body">
                  <h3>User Data</h3>
                  <p>Manage users, roles and access</p>
                </div>
                <span className="card-arrow">→</span>
              </a>
            )}

            <a href="/deity-structures" className="dash-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faFolder} />
              </div>
              <div className="card-body">
                <h3>Religious Structures</h3>
                <p>Browse, filter and review structures</p>
              </div>
              <span className="card-arrow">→</span>
            </a>
            <a href="/schools" className="dash-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faFolder} />
              </div>
              <div className="card-body">
                <h3>School Structures</h3>
                <p>A quick, filtered view of every school at a glance.</p>
              </div>
              <span className="card-arrow">→</span>
            </a>

            
            <a href="/structure-data" className="dash-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faFolder} />
              </div>
              <div className="card-body">
                <h3>Structure Data</h3>
                <p>Tabular data view & quick edits</p>
              </div>
              <span className="card-arrow">→</span>
            </a>
            <a href="/schools-table" className="dash-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faFolder} />
              </div>
              <div className="card-body">
                <h3>Schools Data</h3>
                <p>Tabular data view & quick edits</p>
              </div>
              <span className="card-arrow">→</span>
            </a>
          </div>
        </section>

        {/* <StructureSnapshots /> */}
      </div>
    </>
  );
};

export default WelcomePage;
