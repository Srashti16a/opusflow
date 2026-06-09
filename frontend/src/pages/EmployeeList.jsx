import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../services/api";
import FormTable from "../components/FormBuilder/FormTable";
import FormInput from "../components/FormBuilder/FormInput";
import FormSelect from "../components/FormBuilder/FormSelect";

function EmployeeList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshToken } = useSelector((state) => state.auth);
  
  // List data state
  const [employees, setEmployees] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search, Pagination, Sorting, Filtering states
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartmentsList(res.data);
    } catch (err) {
      console.error("Failed to load departments list:", err);
    }
  };

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder
      };
      
      if (search.trim()) params.search = search;
      if (departmentId) params.departmentId = departmentId;

      const res = await api.get("/employees", { params });
      setEmployees(res.data.employees);
      setTotalItems(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to retrieve employee records");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortOrder, search, departmentId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the employee profile for "${name}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const res = await api.delete(`/employees/${id}`);
      setSuccess(res.data.message);
      fetchEmployees();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete employee profile");
    }
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1); // Reset page to 1 on sort change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(logout());
      navigate("/");
    }
  };

  // Define Table Columns
  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true
    },
    {
      key: "images",
      label: "Images",
      render: (row) => (
        row.images && row.images.length > 0 ? (
          <div className="employee-images-list">
            {row.images.map((img, i) => (
              <img
                key={i}
                className="employee-thumbnail"
                src={`http://localhost:5000${img.imageUrl}`}
                alt={`Document ${i}`}
                title={`Uploaded Document ${i + 1}`}
              />
            ))}
          </div>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No images</span>
        )
      )
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row) => (
        <div>
          <strong>{row.user?.name || "Unlinked User"}</strong>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{row.user?.email || "N/A"}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Phone: {row.phone || "N/A"}</div>
        </div>
      )
    },
    {
      key: "department_name",
      label: "Department",
      sortable: true,
      render: (row) => (
        row.department ? (
          <span className="badge badge-manager" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)" }}>
            {row.department.department_name}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>None</span>
        )
      )
    },
    {
      key: "designation",
      label: "Designation",
      sortable: true
    },
    {
      key: "salary",
      label: "Salary",
      sortable: true,
      render: (row) => (
        <strong>
          {row.salary ? `₹${parseFloat(row.salary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "N/A"}
        </strong>
      )
    },
    {
      key: "skills",
      label: "Skills",
      render: (row) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
          {row.employeeSkills && row.employeeSkills.length > 0 ? (
            row.employeeSkills.map((es, idx) => (
              <span key={idx} className="badge badge-skill">
                {es.skill?.skill_name}
              </span>
            ))
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No skills</span>
          )}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            to={`/employees/edit/${row.id}`}
            className="btn-secondary"
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
          >
            Edit
          </Link>
          {user?.role === "admin" && (
            <button
              className="btn-danger"
              style={{ margin: "0", padding: "0.35rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
              onClick={() => handleDelete(row.id, row.user?.name || "unlinked employee")}
            >
              Delete
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">i-SOFTZONE Technologies</div>
        <div className="navbar-user">
          <Link to="/dashboard" style={{ color: "var(--text-secondary)", fontWeight: "600", textDecoration: "none", fontSize: "0.95rem" }}>
            Dashboard
          </Link>
          {user && (
            <span className={`badge badge-${user.role}`} style={{ marginLeft: "1rem" }}>
              {user.role}
            </span>
          )}
          <button className="btn-logout" onClick={handleLogout} style={{ marginLeft: "1rem" }}>
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h2>Employee Profiles</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Directory of registered employees and their assigned departments/skills.
              </p>
            </div>
            <Link to="/employees/create" className="btn-primary" style={{ width: "auto", margin: "0" }}>
              + Register Employee
            </Link>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Filters Row */}
          <div className="glass-card" style={{ maxWidth: "100%", padding: "1.25rem 2rem", marginBottom: "1.5rem" }}>
            <div className="responsive-filter-grid">
              <FormInput
                label="Global Search"
                name="search"
                placeholder="Search name, email, skills, designation..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ marginBottom: 0 }}
              />

              <FormSelect
                label="Filter by Department"
                name="departmentId"
                value={departmentId}
                onChange={(e) => { setDepartmentId(e.target.value); setCurrentPage(1); }}
                placeholder="All Departments"
                options={departmentsList.map(d => ({ value: d.id, label: d.department_name }))}
                style={{ marginBottom: 0 }}
              />

              <FormSelect
                label="Page Size"
                name="pageSize"
                value={pageSize.toString()}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                options={[
                  { value: "5", label: "5 per page" },
                  { value: "10", label: "10 per page" },
                  { value: "25", label: "25 per page" }
                ]}
                style={{ marginBottom: 0 }}
              />

              <button
                className="btn-secondary"
                style={{ margin: 0, padding: "0.55rem", fontSize: "0.9rem", width: "100%" }}
                onClick={() => { setSearch(""); setDepartmentId(""); setCurrentPage(1); }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Form Table Component */}
          <FormTable
            columns={columns}
            data={employees}
            loading={loading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            emptyMessage="No employee records found. Register your first employee profile."
          />
        </div>
      </main>
    </div>
  );
}

export default EmployeeList;
