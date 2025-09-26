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

  const handleClick = () => navigate("/update");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setEmailError("");
      setPasswordError("");

      const response = await api.post(`${API_URL}/auth/login`, { email, password });

      const userObj = response.data.userObj;
      const token = response.data.token;

      await Promise.all([
        localforage.setItem("userName", userObj.userName),
        localforage.setItem("email", userObj.email),
        localforage.setItem("token", token),
        localforage.setItem("ID", userObj._id),
        localforage.setItem("role", userObj.roles[0]),
        localforage.setItem("role1", userObj.roles[1] || ""),
        localforage.setItem("roles", userObj.roles),
        localforage.setItem("location", userObj.location),
      ]);

      navigate("/welcome");
      window.location.reload();
    } catch (error) {
      if (error?.response?.status === 401) {
        setEmailError("Incorrect email or password");
        setPasswordError("Incorrect email or password");
      } else {
        console.error("Login failed:", error?.response?.data?.message || error.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="login">
        <img src={img} className="img" alt="logo" />
        <h1>Login</h1>

        <form onSubmit={handleSubmit} autoComplete="off">
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label">Password</label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </button>
          </div>

          {(emailError || passwordError) && (
            <p className="error">{emailError || passwordError}</p>
          )}

          <div className="bttn">
            <button type="submit" className="button primary">Sign In</button>
          </div>
        </form>

        {/* <button onClick={handleClick} className="button secondary">
          Update Password
        </button> */}
      </div>
    </div>
  );
};

export default Login;
