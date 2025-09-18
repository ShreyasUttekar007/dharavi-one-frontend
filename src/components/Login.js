import React, { useState } from "react";
import api from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
import localforage from "localforage";
import img from "../logo_image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/update");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setEmailError("");
      setPasswordError("");
  
      const response = await api.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
  
      const userObj = response.data.userObj;
      const userEmail = userObj.email;
      const userName = userObj.userName;
      const token = response.data.token;
      const id = userObj._id;
      const roles = userObj.roles;
      const role = roles[0];
      const role1 = roles[1] || "";
      const empId = userObj.empId || "";
      const location = userObj.location;
      const stcCode = userObj.stcCode;
  
      console.log("Extracted location:", location);
      console.log("Extracted stcCode:", stcCode);
  
      await Promise.all([
        localforage.setItem("userName", userName),
        localforage.setItem("email", userEmail),
        localforage.setItem("token", token),
        localforage.setItem("ID", id),
        localforage.setItem("role", role),
        localforage.setItem("role1", role1),
        localforage.setItem("empId", empId),
        localforage.setItem("stcCode", stcCode),
        localforage.setItem("roles", roles),
        localforage.setItem("location", location),
      ]);
  
      console.log("Login success:", response.data.message);
      navigate("/welcome");
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setEmailError("Incorrect email or password");
        setPasswordError("Incorrect email or password");
      } else {
        console.error("Login failed:", error.response.data.message);
      }
    }
  };
  

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <div className="container">
        <div className="login">
          <img src={img} className="img" alt="logo" />
          <h1>LOGIN</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "260px" }}
            />
            <br />
            <div className="password-input" style={{ position: "relative", marginBottom: "20px" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "260px" }}
              />
              <div
                className="eye-icon"
                onClick={toggleShowPassword}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </div>
            </div>
            <p className="error">{passwordError}</p>
            <div className="bttn">
              <button type="submit" className="button">
                Sign In
              </button>
            </div>
          </form>
          <button onClick={handleClick} className="button">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
