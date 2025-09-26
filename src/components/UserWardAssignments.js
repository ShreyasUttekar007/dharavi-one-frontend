import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import localforage from "localforage";
import "../css/userWardAssignments.css";

const API_URL = process.env.REACT_APP_API_URL;

// fixed ward options 183..189
const WARD_OPTIONS = ["183", "184", "185", "186", "187", "188", "189"].map(
  (w) => ({
    value: w,
    label: `Ward ${w}`,
  })
);

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: 36,
    borderRadius: 8,
    borderColor: "#d7dbe2",
    boxShadow: "none",
  }),
  valueContainer: (b) => ({ ...b, padding: "0 8px" }),
  indicatorsContainer: (b) => ({ ...b, height: 36 }),
  menu: (b) => ({ ...b, zIndex: 5 }),
};

const UserWardAssignments = () => {
  const [token, setToken] = useState("");
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState({}); // { [userId]: bool }
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const t = await localforage.getItem("token");
      setToken(t || "");
    })();
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(res.data || []);
      } catch (e) {
        console.error("Fetch users failed:", e);
        alert("Failed to load users.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        String(r.userName || "")
          .toLowerCase()
          .includes(s) ||
        String(r.email || "")
          .toLowerCase()
          .includes(s)
    );
  }, [rows, q]);

  const setUserWardsLocal = (userId, wardsArr) => {
    setRows((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, wards: wardsArr } : u))
    );
  };

  const saveWards = async (userId, wardsArr) => {
    try {
      setSaving((s) => ({ ...s, [userId]: true }));
      const res = await axios.put(
        `${API_URL}/auth/${userId}/wards`,
        { wards: wardsArr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // ensure local state reflects saved server value
      setUserWardsLocal(userId, res.data?.wards || wardsArr);
      alert("Wards Updated Successfully!!");
    } catch (e) {
      console.error("Save wards error:", e);
      alert("Failed to update wards.");
    } finally {
      setSaving((s) => ({ ...s, [userId]: false }));
    }
  };

  return (
    <div className="uw-wrap">
      <h2 className="uw-title">Assign Wards to Users</h2>

      <div className="uw-toolbar">
        <input
          className="uw-search"
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="uw-note">Only admins/mods can edit ward access.</div>
      </div>

      {loading ? (
        <div className="uw-loading">Loading users…</div>
      ) : (
        <div className="uw-table-wrap">
          <table className="uw-table">
            <thead>
              <tr>
                <th style={{ width: 220 }}>User</th>
                <th style={{ width: 240 }}>Email</th>
                <th style={{ width: 120 }}>Roles</th>
                <th>Wards (183–189)</th>
                <th style={{ width: 120 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const currentVals = (u.wards || []).map((w) => ({
                  value: String(w),
                  label: `Ward ${w}`,
                }));
                const onChange = (opts) => {
                  const arr = (opts || []).map((o) => o.value);
                  setUserWardsLocal(u._id, arr);
                };
                const onSave = () =>
                  saveWards(u._id, (u.wards || []).map(String));

                return (
                  <tr key={u._id}>
                    <td>
                      <div className="uw-name">{u.userName || "—"}</div>
                    </td>
                    <td>{u.email}</td>
                    <td>{(u.roles || []).join(", ") || "—"}</td>
                    <td>
                      <Select
                        isMulti
                        options={WARD_OPTIONS}
                        value={currentVals}
                        onChange={onChange}
                        styles={{
                          ...selectStyles,
                          // ensure the portaled menu stacks above everything
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        placeholder="Select wards…"
                        // ↓ Portal the dropdown outside the clipped container
                        menuPortalTarget={document.body}
                        // ↓ Keep the menu anchored while the table scrolls
                        menuPosition="fixed"
                        // ↓ avoids janky auto-scrolling when the menu opens
                        menuShouldScrollIntoView={false}
                      />
                    </td>
                    <td>
                      <button
                        className="uw-save"
                        onClick={onSave}
                        disabled={!!saving[u._id]}
                        title="Save wards"
                      >
                        {saving[u._id] ? "Saving…" : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="uw-empty">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserWardAssignments;
