import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AWS from "aws-sdk";

const S3_BUCKET = "drp-project";
const REGION = process.env.REACT_APP_AWS_REGION;
const ACCESS_KEY = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;

AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: REGION,
});
const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const UpdateSchool = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    sector: "",
    ward: "",
    board: "",
    mediumOfInstruction: "",
    grade: "",
    averageFees: "",
    students: "",
    teachers: "",
    classrooms: "",
    studentClassroomRatio: "",
    studentTeacherRatio: "",
    principal: "",
    image: [], // array of URLs
  });

  const [newImages, setNewImages] = useState([]);

  // fetch school data
  useEffect(() => {
    const fetchSchool = async () => {
      try {
        // You could also add a /schools/:id GET endpoint;
        // here we reuse the list for simplicity and pick the one we need.
        const res = await axios.get(`${API_URL}/schools/get-school`);
        const school = (res.data || []).find((s) => s._id === id);
        if (school) setFormData(school);
      } catch (err) {
        console.error("Error fetching school:", err);
      }
    };
    fetchSchool();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files || []));
  };

  const uploadImagesToS3 = async () => {
    const urls = [];
    for (const file of newImages) {
      const params = {
        Bucket: S3_BUCKET,
        Key: `dharavi-one/schools/${Date.now()}_${file.name}`,
        Body: file,
        ContentType: file.type,
      };
      const uploadRes = await s3.upload(params).promise();
      urls.push(uploadRes.Location);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = formData.image || [];
      if (newImages.length > 0) {
        const uploaded = await uploadImagesToS3();
        imageUrls = [...imageUrls, ...uploaded];
      }

      const updatedData = { ...formData, image: imageUrls };

      // PUT /schools/:id (as in the School routes we created earlier)
      await axios.put(`${API_URL}/schools/update-school/${id}`, updatedData);

      alert("School updated successfully");
      navigate("/schools-table");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed!");
    }
  };

  return (
    <div style={{ padding: "20px" }} className="update-container">
      <h2>Update School</h2>

      <form onSubmit={handleSubmit}>
        <label>School Name:</label>
        <input
          type="text"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          required
        />
        <br />

        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        <br />

        <label>Sector:</label>
        <input
          type="text"
          name="sector"
          value={formData.sector}
          onChange={handleChange}
        />
        <br />

        <label>Ward:</label>
        <input
          type="text"
          name="ward"
          value={formData.ward}
          onChange={handleChange}
        />
        <br />

        <label>Board:</label>
        <input
          type="text"
          name="board"
          value={formData.board}
          onChange={handleChange}
        />
        <br />

        <label>Medium of Instruction:</label>
        <input
          type="text"
          name="mediumOfInstruction"
          value={formData.mediumOfInstruction}
          onChange={handleChange}
        />
        <br />

        <label>Grade:</label>
        <input
          type="text"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
        />
        <br />

        <label>Average Fees:</label>
        <input
          type="text"
          name="averageFees"
          value={formData.averageFees}
          onChange={handleChange}
        />
        <br />

        <label>Students:</label>
        <input
          type="text"
          name="students"
          value={formData.students}
          onChange={handleChange}
        />
        <br />

        <label>Teachers:</label>
        <input
          type="text"
          name="teachers"
          value={formData.teachers}
          onChange={handleChange}
        />
        <br />

        <label>Classrooms:</label>
        <input
          type="text"
          name="classrooms"
          value={formData.classrooms}
          onChange={handleChange}
        />
        <br />

        <label>Student : Classroom Ratio:</label>
        <input
          type="text"
          name="studentClassroomRatio"
          value={formData.studentClassroomRatio}
          onChange={handleChange}
          placeholder="e.g. 40:1"
        />
        <br />

        <label>Student : Teacher Ratio:</label>
        <input
          type="text"
          name="studentTeacherRatio"
          value={formData.studentTeacherRatio}
          onChange={handleChange}
          placeholder="e.g. 25:1"
        />
        <br />

        <label>Principal:</label>
        <input
          type="text"
          name="principal"
          value={formData.principal}
          onChange={handleChange}
        />
        <br />

        <label>Upload Images:</label>
        <input type="file" multiple onChange={handleImageChange} />
        <br />

        {!!formData.image?.length && (
          <div style={{ marginTop: 10 }}>
            <h4>Existing Images</h4>
            {formData.image.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="school"
                width="100"
                style={{ marginRight: 10, marginBottom: 10, objectFit: "cover" }}
              />
            ))} 
          </div>
        )}

        <button type="submit" style={{ marginTop: 12 }}>
          Update
        </button>
      </form>
    </div>
  );
};

export default UpdateSchool;
