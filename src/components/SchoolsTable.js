import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const SchoolsTable = () => {
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // GET /schools (from the School routes we set up)
        const res = await axios.get(`${API_URL}/schools/get-school`);
        setSchools(res.data || []);
      } catch (err) {
        console.error("Error fetching schools:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }} className="table-container">
      <h2>Schools Table</h2>
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>School Name</th>
            <th>Address</th>
            <th>Sector</th>
            <th>Ward</th>
            <th>Board</th>
            <th>Medium</th>
            <th>Grade</th>
            <th>Avg. Fees</th>
            <th>Students</th>
            <th>Teachers</th>
            <th>Classrooms</th>
            <th>Principal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((s) => (
            <tr key={s._id}>
              <td>{s.schoolName}</td>
              <td>{s.address}</td>
              <td>{s.sector}</td>
              <td>{s.ward}</td>
              <td>{s.board}</td>
              <td>{s.mediumOfInstruction}</td>
              <td>{s.grade}</td>
              <td>{s.averageFees}</td>
              <td>{s.students}</td>
              <td>{s.teachers}</td>
              <td>{s.classrooms}</td>
              <td>{s.principal}</td>
              <td>
                <button onClick={() => navigate(`/schools/update/${s._id}`)}>
                  Update
                </button>
              </td>
            </tr>
          ))}
          {!schools.length && (
            <tr>
              <td colSpan="13" style={{ textAlign: "center" }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SchoolsTable;
