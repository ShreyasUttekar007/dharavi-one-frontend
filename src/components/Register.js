import api from "../utils/axiosConfig";
import { useState } from "react";
import Select from "react-select";
import "../css/register.css";
import logo from "../logo_image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "mod", label: "Moderator" },
  { value: "user", label: "User" },
];

// React-Select styles tuned to theme
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 12,
    borderColor: state.isFocused ? "var(--nb-purple)" : "var(--nb-gray-200)",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(142,45,226,.15)" : "none",
    ":hover": { borderColor: "var(--nb-purple)" },
    background: "#fff",
  }),
  multiValue: (base) => ({
    ...base,
    background: "rgba(142,45,226,.09)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--nb-purple-deep)",
    fontWeight: 700,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--nb-purple-deep)",
    ":hover": { background: "transparent", color: "var(--nb-blue)" },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
    borderRadius: 12,
    overflow: "hidden",
  }),
};

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (selected) =>
    setRoles((selected || []).map((r) => r.value));

  const toggleShowPassword = () => setShowPassword((s) => !s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post(`${API_URL}/auth/signup`, {
        userName,
        email,
        password,
        roles,
      });
      alert("Sign Up successful!");
      window.location.reload();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Sign up failed. Please try again.";
      setError(msg);
      // eslint-disable-next-line no-console
      console.error("Sign Up failed:", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Dharavi One" className="auth-logo" />
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">
            Add a user and choose their roles to get started.
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Name</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Jane Doe"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="auth-label">Password</label>
          <div className="auth-password">
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={toggleShowPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </button>
          </div>

          <label className="auth-label">Roles</label>
          <Select
            isMulti
            options={roleOptions}
            value={roleOptions.filter((r) => roles.includes(r.value))}
            onChange={handleRoleChange}
            styles={selectStyles}
            placeholder="Select roles…"
            classNamePrefix="auth-select"
          />

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
