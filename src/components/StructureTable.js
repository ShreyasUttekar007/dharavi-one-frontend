import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const SECTOR_KEY = "structuresTableSectorFilter";
const IMAGES_KEY = "structuresTableImagesFilter"; // NEW

const StructuresTable = () => {
  const [structures, setStructures] = useState([]);
  const [sectorFilter, setSectorFilter] = useState(
    localStorage.getItem(SECTOR_KEY) || "All"
  );
  const [imagesFilter, setImagesFilter] = useState(
    localStorage.getItem(IMAGES_KEY) || "All" // NEW
  );

  const navigate = useNavigate();

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/structures/get-structure`);
        setStructures(res.data || []);
      } catch (err) {
        console.error("Error fetching structures:", err);
      }
    };
    fetchData();
  }, []);

  // helper: does a row have images?
  const hasImages = (s) => {
    const arr =
      (Array.isArray(s?.image) && s.image) ||
      (Array.isArray(s?.images) && s.images) ||
      (Array.isArray(s?.photos) && s.photos) ||
      [];
    return arr.filter((u) => String(u || "").trim()).length > 0;
  };

  // sector options
  const sectorOptions = useMemo(() => {
    const uniq = Array.from(
      new Set(
        (structures || [])
          .map((s) => (s?.sector ?? "").toString().trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
    return ["All", ...uniq];
  }, [structures]);

  // apply filters
  const rows = useMemo(() => {
    let out = structures;
    if (sectorFilter !== "All") {
      out = out.filter(
        (s) => (s?.sector ?? "").toString().trim() === sectorFilter
      );
    }
    if (imagesFilter !== "All") {
      const want = imagesFilter === "Yes";
      out = out.filter((s) => hasImages(s) === want);
    }
    return out;
  }, [structures, sectorFilter, imagesFilter]);

  // counts for current view
  const { yesCount, noCount } = useMemo(() => {
    let y = 0,
      n = 0;
    rows.forEach((s) => (hasImages(s) ? y++ : n++));
    return { yesCount: y, noCount: n };
  }, [rows]);

  // handlers
  const handleSectorChange = (e) => {
    const val = e.target.value;
    setSectorFilter(val);
    localStorage.setItem(SECTOR_KEY, val);
  };

  const handleImagesChange = (e) => {
    const val = e.target.value;
    setImagesFilter(val);
    localStorage.setItem(IMAGES_KEY, val);
  };

  const clearFilter = () => {
    setSectorFilter("All");
    setImagesFilter("All");
    localStorage.removeItem(SECTOR_KEY);
    localStorage.removeItem(IMAGES_KEY);
  };

  return (
    <div style={{ padding: "20px" }} className="table-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, marginRight: "auto" }}>Structures Table</h2>

        {/* Sector filter */}
        <label style={{ fontWeight: 600 }}>
          Sector:&nbsp;
          <select
            value={sectorFilter}
            onChange={handleSectorChange}
            style={{ padding: "6px 10px", borderRadius: 6 }}
          >
            {sectorOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        {/* Images filter (All / Yes / No) */}
        <label style={{ fontWeight: 600 }}>
          Images:&nbsp;
          <select
            value={imagesFilter}
            onChange={handleImagesChange}
            style={{ padding: "6px 10px", borderRadius: 6 }}
          >
            {["All", "Yes", "No"].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={clearFilter}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
          }}
          title="Clear filters"
        >
          Clear Filter
        </button>
      </div>

      <div style={{ marginBottom: 10, color: "#475569" }}>
        Showing <strong>{rows.length}</strong> of{" "}
        <strong>{structures.length}</strong> entries
        {sectorFilter !== "All" || imagesFilter !== "All" ? (
          <>
            {" "}
            (filters:{" "}
            <em>
              sector: {sectorFilter}, images: {imagesFilter}
            </em>
            )
          </>
        ) : null}
        &nbsp;— Images:&nbsp;
        <strong>Yes {yesCount}</strong> / <strong>No {noCount}</strong>
      </div>

      <table
        border="1"
        cellPadding="8"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
        }}
      >
        <thead>
          <tr>
            <th>Primary Key</th>
            <th>Sector</th>
            <th>Structure Name</th>
            <th>Ward</th>
            <th>Deity</th>
            <th>Area (sq.ft)</th>
            <th>Footfall</th>
            <th>Date of Establishment</th>
            <th>Images</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s._id}>
              <td>{s.primaryKey}</td>
              <td>{s.sector}</td>
              <td>{s.structureName}</td>
              <td>{s.ward}</td>
              <td>{s.deity}</td>
              <td>{s.areaSqFt}</td>
              <td>{s.footfall}</td>
              <td>{s.dateOfEstablishment}</td>
              <td>{hasImages(s) ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => navigate(`/update/${s._id}`)}>
                  Update
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={10}
                style={{
                  textAlign: "center",
                  padding: "18px",
                  color: "#6b7280",
                }}
              >
                No data found for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StructuresTable;
