import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import localforage from "localforage";
import "../css/deityStructure.css";

const PLACEHOLDER_IMG =
  "https://placehold.co/520x300?text=No+Image&font=roboto";

const STATUS_OPTIONS = ["Relevance", "Relocate", "Consolidate"];
const RELEVANCE_OPTIONS = ["Low", "Moderate", "High", "Critical"];

// keep slider height in one place (CSS also uses 280px)
const SLIDE_H = 280;

const API_URL = process.env.REACT_APP_API_URL;

const DeityStructure = () => {
  const [role, setRole] = useState("viewer"); // viewer | mod
  const [structures, setStructures] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [currentIndex, setCurrentIndex] = useState({}); // per-card index

  // dropdown filters (auto-filled from data)
  const [pick, setPick] = useState({
    primaryKey: "All",
    sector: "All",
    ward: "All",
    relevance: "All",
    deity: "All",
  });

  // slider filters (minimum thresholds)
  const [minFootfall, setMinFootfall] = useState(0);
  const [minArea, setMinArea] = useState(0);

  // role from localforage
  useEffect(() => {
    (async () => {
      try {
        const r = await localforage.getItem("role");
        if (typeof r === "string") setRole(r);
      } catch {
        /* viewer by default */
      }
    })();
  }, []);

  // fetch
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${API_URL}/structures/get-structure`
        );
        const data = res.data || [];
        setStructures(data);
        setFiltered(data);

        // initialize per-card slide index
        const initIdx = {};
        data.forEach((s) => (initIdx[s._id || s.primaryKey] = 0));
        setCurrentIndex(initIdx);
      } catch (e) {
        console.error("Error fetching structures:", e);
      }
    })();
  }, []);

  // helpers
  const toNum = (v) => {
    if (v == null) return 0;
    const n = String(v)
      .replace(/,/g, "")
      .match(/-?\d+(\.\d+)?/g);
    return n ? parseFloat(n[0]) : 0;
  };

  // derive dropdown options & slider max from data
  const { keys, sectors, wards, relevances, deities, maxFootfall, maxArea } =
    useMemo(() => {
      const uniq = (arr) =>
        Array.from(new Set(arr.filter((x) => x && String(x).trim() !== "")));

      const keys = uniq(structures.map((s) => s.primaryKey)).sort();
      const sectors = uniq(structures.map((s) => s.sector)).sort();
      const wards = uniq(structures.map((s) => s.ward)).sort(
        (a, b) => toNum(a) - toNum(b)
      );
      const relevances = uniq(structures.map((s) => s.relevance)).sort();
      const deities = uniq(structures.map((s) => s.deity)).sort();

      const maxFootfall = Math.max(
        0,
        ...structures.map((s) => toNum(s.footfall))
      );
      const maxArea = Math.max(0, ...structures.map((s) => toNum(s.areaSqFt)));
      return {
        keys,
        sectors,
        wards,
        relevances,
        deities,
        maxFootfall,
        maxArea,
      };
    }, [structures]);

  // initialize sliders when data arrives
  useEffect(() => {
    setMinFootfall(0);
    setMinArea(0);
  }, [maxFootfall, maxArea]);

  // filtering
  useEffect(() => {
    const result = structures.filter((s) => {
      if (pick.primaryKey !== "All" && s.primaryKey !== pick.primaryKey)
        return false;
      if (pick.sector !== "All" && s.sector !== pick.sector) return false;
      if (pick.ward !== "All" && s.ward !== pick.ward) return false;
      if (pick.relevance !== "All" && s.relevance !== pick.relevance)
        return false;
      if (pick.deity !== "All" && s.deity !== pick.deity) return false;
      if (toNum(s.footfall) < minFootfall) return false;
      if (toNum(s.areaSqFt) < minArea) return false;
      return true;
    });
    setFiltered(result);
  }, [structures, pick, minFootfall, minArea]);

  const mapUrl = (lat, lng) =>
    lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  const statusClass = (status) => {
    const v = (status || "").toLowerCase();
    if (v.includes("critical") || v.includes("block"))
      return "status-badge danger";
    if (v.includes("review") || v.includes("important"))
      return "status-badge warn";
    if (v.includes("moderate") || v.includes("pending"))
      return "status-badge info";
    if (v.includes("approved") || v.includes("active"))
      return "status-badge success";
    return "status-badge neutral";
  };

  // update API (status/relevance)
  const handleUpdate = async (id, field, value) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/structures/update-structure/${id}`,
        { [field]: value }
      );
      setStructures((prev) =>
        prev.map((s) => (s._id === id ? { ...s, [field]: data[field] } : s))
      );
      setFiltered((prev) =>
        prev.map((s) => (s._id === id ? { ...s, [field]: data[field] } : s))
      );
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update. Try again.");
    }
  };

  // react-select sizing for filters
  const selectStyles = {
    control: (base) => ({
      ...base,
      height: 38,
      minHeight: 38,
      borderRadius: 8,
      borderColor: "#d7dbe2",
      boxShadow: "none",
    }),
    valueContainer: (base) => ({ ...base, padding: "0 8px" }),
    indicatorsContainer: (base) => ({ ...base, height: 38 }),
    menu: (base) => ({ ...base, zIndex: 5 }),
  };

  // slider helpers
  const goToPhoto = (id, idx) => setCurrentIndex((p) => ({ ...p, [id]: idx }));

  const nextPhoto = (id, length) =>
    setCurrentIndex((p) => ({ ...p, [id]: ((p[id] || 0) + 1) % length }));

  return (
    <div className="page-layout">
      {/* LEFT: Filters + Card list */}
      <div className="deity-container">
        <h1 className="deity-title">Deity Structures</h1>

        {/* Filters */}
        <div className="filters-wrap">
          <div className="filter-row">
            <div className="filter-field">
              <label>Primary Key</label>
              <Select
                value={
                  pick.primaryKey === "All"
                    ? null
                    : { value: pick.primaryKey, label: pick.primaryKey }
                }
                onChange={(opt) =>
                  setPick({ ...pick, primaryKey: opt ? opt.value : "All" })
                }
                options={[
                  { value: "All", label: "All" },
                  ...keys.map((k) => ({ value: k, label: k })),
                ]}
                isSearchable
                placeholder="Select Primary Key"
                className="custom-select"
                styles={selectStyles}
              />
            </div>

            <div className="filter-field">
              <label>Sector</label>
              <Select
                value={
                  pick.sector === "All"
                    ? null
                    : { value: pick.sector, label: pick.sector }
                }
                onChange={(opt) =>
                  setPick({ ...pick, sector: opt ? opt.value : "All" })
                }
                options={[
                  { value: "All", label: "All" },
                  ...sectors.map((k) => ({ value: k, label: k })),
                ]}
                isSearchable
                placeholder="Select Sector"
                className="custom-select"
                styles={selectStyles}
              />
            </div>

            <div className="filter-field">
              <label>Ward</label>
              <Select
                value={
                  pick.ward === "All"
                    ? null
                    : { value: pick.ward, label: pick.ward }
                }
                onChange={(opt) =>
                  setPick({ ...pick, ward: opt ? opt.value : "All" })
                }
                options={[
                  { value: "All", label: "All" },
                  ...wards.map((k) => ({ value: k, label: k })),
                ]}
                isSearchable
                placeholder="Select Ward"
                className="custom-select"
                styles={selectStyles}
              />
            </div>

            <div className="filter-field">
              <label>Relevance</label>
              <Select
                value={
                  pick.relevance === "All"
                    ? null
                    : { value: pick.relevance, label: pick.relevance }
                }
                onChange={(opt) =>
                  setPick({ ...pick, relevance: opt ? opt.value : "All" })
                }
                options={[
                  { value: "All", label: "All" },
                  ...relevances.map((k) => ({ value: k, label: k })),
                ]}
                isSearchable
                placeholder="Select Relevance"
                className="custom-select"
                styles={selectStyles}
              />
            </div>

            <div className="filter-field">
              <label>Deity</label>
              <Select
                value={
                  pick.deity === "All"
                    ? null
                    : { value: pick.deity, label: pick.deity }
                }
                onChange={(opt) =>
                  setPick({ ...pick, deity: opt ? opt.value : "All" })
                }
                options={[
                  { value: "All", label: "All" },
                  ...deities.map((k) => ({ value: k, label: k })),
                ]}
                isSearchable
                placeholder="Select Deity"
                className="custom-select"
                styles={selectStyles}
              />
            </div>
          </div>

          <div className="filter-row sliders">
            <div className="filter-field slider">
              <label>Footfall ≥ {minFootfall}</label>
              <input
                type="range"
                className="input-range"
                min={0}
                max={Math.max(100, Math.ceil(maxFootfall))}
                value={minFootfall}
                onChange={(e) => setMinFootfall(Number(e.target.value))}
              />
            </div>
            <div className="filter-field slider">
              <label>Area (sq.ft) ≥ {minArea}</label>
              <input
                type="range"
                className="input-range"
                min={0}
                max={Math.max(100, Math.ceil(maxArea))}
                value={minArea}
                onChange={(e) => setMinArea(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="card-list">
          {filtered.map((item) => {
            const id = item._id || item.primaryKey;

            // Build a clean array of photo URLs (image can be a string or an array)
            const photosRaw =
              (Array.isArray(item.photos) && item.photos) ||
              (Array.isArray(item.images) && item.images) ||
              (Array.isArray(item.image) && item.image) ||
              (item.image ? [item.image] : []);

            const photos = photosRaw.filter((u) => !!String(u || "").trim());
            const count = Math.max(1, photos.length);
            const idx = Math.min(currentIndex[id] || 0, count - 1);
            const photoSrc = photos[idx] || PLACEHOLDER_IMG;

            const gmaps = mapUrl(item.latitude, item.longitude);

            return (
              <div key={id} className="structure-card-side">
                {item.primaryKey ? (
                  <div className="pk-badge">{item.primaryKey}</div>
                ) : null}

                {/* LEFT INFO (unchanged) */}
                <div className="card-left-info">
                  <div className="title-row">
                    <h2 className="card-title">
                      {item.structureName || "Unnamed Structure"}
                    </h2>
                    {gmaps && (
                      <a
                        className="map-link"
                        href={gmaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on Google Maps"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="22"
                          height="22"
                        >
                          <path
                            d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
                            fill="currentColor"
                          />
                        </svg>
                      </a>
                    )}
                  </div>

                  <div className="meta-vertical">
                    <div>
                      <strong>Deity Name:</strong> {item.deity || "-"}
                    </div>
                    <div>
                      <strong>Sector:</strong> {item.sector || "-"}
                    </div>
                    <div>
                      <strong>Ward No.:</strong> {item.ward || "-"}
                    </div>
                    <div>
                      <strong>Footfall:</strong> {item.footfall || "-"}
                    </div>
                    <div>
                      <strong>Registration:</strong> {item.registration || "-"}
                    </div>
                  </div>

                  {item.remarks && (
                    <div className="remarks-box">{item.remarks}</div>
                  )}
                </div>

                {/* RIGHT: Image + side navigation like your mock */}
                <div className="card-right-img">
                  <div className="image-slider">
                    {/* single <img> + translateY on wrapper for reliability */}
                    <div
                      className="image-wrapper"
                      style={{ transform: `translateX(-${idx * 100}%)` }}
                    >
                      {(photos.length ? photos : [PLACEHOLDER_IMG]).map(
                        (src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={item.structureName || "Structure"}
                            className="structure-image-side"
                            onError={(e) =>
                              (e.currentTarget.src = PLACEHOLDER_IMG)
                            }
                          />
                        )
                      )}
                    </div>

                    {/* Relevance (top-left) */}
                    {role === "mod" ? (
                      <select
                        className="overlay-select top-left"
                        value={item.relevance || ""}
                        onChange={(e) =>
                          handleUpdate(id, "relevance", e.target.value)
                        }
                      >
                        {RELEVANCE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="img-chip top-left">
                        {item.relevance || "Relevance"}
                      </div>
                    )}

                    {/* Status (top-right) */}
                    {role === "mod" ? (
                      <select
                        className="overlay-select top-right"
                        value={item.status || ""}
                        onChange={(e) =>
                          handleUpdate(id, "status", e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className={`img-chip top-right ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status || "Status"}
                      </div>
                    )}

                    {/* Bottom chips */}
                    <div className="img-chip bottom-left">
                      {item.dateOfEstablishment
                        ? `Est: ${item.dateOfEstablishment}`
                        : "Est: N/A"}
                    </div>
                    <div className="img-chip bottom-right">
                      Area: {item.areaSqFt ? item.areaSqFt : "N/A"} sq.ft
                    </div>
                  </div>

                  {/* Vertical nav beside image: dots + round arrow */}
                  <div className="slider-nav">
                    <div className="nav-dots">
                      {(photos.length ? photos : [PLACEHOLDER_IMG]).map(
                        (_, i) => (
                          <button
                            key={i}
                            className={`nav-dot ${i === idx ? "active" : ""}`}
                            aria-label={`Photo ${i + 1}`}
                            onClick={() => goToPhoto(id, i, photos.length || 1)}
                          />
                        )
                      )}
                    </div>

                    <button
                      className="nav-arrow"
                      aria-label="Next photo"
                      title="Next photo"
                      onClick={() => nextPhoto(id, photos.length || 1)}
                    >
                      <span className="chev" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: LLM vertical panel */}
      <div className="llm-panel">
        <h2 className="llm-title">LLM Assistant</h2>
        <textarea
          className="llm-input"
          placeholder="Ask something about these structures…"
          rows={5}
        />
        <button className="llm-btn">Send</button>
      </div>
    </div>
  );
};

export default DeityStructure;
