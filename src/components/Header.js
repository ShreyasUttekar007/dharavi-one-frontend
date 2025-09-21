import React from "react";
import "../css/header.css";
import logo from "../logo_image.png";
import { useSidebar } from "../context/SidebarContext";

const Header = ({ title = "Dharavi One" }) => {
  const { toggle } = useSidebar(); // <— direct access

  return (
    <header className="nb-app-header">
      <button className="nb-hamburger" aria-label="Open menu" onClick={toggle}>
        <span className="nb-ham-line" />
        <span className="nb-ham-line" />
        <span className="nb-ham-line" />
      </button>

      <div className="nb-header-title">{title}</div>

      <div className="nb-header-right">
        <img src={logo} alt="Logo" className="nb-header-logo" />
      </div>
    </header>
  );
};

export default Header;
