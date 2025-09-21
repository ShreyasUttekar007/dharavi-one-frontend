import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../css/structureSnapshots.css"; // theme styles below

const API_URL = process.env.REACT_APP_API_URL; // e.g. http://localhost:5000/api

const PLACEHOLDERS = {
  status: "NA",
  relevance: "NA",
  deity: "Unknown",
};

const STATUS_PREFERRED_ORDER = ["Consolidate", "Regularize", "Relocate", "Demolish", "No Data", "Approved", "Pending", "Under Review", "Blocked", "NA"];
const RELEVANCE_PREFERRED_ORDER = ["High", "Moderate", "Low", "NA"];

const StructureSnapshots = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/structures/get-structure`);
        if (!mounted) return;
        setData(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr("Failed to load structures.");
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // ---------- helpers ----------
  const norm = (v, key) => {
    const s = (v ?? "").toString().trim();
    return s === "" ? PLACEHOLDERS[key] : s;
  };

  const uniqueOrdered = (arr, preferred = []) => {
    const set = new Set(arr);
    // pull preferred in order if present; then the rest alphabetically
    const rest = [...set].filter((x) => !preferred.includes(x)).sort((a, b) => a.localeCompare(b));
    const pref = preferred.filter((x) => set.has(x));
    return [...pref, ...rest];
    };

  const countBy = (items, field, placeholderKey) => {
    const map = new Map();
    for (const it of items) {
      const val = norm(it[field], placeholderKey);
      map.set(val, (map.get(val) || 0) + 1);
    }
    return map; // Map<string, number>
  };

  const pivot = (items, rowField, colField) => {
    const rows = items.map((it) => norm(it[rowField], rowField));
    const cols = items.map((it) => norm(it[colField], colField));
    const uniqRows =
      rowField === "deity"
        ? uniqueOrdered(rows)
        : uniqueOrdered(rows, STATUS_PREFERRED_ORDER);
    const uniqCols =
      colField === "relevance"
        ? uniqueOrdered(cols, RELEVANCE_PREFERRED_ORDER)
        : uniqueOrdered(cols, STATUS_PREFERRED_ORDER);

    // build zero matrix
    const matrix = {};
    uniqRows.forEach((r) => {
      matrix[r] = {};
      uniqCols.forEach((c) => (matrix[r][c] = 0));
    });

    // fill
    for (const it of items) {
      const r = norm(it[rowField], rowField);
      const c = norm(it[colField], colField);
      if (!matrix[r]) matrix[r] = {};
      if (matrix[r][c] == null) matrix[r][c] = 0;
      matrix[r][c] += 1;
    }

    // row totals / col totals / grand total
    const rowTotals = {};
    uniqRows.forEach((r) => {
      rowTotals[r] = uniqCols.reduce((acc, c) => acc + (matrix[r][c] || 0), 0);
    });
    const colTotals = {};
    uniqCols.forEach((c) => {
      colTotals[c] = uniqRows.reduce((acc, r) => acc + (matrix[r][c] || 0), 0);
    });
    const grand = Object.values(rowTotals).reduce((a, b) => a + b, 0);

    return { rows: uniqRows, cols: uniqCols, matrix, rowTotals, colTotals, grand };
  };

  const deityByStatus = useMemo(() => pivot(data, "deity", "status"), [data]);
  const statusTotals = useMemo(() => countBy(data, "status", "status"), [data]);
  const statusByRelevance = useMemo(
    () => pivot(data, "status", "relevance"),
    [data]
  );
  const relevanceTotals = useMemo(
    () => countBy(data, "relevance", "relevance"),
    [data]
  );

  const sortedStatusTotals = useMemo(() => {
    const entries = Array.from(statusTotals.entries());
    const order = uniqueOrdered(entries.map(([k]) => k), STATUS_PREFERRED_ORDER);
    return order.map((k) => [k, statusTotals.get(k) || 0]);
  }, [statusTotals]);

  const sortedRelevanceTotals = useMemo(() => {
    const entries = Array.from(relevanceTotals.entries());
    const order = uniqueOrdered(entries.map(([k]) => k), RELEVANCE_PREFERRED_ORDER);
    return order.map((k) => [k, relevanceTotals.get(k) || 0]);
  }, [relevanceTotals]);

  if (loading) {
    return (
      <div className="snap-wrap">
        <div className="snap-loading">Loading summaries…</div>
      </div>
    );
  }
  if (err) {
    return (
      <div className="snap-wrap">
        <div className="snap-error">{err}</div>
      </div>
    );
  }

  return (
    <div className="snap-wrap">
      <h1 className="snap-title">Religious Structure Snapshots</h1>

      <div className="snap-grid">
        {/* 1) Deity × Status */}
        <div className="snap-card">
          <div className="snap-card-head">
            <h2>Deity × Status</h2>
            <span className="pill">Total: {deityByStatus.grand}</span>
          </div>
          <div className="table-scroll">
            <table className="nb-table">
              <thead>
                <tr>
                  <th className="left">Deity</th>
                  {deityByStatus.cols.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                  <th>Row Total</th>
                </tr>
              </thead>
              <tbody>
                {deityByStatus.rows.map((r) => (
                  <tr key={r}>
                    <td className="left">{r}</td>
                    {deityByStatus.cols.map((c) => (
                      <td key={c + r}>
                        {deityByStatus.matrix[r][c] ? deityByStatus.matrix[r][c] : ""}
                      </td>
                    ))}
                    <td className="strong">{deityByStatus.rowTotals[r]}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="left strong">Column Total</td>
                  {deityByStatus.cols.map((c) => (
                    <td key={c} className="strong">
                      {deityByStatus.colTotals[c]}
                    </td>
                  ))}
                  <td className="strong">{deityByStatus.grand}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 2) Status totals */}
        <div className="snap-card">
          <div className="snap-card-head">
            <h2>Status Totals</h2>
            <span className="pill">Grand: {data.length}</span>
          </div>
          <div className="table-scroll">
            <table className="nb-table compact">
              <thead>
                <tr>
                  <th className="left">Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {sortedStatusTotals.map(([k, v]) => (
                  <tr key={k}>
                    <td className="left">{k}</td>
                    <td className="strong">{v}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="left strong">Grand Total</td>
                  <td className="strong">{data.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 3) Status × Relevance */}
        <div className="snap-card">
          <div className="snap-card-head">
            <h2>Status × Relevance</h2>
            <span className="pill">Total: {statusByRelevance.grand}</span>
          </div>
          <div className="table-scroll">
            <table className="nb-table">
              <thead>
                <tr>
                  <th className="left">Suggested Action (Status)</th>
                  {statusByRelevance.cols.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                  <th>Row Total</th>
                </tr>
              </thead>
              <tbody>
                {statusByRelevance.rows.map((r) => (
                  <tr key={r}>
                    <td className="left">{r}</td>
                    {statusByRelevance.cols.map((c) => (
                      <td key={c + r}>
                        {statusByRelevance.matrix[r][c] ? statusByRelevance.matrix[r][c] : ""}
                      </td>
                    ))}
                    <td className="strong">{statusByRelevance.rowTotals[r]}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="left strong">Column Total</td>
                  {statusByRelevance.cols.map((c) => (
                    <td key={c} className="strong">
                      {statusByRelevance.colTotals[c]}
                    </td>
                  ))}
                  <td className="strong">{statusByRelevance.grand}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 4) Relevance totals */}
        <div className="snap-card">
          <div className="snap-card-head">
            <h2>Relevance Totals</h2>
            <span className="pill">Grand: {data.length}</span>
          </div>
          <div className="table-scroll">
            <table className="nb-table compact">
              <thead>
                <tr>
                  <th className="left">Relevance</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {sortedRelevanceTotals.map(([k, v]) => (
                  <tr key={k}>
                    <td className="left">{k}</td>
                    <td className="strong">{v}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="left strong">Grand Total</td>
                  <td className="strong">{data.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructureSnapshots;
