import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const StructuresTable = () => {
  const [structures, setStructures] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/structures/get-structure`);
        setStructures(res.data);
      } catch (err) {
        console.error("Error fetching structures:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }} className="table-container">
      <h2>Structures Table</h2>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {structures.map((s) => (
            <tr key={s._id}>
              <td>{s.primaryKey}</td>
              <td>{s.sector}</td>
              <td>{s.structureName}</td>
              <td>{s.ward}</td>
              <td>{s.deity}</td>
              <td>{s.areaSqFt}</td>
              <td>{s.footfall}</td>
              <td>{s.dateOfEstablishment}</td>
              <td>
                <button onClick={() => navigate(`/update/${s._id}`)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StructuresTable;
