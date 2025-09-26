import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import localforage from "localforage";

const API_URL = process.env.REACT_APP_API_URL;

// persistence keys
const SECTOR_KEY = "structuresTableSectorFilter";
const IMAGES_KEY = "structuresTableImagesFilter";
const SORT_KEY = "structuresTableSortBy";
const ORDER_KEY = "structuresTableSortOrder";

const SORT_FIELDS = [
  { value: "primaryKey", label: "Primary Key" },
  { value: "sector", label: "Sector" },
  { value: "structureName", label: "Structure Name" },
  { value: "ward", label: "Ward" },
  { value: "deity", label: "Deity" },
  { value: "areaSqFt", label: "Area (sq.ft)" },
  { value: "footfall", label: "Footfall" },
  { value: "dateOfEstablishment", label: "Date of Establishment" },
  { value: "images", label: "Has Images" },
];

const StructuresTable = () => {
  const [structures, setStructures] = useState([]);

  const [sectorFilter, setSectorFilter] = useState(
    localStorage.getItem(SECTOR_KEY) || "All"
  );
  const [imagesFilter, setImagesFilter] = useState(
    localStorage.getItem(IMAGES_KEY) || "All"
  );

  const [sortBy, setSortBy] = useState(
    localStorage.getItem(SORT_KEY) || "primaryKey"
  );
  const [sortOrder, setSortOrder] = useState(
    localStorage.getItem(ORDER_KEY) || "asc" // 'asc' | 'desc'
  );

  const navigate = useNavigate();

  // fetch data
  useEffect(() => {
    let mounted = true;
    const source = axios.CancelToken.source();

    (async () => {
      try {
        // Try localforage first, then fall back to localStorage
        const lfToken = await localforage.getItem("token");
        const lsToken = !lfToken ? localStorage.getItem("token") : null;
        const token = lfToken || lsToken;

        if (!token) {
          console.warn("No auth token found — skipping fetch.");
          return;
        }

        const res = await axios.get(`${API_URL}/structures/get-structure`, {
          headers: { Authorization: `Bearer ${token}` },
          cancelToken: source.token,
        });

        if (!mounted) return;
        setStructures(res.data || []);
      } catch (err) {
        if (axios.isCancel(err)) return; // silently ignore cancels

        if (err?.response?.status === 401) {
          console.error("Unauthorized (401) — token missing/expired.");
          // Optional: redirect to login
          // navigate("/");  // or window.location = "/"
        } else {
          console.error("Error fetching structures:", err);
        }
      }
    })();

    return () => {
      mounted = false;
      source.cancel("Component unmounted");
    };
  }, []);

  // helpers
  const toNum = (v) => {
    if (v == null) return 0;
    const m = String(v)
      .replace(/,/g, "")
      .match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  };

  const toDate = (v) => {
    if (!v) return 0;
    // try dd/mm/yyyy or dd-mm-yyyy or yyyy-mm-dd etc.
    const s = String(v).trim();
    // if looks like dd/mm/yyyy -> reorder to yyyy-mm-dd for Date
    const ddmmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (ddmmy) {
      const [_, d, m, y] = ddmmy;
      const year = y.length === 2 ? `20${y}` : y;
      const iso = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      return new Date(iso).getTime() || 0;
    }
    return new Date(s).getTime() || 0;
  };

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
  const filteredRows = useMemo(() => {
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

  // sort rows
  const rows = useMemo(() => {
    const dir = sortOrder === "desc" ? -1 : 1;

    const cmpText = (a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" });

    const arr = [...filteredRows].sort((a, b) => {
      switch (sortBy) {
        case "areaSqFt":
          return (toNum(a.areaSqFt) - toNum(b.areaSqFt)) * dir;
        case "footfall":
          return (toNum(a.footfall) - toNum(b.footfall)) * dir;
        case "dateOfEstablishment":
          return (
            (toDate(a.dateOfEstablishment) - toDate(b.dateOfEstablishment)) *
            dir
          );
        case "images": {
          // true > false when asc (Yes first)
          const av = hasImages(a) ? 1 : 0;
          const bv = hasImages(b) ? 1 : 0;
          return (av - bv) * dir;
        }
        case "sector":
        case "ward":
        case "deity":
        case "primaryKey":
        case "structureName":
        default: {
          const av = String(a?.[sortBy] ?? "");
          const bv = String(b?.[sortBy] ?? "");
          return cmpText(av, bv) * dir;
        }
      }
    });

    return arr;
  }, [filteredRows, sortBy, sortOrder]);

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

  const handleSortBy = (e) => {
    const val = e.target.value;
    setSortBy(val);
    localStorage.setItem(SORT_KEY, val);
  };

  const handleSortOrder = (e) => {
    const val = e.target.value;
    setSortOrder(val);
    localStorage.setItem(ORDER_KEY, val);
  };

  const clearFilter = () => {
    setSectorFilter("All");
    setImagesFilter("All");
    setSortBy("primaryKey");
    setSortOrder("asc");
    localStorage.removeItem(SECTOR_KEY);
    localStorage.removeItem(IMAGES_KEY);
    localStorage.removeItem(SORT_KEY);
    localStorage.removeItem(ORDER_KEY);
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

        {/* Sort by */}
        <label style={{ fontWeight: 600 }}>
          Sort by:&nbsp;
          <select
            value={sortBy}
            onChange={handleSortBy}
            style={{ padding: "6px 10px", borderRadius: 6 }}
          >
            {SORT_FIELDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        {/* Order */}
        <label style={{ fontWeight: 600 }}>
          Order:&nbsp;
          <select
            value={sortOrder}
            onChange={handleSortOrder}
            style={{ padding: "6px 10px", borderRadius: 6 }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
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
