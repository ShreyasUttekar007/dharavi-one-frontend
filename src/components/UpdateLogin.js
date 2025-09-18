import React, { useState } from "react";
import api from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
import img from "../logo_image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const UpdateLogin = () => {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const history = useNavigate();

  const handleClick = () => {
    history("/");
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(
        `${API_URL}/auth/update-password`,
        {
          email,
          currentPassword,
          newPassword,
        }
      );
      console.log("Login success:", response.data.message);
      history("/");
    } catch (error) {
      alert(
        "Incorrect Credentials!!  Please Re-check",
        error.response.data.message
      );
      console.error("Login failed:", error.response.data.message);
    }
  };

  return (
    <div>
      <div className="container">
        <div className="login">
          <img src={img} className="img" />
          <h1>Update Password</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%"}}
            />
            <div className="password-input" style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ width: "100%"}}
              />
              <div
                className="eye-icon"
                onClick={toggleShowPassword}
                style={{
                  position: 'absolute',
                  right: '10px', 
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </div>
            </div>
            <div className="password-input" style={{ position: 'relative', marginBottom:"20px" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ width: "100%"}}
              />
              <div
                className="eye-icon"
                onClick={toggleShowPassword}
                style={{
                  position: 'absolute',
                  right: '10px', 
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </div>
            </div>
            <div className="bttn">
              <button type="submit" className="button">
                Update Password
              </button>
            </div>
          </form>
          <button onClick={handleClick} className="button">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateLogin;
