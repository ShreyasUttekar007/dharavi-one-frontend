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

const UpdateStructure = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    primaryKey: "",
    sector: "",
    structureName: "",
    ward: "",
    deity: "",
    areaSqFt: "",
    footfall: "",
    dateOfEstablishment: "",
    image: [],
  });
  const [newImages, setNewImages] = useState([]);

  // fetch structure data
  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const res = await axios.get(`${API_URL}/structures/get-structure`);
        const structure = res.data.find((s) => s._id === id);
        if (structure) setFormData(structure);
      } catch (err) {
        console.error("Error fetching structure:", err);
      }
    };
    fetchStructure();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const uploadImagesToS3 = async () => {
    const urls = [];
    for (const file of newImages) {
      const params = {
        Bucket: S3_BUCKET,
        Key: `dharavi-one/${Date.now()}_${file.name}`,
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

      await axios.put(
        `${API_URL}/structures/update-structure/${id}`,
        updatedData
      );

      alert("Structure updated successfully");
      navigate("/structure-data");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed!");
    }
  };

  return (
    <div style={{ padding: "20px" }} className="update-container">
      <h2>Update Structure</h2>
      <form onSubmit={handleSubmit}>
        <label>Primary Key:</label>
        <input
          type="text"
          name="primaryKey"
          value={formData.primaryKey}
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

        <label>Structure Name:</label>
        <input
          type="text"
          name="structureName"
          value={formData.structureName}
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

        <label>Deity:</label>
        <input
          type="text"
          name="deity"
          value={formData.deity}
          onChange={handleChange}
        />
        <br />

        <label>Area (sq.ft):</label>
        <input
          type="number"
          name="areaSqFt"
          value={formData.areaSqFt}
          onChange={handleChange}
        />
        <br />

        <label>Footfall:</label>
        <input
          type="number"
          name="footfall"
          value={formData.footfall}
          onChange={handleChange}
        />
        <br />

        <label>Date of Establishment:</label>
        <input
          type="text"
          name="dateOfEstablishment"
          value={formData.dateOfEstablishment}
          onChange={handleChange}
        />
        <br />

        <label>Remarks:</label>
        <textarea
          name="remarks"
          value={formData.remarks || ""}
          onChange={handleChange}
          rows={4}
          style={{ width: "100%", resize: "vertical" }}
        />
        <br />

        <label>Upload Images:</label>
        <input type="file" multiple onChange={handleImageChange} />
        <br />

        <div>
          <h4>Existing Images</h4>
          {formData.image?.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt="structure"
              width="100"
              style={{ marginRight: "10px" }}
            />
          ))}
        </div>

        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default UpdateStructure;
