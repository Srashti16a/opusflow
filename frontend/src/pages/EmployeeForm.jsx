import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getBackendURL } from "../services/api";
import FormInput from "../components/FormBuilder/FormInput";
import FormSelect from "../components/FormBuilder/FormSelect";
import Navbar from "../components/Navbar";

function EmployeeForm() {
  const { id } = useParams(); // If present, we are in EDIT mode
  const isEdit = !!id;

  const navigate = useNavigate();

  // Form states
  const [form, setForm] = useState({
    userId: "",
    departmentId: "",
    phone: "",
    address: "",
    designation: "",
    salary: "",
    skills: [], // Array of skill IDs (integers)
    imageUrls: [] // Array of uploaded image URL strings
  });

  // Dropdown options
  const [usersList, setUsersList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Dropdowns in parallel
        const [usersRes, deptsRes, skillsRes] = await Promise.all([
          api.get("/user/list"),
          api.get("/departments"),
          api.get("/skills")
        ]);

        setUsersList(usersRes.data);
        setDepartmentsList(deptsRes.data);
        setSkillsList(skillsRes.data);

        // If in Edit Mode, fetch current employee profile details
        if (isEdit) {
          const empRes = await api.get(`/employees/${id}`);
          const empData = empRes.data;
          
          setForm({
            userId: empData.userId || "",
            departmentId: empData.departmentId || "",
            phone: empData.phone || "",
            address: empData.address || "",
            designation: empData.designation || "",
            salary: empData.salary || "",
            skills: empData.employeeSkills.map(es => es.skillId),
            imageUrls: empData.images.map(img => img.imageUrl)
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load form dependencies");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Skill Checkbox Handler
  const handleSkillChange = (skillId) => {
    const intId = parseInt(skillId);
    let updatedSkills = [...form.skills];
    if (updatedSkills.includes(intId)) {
      updatedSkills = updatedSkills.filter(id => id !== intId);
    } else {
      updatedSkills.push(intId);
    }
    setForm({ ...form, skills: updatedSkills });
  };

  // Multiple File Selection & Auto-Upload Handler
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit check
    if (form.imageUrls.length + files.length > 5) {
      setError("Maximum upload limit of 5 images exceeded!");
      return;
    }

    setError(null);
    setUploading(true);

    const formData = new FormData();
    files.forEach(file => {
      formData.append("images", file);
    });

    try {
      // Need a separate axios config for multipart form data
      const res = await api.post("/employees/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      setForm(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...res.data.imageUrls]
      }));
      setSuccess("Images uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      // Reset input element
      e.target.value = "";
    }
  };

  // Remove uploaded image preview
  const handleRemoveImage = (indexToRemove) => {
    setForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccess(null);

    // Form payload
    const payload = {
      ...form,
      userId: form.userId ? parseInt(form.userId) : null,
      departmentId: form.departmentId ? parseInt(form.departmentId) : null,
      salary: form.salary ? parseFloat(form.salary) : null
    };

    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, payload);
        setSuccess("Employee profile updated successfully!");
      } else {
        await api.post("/employees", payload);
        setSuccess("Employee profile created successfully!");
        // Clear form
        setForm({
          userId: "",
          departmentId: "",
          phone: "",
          address: "",
          designation: "",
          salary: "",
          skills: [],
          imageUrls: []
        });
      }
      
      // Redirect to list page after a brief delay
      setTimeout(() => {
        navigate("/employees");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit employee form");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ textAlign: "left", maxWidth: "800px", margin: "0 auto" }}>
          <h2>{isEdit ? "Edit Employee Profile" : "Register Employee Profile"}</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {isEdit ? "Update profile information, department, skills, and image documentation." : "Create a new employee profile records and link it to a system user."}
          </p>

          {loading ? (
            <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "4rem" }}>
              Loading form configuration and dependencies...
            </div>
          ) : (
            <div className="glass-card" style={{ maxWidth: "100%", padding: "2.5rem", boxSizing: "border-box" }}>
              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Left Column */}
                  <div>
                    {/* User Link Dropdown */}
                    <FormSelect
                      label="Link to User Account"
                      name="userId"
                      value={form.userId}
                      onChange={handleChange}
                      placeholder="-- Select Registered User --"
                      options={usersList.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
                      required
                    />

                    {/* Department Dropdown */}
                    <FormSelect
                      label="Department"
                      name="departmentId"
                      value={form.departmentId}
                      onChange={handleChange}
                      placeholder="-- Select Department --"
                      options={departmentsList.map(d => ({ value: d.id, label: d.department_name }))}
                      required
                    />

                    {/* Designation */}
                    <FormInput
                      label="Designation"
                      name="designation"
                      placeholder="e.g. Senior Software Engineer"
                      value={form.designation}
                      onChange={handleChange}
                      required
                    />

                    {/* Salary */}
                    <FormInput
                      label="Monthly Salary (INR)"
                      name="salary"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 75000"
                      value={form.salary}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Right Column */}
                  <div>
                    {/* Phone Number */}
                    <FormInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />

                    {/* Physical Address */}
                    <FormInput
                      label="Residential Address"
                      name="address"
                      type="textarea"
                      placeholder="Street, City, Pin State"
                      value={form.address}
                      onChange={handleChange}
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <hr style={{ border: "0", borderTop: "1px solid var(--border-glass)", margin: "1.5rem 0" }} />

                {/* Skills Multi Select Checklist */}
                <div className="form-group">
                  <label className="form-label">Professional Skills Assignation</label>
                  <div className="skills-selector-wrapper">
                    <div className="skills-checkbox-grid">
                      {skillsList.map(s => (
                        <label key={s.id} className="skill-checkbox-label">
                          <input
                            type="checkbox"
                            checked={form.skills.includes(s.id)}
                            onChange={() => handleSkillChange(s.id)}
                          />
                          {s.skill_name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <hr style={{ border: "0", borderTop: "1px solid var(--border-glass)", margin: "1.5rem 0" }} />

                {/* Document/Images Multi Uploader */}
                <div className="form-group">
                  <label className="form-label">Uploaded Image Materials (Max 5 Images: Profile, Aadhar, Resume, Certificate)</label>
                  <div className="upload-zone" onClick={() => document.getElementById("file-input").click()}>
                    <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.25rem" }}>📁</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {uploading ? "Uploading files, please wait..." : "Click to select image files to upload"}
                    </span>
                    <input
                      type="file"
                      id="file-input"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </div>

                  {/* Thumbnail previews */}
                  {form.imageUrls.length > 0 && (
                    <div className="image-previews-container">
                      {form.imageUrls.map((url, idx) => (
                        <div key={idx} className="image-preview-wrapper">
                          <img src={`${getBackendURL()}${url}`} alt={`Upload preview ${idx}`} />
                          <button
                            type="button"
                            className="btn-remove-preview"
                            onClick={() => handleRemoveImage(idx)}
                            title="Delete Image"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons Row */}
                <div className="action-row">
                  <button className="btn-primary" type="submit" style={{ margin: "0" }} disabled={submitLoading || uploading}>
                    {submitLoading ? "Submitting..." : isEdit ? "Update Profile" : "Register Employee"}
                  </button>
                  <Link to="/employees" className="btn-secondary">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default EmployeeForm;
