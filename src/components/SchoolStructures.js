import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import localforage from "localforage";
import "../css/schoolStructures.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSchool } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const PLACEHOLDER_IMG =
  "https://placehold.co/520x300?text=No+Image&font=roboto";

/** Fees bands (labels must match dropdown). */
const FEES_BANDS = [
  { key: "0-200", min: 0, max: 200 },
  { key: "200-500", min: 200, max: 500 },
  { key: "500-1000", min: 500, max: 1000 },
  { key: "1000-1500", min: 1000, max: 1500 },
  { key: "More than 1500", min: 1500, max: Infinity },
];

/** Parse any string like "₹1,200 / month" -> 1200 (number). */
const toNum = (v) => {
  if (v == null) return 0;
  const m = String(v)
    .replace(/,/g, "")
    .match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
};

/** Map a numeric fee to a fees band label. */
const feeBucket = (feeNumber) => {
  for (const b of FEES_BANDS) {
    if (feeNumber >= b.min && feeNumber < b.max) return b.key;
  }
  return "NA";
};

const SchoolStructures = () => {
  const [role, setRole] = useState("viewer");
  const [schools, setSchools] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [currentIndex, setCurrentIndex] = useState({}); // per-card index
  const [filtersOpen, setFiltersOpen] = useState(true);

  // dropdown filters
  const [pick, setPick] = useState({
    sector: "All",
    ward: "All",
    grade: "All",
    medium: "All",
    schoolName: "All",
    feesBand: "All",
  });

  // slider filters (minimum thresholds)
  const [minClassrooms, setMinClassrooms] = useState(0);
  const [minTeachers, setMinTeachers] = useState(0);
  const [minStudents, setMinStudents] = useState(0);

  // role
  useEffect(() => {
    (async () => {
      try {
        const r = await localforage.getItem("role");
        if (typeof r === "string") setRole(r);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const onLoad = () => setFiltersOpen(window.innerWidth >= 900);
    onLoad();
    window.addEventListener("resize", onLoad);
    return () => window.removeEventListener("resize", onLoad);
  }, []);

  // fetch schools
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/schools/get-school`);
        const data = res.data || [];
        setSchools(data);
        setFiltered(data);

        // init slide indices
        const initIdx = {};
        data.forEach((s) => (initIdx[s._id] = 0));
        setCurrentIndex(initIdx);
      } catch (e) {
        console.error("Error fetching schools:", e);
      }
    })();
  }, []);

  // derive dropdown options & slider max
  const {
    sectors,
    wards,
    grades,
    mediums,
    schoolNames,
    maxClassrooms,
    maxTeachers,
    maxStudents,
  } = useMemo(() => {
    const uniq = (arr) =>
      Array.from(new Set(arr.filter((x) => x && String(x).trim() !== "")));

    return {
      sectors: uniq(schools.map((s) => s.sector)).sort(),
      wards: uniq(schools.map((s) => s.ward)).sort(
        (a, b) => toNum(a) - toNum(b)
      ),
      grades: uniq(schools.map((s) => s.grade)).sort(),
      mediums: uniq(schools.map((s) => s.mediumOfInstruction)).sort(),
      schoolNames: uniq(schools.map((s) => s.schoolName)).sort(),
      maxClassrooms: Math.max(0, ...schools.map((s) => toNum(s.classrooms))),
      maxTeachers: Math.max(0, ...schools.map((s) => toNum(s.teachers))),
      maxStudents: Math.max(0, ...schools.map((s) => toNum(s.students))),
    };
  }, [schools]);

  // reset slider maxes on data load
  useEffect(() => {
    setMinClassrooms(0);
    setMinTeachers(0);
    setMinStudents(0);
  }, [maxClassrooms, maxTeachers, maxStudents]);

  // filtering
  useEffect(() => {
    const result = schools.filter((s) => {
      if (pick.sector !== "All" && s.sector !== pick.sector) return false;
      if (pick.ward !== "All" && s.ward !== pick.ward) return false;
      if (pick.grade !== "All" && s.grade !== pick.grade) return false;
      if (pick.medium !== "All" && s.mediumOfInstruction !== pick.medium)
        return false;
      if (pick.schoolName !== "All" && s.schoolName !== pick.schoolName)
        return false;

      // fees band
      if (pick.feesBand !== "All") {
        const fee = toNum(s.averageFees);
        const band = feeBucket(fee);
        if (band !== pick.feesBand) return false;
      }

      if (toNum(s.classrooms) < minClassrooms) return false;
      if (toNum(s.teachers) < minTeachers) return false;
      if (toNum(s.students) < minStudents) return false;
      return true;
    });
    setFiltered(result);
  }, [schools, pick, minClassrooms, minTeachers, minStudents]);

  // slider helpers
  const goToPhoto = (id, idx) => setCurrentIndex((p) => ({ ...p, [id]: idx }));

  const nextPhoto = (id, length) =>
    setCurrentIndex((p) => ({ ...p, [id]: ((p[id] || 0) + 1) % length }));

  // summary counts (for filtered set)
  const summary = useMemo(() => {
    const tot = filtered.length;
    const students = filtered.reduce((a, s) => a + toNum(s.students), 0);
    const teachers = filtered.reduce((a, s) => a + toNum(s.teachers), 0);
    const rooms = filtered.reduce((a, s) => a + toNum(s.classrooms), 0);
    return { tot, students, teachers, rooms };
  }, [filtered]);

  // react-select sizing
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

  // reset filters
  const resetFilters = () => {
    setPick({
      sector: "All",
      ward: "All",
      grade: "All",
      medium: "All",
      schoolName: "All",
      feesBand: "All",
    });
    setMinClassrooms(0);
    setMinTeachers(0);
    setMinStudents(0);
  };

  return (
    <div className="school-page-layout">
      <div className="school-container">
        <h1 className="school-title">School Structures</h1>

        <div className="school-filters-shell">
          <button
            className="school-filter-toggle"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>

          <div
            className={`school-filters-wrap ${filtersOpen ? "open" : "closed"}`}
          >
            <div className="school-filters-row">
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
                  styles={selectStyles}
                />
              </div>

              <div className="filter-field">
                <label>School Name</label>
                <Select
                  value={
                    pick.schoolName === "All"
                      ? null
                      : { value: pick.schoolName, label: pick.schoolName }
                  }
                  onChange={(opt) =>
                    setPick({ ...pick, schoolName: opt ? opt.value : "All" })
                  }
                  options={[
                    { value: "All", label: "All" },
                    ...schoolNames.map((k) => ({ value: k, label: k })),
                  ]}
                  styles={selectStyles}
                />
              </div>

              <div className="filter-field">
                <label>Grade</label>
                <Select
                  value={
                    pick.grade === "All"
                      ? null
                      : { value: pick.grade, label: pick.grade }
                  }
                  onChange={(opt) =>
                    setPick({ ...pick, grade: opt ? opt.value : "All" })
                  }
                  options={[
                    { value: "All", label: "All" },
                    ...grades.map((k) => ({ value: k, label: k })),
                  ]}
                  styles={selectStyles}
                />
              </div>

              <div className="filter-field">
                <label>Medium</label>
                <Select
                  value={
                    pick.medium === "All"
                      ? null
                      : { value: pick.medium, label: pick.medium }
                  }
                  onChange={(opt) =>
                    setPick({ ...pick, medium: opt ? opt.value : "All" })
                  }
                  options={[
                    { value: "All", label: "All" },
                    ...mediums.map((k) => ({ value: k, label: k })),
                  ]}
                  styles={selectStyles}
                />
              </div>

              <div className="filter-field">
                <label>Average Fees</label>
                <Select
                  value={
                    pick.feesBand === "All"
                      ? null
                      : { value: pick.feesBand, label: pick.feesBand }
                  }
                  onChange={(opt) =>
                    setPick({ ...pick, feesBand: opt ? opt.value : "All" })
                  }
                  options={[
                    { value: "All", label: "All" },
                    ...FEES_BANDS.map((b) => ({ value: b.key, label: b.key })),
                  ]}
                  styles={selectStyles}
                />
              </div>
            </div>

            <div className="school-filters-row sliders">
              <div className="filter-field slider">
                <label>Classrooms ≥ {minClassrooms}</label>
                <input
                  type="range"
                  className="input-range"
                  min={0}
                  max={Math.max(100, Math.ceil(maxClassrooms))}
                  value={minClassrooms}
                  onChange={(e) => setMinClassrooms(Number(e.target.value))}
                />
              </div>

              <div className="filter-field slider">
                <label>Teachers ≥ {minTeachers}</label>
                <input
                  type="range"
                  className="input-range"
                  min={0}
                  max={Math.max(100, Math.ceil(maxTeachers))}
                  value={minTeachers}
                  onChange={(e) => setMinTeachers(Number(e.target.value))}
                />
              </div>

              <div className="filter-field slider">
                <label>Students ≥ {minStudents}</label>
                <input
                  type="range"
                  className="input-range"
                  min={0}
                  max={Math.max(100, Math.ceil(maxStudents))}
                  value={minStudents}
                  onChange={(e) => setMinStudents(Number(e.target.value))}
                />
              </div>

              <button className="school-reset-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>

            {/* Summary counts */}
            <div className="school-summary">
              <div className="chip">
                Schools: <strong>{summary.tot}</strong>
              </div>
              <div className="chip">
                Students: <strong>{summary.students}</strong>
              </div>
              <div className="chip">
                Teachers: <strong>{summary.teachers}</strong>
              </div>
              <div className="chip">
                Classrooms: <strong>{summary.rooms}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="school-card-list">
          {filtered.map((s) => {
            // images (string OR array), use the widest key set
            const photosRaw =
              (Array.isArray(s.image) && s.image) ||
              (Array.isArray(s.images) && s.images) ||
              (Array.isArray(s.photos) && s.photos) ||
              (s.image ? [s.image] : []);
            const photos = photosRaw.filter((u) => !!String(u || "").trim());
            const count = Math.max(1, photos.length);
            const idx = Math.min(currentIndex[s._id] || 0, count - 1);

            return (
              <div key={s._id} className="school-card-side">
                {/* LEFT INFO */}
                <div className="card-left-info">
                  <h2 className="card-title">
                    <FontAwesomeIcon
                      icon={faSchool}
                      className="school-title-icon"
                    />
                    {s.schoolName || "Unnamed School"}
                  </h2>

                  <div className="meta-vertical">
                    <div>
                      <strong>Medium:</strong> {s.mediumOfInstruction || "-"}
                    </div>
                    <div>
                      <strong>Grade:</strong> {s.grade || "-"}
                    </div>
                    <div>
                      <strong>Sector:</strong> {s.sector || "-"}
                    </div>
                    <div>
                      <strong>Ward:</strong> {s.ward || "-"}
                    </div>
                    <div>
                      <strong>Average Fees:</strong> {s.averageFees || "-"}
                    </div>
                    <div>
                      <strong>Teachers:</strong> {s.teachers ?? "-"}
                    </div>
                    <div>
                      <strong>Principal:</strong> {s.principal || "-"}
                    </div>
                  </div>

                  {/* Address box (like remarks in Deity) */}
                  {s.address && (
                    <div className="school-remarks-box">
                      Address - {s.address}
                    </div>
                  )}
                </div>

                {/* RIGHT: Image + side nav */}
                <div className="school-card-right-img">
                  <div className="school-image-slider">
                    <div
                      className="school-image-wrapper"
                      style={{ transform: `translateX(-${idx * 100}%)` }}
                    >
                      {(photos.length ? photos : [PLACEHOLDER_IMG]).map(
                        (src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={s.schoolName || "School"}
                            className="school-structure-image"
                            onError={(e) =>
                              (e.currentTarget.src = PLACEHOLDER_IMG)
                            }
                          />
                        )
                      )}
                    </div>

                    {/* Optional chips on image */}
                    <div className="school-img-chip bottom-left">
                      Students: {s.students ?? "N/A"}
                    </div>
                    <div className="school-img-chip bottom-right">
                      Classrooms: {s.classrooms ?? "N/A"}
                    </div>
                  </div>

                  {/* Vertical dots + arrow */}
                  <div className="school-slider-nav">
                    <div className="school-nav-dots">
                      {(photos.length ? photos : [PLACEHOLDER_IMG]).map(
                        (_, i) => (
                          <button
                            key={i}
                            className={`school-nav-dot ${
                              i === idx ? "active" : ""
                            }`}
                            aria-label={`Photo ${i + 1}`}
                            onClick={() => goToPhoto(s._id, i)}
                          />
                        )
                      )}
                    </div>

                    <button
                      className="school-nav-arrow"
                      aria-label="Next photo"
                      title="Next photo"
                      onClick={() => nextPhoto(s._id, photos.length || 1)}
                    >
                      <span className="school-chev" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SchoolStructures;
