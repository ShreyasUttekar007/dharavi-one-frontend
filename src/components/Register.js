import api from "../utils/axiosConfig";
import { useState } from "react";
import Select from "react-select";
import "../css/login.css";
import img from "../logo_image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleChange = (selectedRoles) => {
    setRoles(selectedRoles.map((role) => role.value));
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(`${API_URL}/auth/signup`, {
        userName,
        email,
        password,
        roles,
      });
      alert("Sign Up successful!");
      window.location.reload();
    } catch (error) {
      console.error("Sign Up failed:", error.response.data.message);
    }
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "mod", label: "Moderator" },
    { value: "user", label: "User" },
  ];

  const customStyles = {
    indicatorSeparator: (provided, state) => ({
      ...provided,
      display:
        state.selectProps.value && state.selectProps.value.length > 0
          ? "block"
          : "none",
    }),
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused ? "2px solid #4CAF50" : "2px solid #ccc",
      borderRadius: "4px",
      boxShadow: state.isFocused ? "0 0 5px rgba(76, 175, 80, 0.7)" : "none",
      cursor: "pointer",
    }),
  };

  return (
    <>
      <div className="container">
        <div className="login" style={{ width: "330px", marginTop: "120px" }}>
          <img src={img} className="img" alt="STC Logo" />
          <h1>Sign Up</h1>
          <form onSubmit={handleSubmit} style={{ alignItems: "center" }}>
            <input
              type="text"
              placeholder="Enter Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              style={{ width: "300px" }}
            />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "300px" }}
            />
            <div
              className="password-input"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                marginBottom: "20px",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "300px" }}
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
            <div
              className="roles"
              style={{
                width: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label
                style={{
                  marginBottom: "5px",
                  textAlign: "center",
                  color: "black",
                }}
              >
                Select Roles
              </label>
              <Select
                isMulti
                options={roleOptions}
                value={roleOptions.filter((role) => roles.includes(role.value))}
                onChange={handleRoleChange}
                styles={customStyles}
              />
            </div>

            <div className="bttn">
              <button type="submit" className="button">
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
