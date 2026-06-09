import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../services/api";
import FormSelect from "../components/FormBuilder/FormSelect";
import FormTable from "../components/FormBuilder/FormTable";
import * as XLSX from "xlsx";

function ReportsPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshToken } = useSelector((state) => state.auth);

  // Filter states
  const [reportType, setReportType] = useState("Employee");
  const [departmentId, setDepartmentId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentsList, setDepartmentsList] = useState([]);

  // Data states
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, departmentId, statusFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartmentsList(res.data);
    } catch (err) {
      console.error("Failed to load departments list:", err);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = "";
      let params = {};

      if (reportType === "Employee") {
        endpoint = "/employees";
        if (departmentId) params.departmentId = departmentId;
        // Don't paginate for raw reports listing in reporting view
        params.limit = 100;
      } else if (reportType === "Leave") {
        endpoint = "/leaves/history";
        params.limit = 100;
      } else if (reportType === "Asset") {
        endpoint = "/assets";
        if (statusFilter) params.status = statusFilter;
        params.limit = 100;
      }

      const res = await api.get(endpoint, { params });
      // Resolve endpoints structures
      const data = res.data.employees || res.data.assets || res.data || [];
      setReportData(data);
    } catch (err) {
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    
    let headers = [];
    let rows = [];
    const filename = `${reportType}_Report_${Date.now()}`;

    if (reportType === "Employee") {
      headers = ["ID", "Name", "Email", "Phone", "Department", "Designation", "Salary"];
      rows = reportData.map(emp => [
        emp.id,
        emp.user?.name || "",
        emp.user?.email || "",
        emp.phone || "",
        emp.department?.department_name || "",
        emp.designation || "",
        emp.salary || ""
      ]);
    } else if (reportType === "Leave") {
      headers = ["ID", "Employee Name", "Email", "Leave Type", "Start Date", "End Date", "Status", "Comment"];
      rows = reportData.map(req => [
        req.id,
        req.employeeProfile?.user?.name || "",
        req.employeeProfile?.user?.email || "",
        req.leaveType,
        new Date(req.startDate).toLocaleDateString(),
        new Date(req.endDate).toLocaleDateString(),
        req.status,
        req.rejectionReason || ""
      ]);
    } else if (reportType === "Asset") {
      headers = ["Code", "Asset Name", "Type", "Purchase Date", "Cost (INR)", "Status", "Assigned Employee"];
      rows = reportData.map(asset => [
        asset.assetCode,
        asset.assetName,
        asset.assetType,
        new Date(asset.purchaseDate).toLocaleDateString(),
        asset.purchaseCost,
        asset.status,
        asset.allocations && asset.allocations[0] ? asset.allocations[0].employee?.user?.name : "Inventory"
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel using xlsx package
  const handleExportExcel = () => {
    if (reportData.length === 0) return;

    let formattedData = [];
    const filename = `${reportType}_Report_${Date.now()}`;

    if (reportType === "Employee") {
      formattedData = reportData.map(emp => ({
        "ID": emp.id,
        "Name": emp.user?.name || "",
        "Email": emp.user?.email || "",
        "Phone": emp.phone || "",
        "Department": emp.department?.department_name || "",
        "Designation": emp.designation || "",
        "Salary (INR)": emp.salary ? parseFloat(emp.salary) : 0
      }));
    } else if (reportType === "Leave") {
      formattedData = reportData.map(req => ({
        "ID": req.id,
        "Employee Name": req.employeeProfile?.user?.name || "",
        "Email": req.employeeProfile?.user?.email || "",
        "Leave Type": req.leaveType,
        "Start Date": new Date(req.startDate).toLocaleDateString(),
        "End Date": new Date(req.endDate).toLocaleDateString(),
        "Status": req.status,
        "Comment": req.rejectionReason || ""
      }));
    } else if (reportType === "Asset") {
      formattedData = reportData.map(asset => ({
        "Code": asset.assetCode,
        "Asset Name": asset.assetName,
        "Type": asset.assetType,
        "Purchase Date": new Date(asset.purchaseDate).toLocaleDateString(),
        "Cost (INR)": parseFloat(asset.purchaseCost),
        "Status": asset.status,
        "Assigned Employee": asset.allocations && asset.allocations[0] ? asset.allocations[0].employee?.user?.name : "Inventory"
      }));
    }

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports Sheet");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Export PDF (styled browser print execution)
  const handleExportPDF = () => {
    window.print();
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

  // Columns depending on report type
  const employeeColumns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name", render: (row) => row.user?.name || "N/A" },
    { key: "email", label: "Email", render: (row) => row.user?.email || "N/A" },
    { key: "dept", label: "Department", render: (row) => row.department?.department_name || "N/A" },
    { key: "designation", label: "Designation" },
    { key: "salary", label: "Salary", render: (row) => row.salary ? `₹${parseFloat(row.salary).toLocaleString()}` : "N/A" }
  ];

  const leaveColumns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Employee", render: (row) => row.employeeProfile?.user?.name || "N/A" },
    { key: "leaveType", label: "Leave Type" },
    { key: "startDate", label: "Start Date", render: (row) => new Date(row.startDate).toLocaleDateString() },
    { key: "endDate", label: "End Date", render: (row) => new Date(row.endDate).toLocaleDateString() },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="badge" style={{
          backgroundColor: row.status === "approved" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          color: row.status === "approved" ? "var(--success)" : "var(--danger)"
        }}>
          {row.status}
        </span>
      )
    }
  ];

  const assetColumns = [
    { key: "assetCode", label: "Code" },
    { key: "assetName", label: "Asset Name" },
    { key: "assetType", label: "Type" },
    { key: "purchaseDate", label: "Purchase Date", render: (row) => new Date(row.purchaseDate).toLocaleDateString() },
    { key: "purchaseCost", label: "Cost", render: (row) => `₹${parseFloat(row.purchaseCost).toLocaleString()}` },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="badge" style={{
          backgroundColor: row.status === "Available" ? "rgba(16, 185, 129, 0.15)" : "rgba(99, 102, 241, 0.15)",
          color: row.status === "Available" ? "var(--success)" : "var(--primary)"
        }}>
          {row.status}
        </span>
      )
    }
  ];

  const currentColumns = 
    reportType === "Employee" ? employeeColumns : 
    reportType === "Leave" ? leaveColumns : assetColumns;

  return (
    <div className="dashboard-layout">
      {/* Navbar (hidden in print media) */}
      <nav className="navbar no-print">
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
          
          <div className="no-print">
            <h2>SaaS Reporting Engine</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Extract consolidated tables of employee profiles, processed approvals history, and corporate asset inventory.
            </p>
          </div>

          {error && <div className="alert alert-error no-print">{error}</div>}

          {/* Filters card */}
          <div className="glass-card no-print" style={{ maxWidth: "100%", padding: "1.5rem 2.5rem", marginBottom: "2rem" }}>
            <div className="responsive-filter-grid">
              <FormSelect
                label="Report Type"
                name="reportType"
                value={reportType}
                onChange={(e) => { setReportType(e.target.value); setDepartmentId(""); setStatusFilter(""); }}
                options={[
                  { value: "Employee", label: "Employee Directory" },
                  { value: "Leave", label: "Leave History Logs" },
                  { value: "Asset", label: "Asset Inventory" }
                ]}
                style={{ marginBottom: 0 }}
              />

              {reportType === "Employee" && (
                <FormSelect
                  label="Department Filter"
                  name="departmentId"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  placeholder="All Departments"
                  options={departmentsList.map(d => ({ value: d.id, label: d.department_name }))}
                  style={{ marginBottom: 0 }}
                />
              )}

              {reportType === "Asset" && (
                <FormSelect
                  label="Status Filter"
                  name="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  placeholder="All Statuses"
                  options={[
                    { value: "Available", label: "Available" },
                    { value: "Allocated", label: "Allocated" },
                    { value: "Damaged", label: "Damaged" },
                    { value: "Lost", label: "Lost" }
                  ]}
                  style={{ marginBottom: 0 }}
                />
              )}

              {/* Pad elements */}
              {(reportType !== "Employee" && reportType !== "Asset") && <div />}

              <button
                className="btn-primary"
                style={{ margin: 0, padding: "0.55rem", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", width: "100%" }}
                onClick={handleExportExcel}
                disabled={reportData.length === 0 || loading}
              >
                📥 Export Excel
              </button>

              <button
                className="btn-secondary"
                style={{ margin: 0, padding: "0.55rem", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", width: "100%" }}
                onClick={handleExportCSV}
                disabled={reportData.length === 0 || loading}
              >
                📊 Export CSV
              </button>

              <button
                className="btn-secondary"
                style={{ margin: 0, padding: "0.55rem", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", width: "100%" }}
                onClick={handleExportPDF}
                disabled={reportData.length === 0 || loading}
              >
                📄 Export PDF / Print
              </button>
            </div>
          </div>

          {/* Printable Report Wrapper */}
          <div className="print-area">
            <div style={{ display: "none" }} className="print-only">
              <h1 style={{ color: "#000000", margin: "0 0 0.5rem 0" }}>i-SOFTZONE Technologies</h1>
              <h3 style={{ color: "#333333", margin: "0 0 1.5rem 0" }}>{reportType} Consolidated Report</h3>
              <p style={{ fontSize: "0.85rem", color: "#666666", marginBottom: "2rem" }}>
                Generated on: {new Date().toLocaleString()} by {user?.name || "System Administrator"}
              </p>
            </div>

            <FormTable
              columns={currentColumns}
              data={reportData}
              loading={loading}
              emptyMessage={`No matching records found for ${reportType} report.`}
            />
          </div>

        </div>
      </main>
      
      {/* Simple css for prints */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-area {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .table-wrapper {
            box-shadow: none !important;
            border: 1px solid #cccccc !important;
            background: #ffffff !important;
          }
          table {
            color: #000000 !important;
          }
          th {
            background: #f0f0f0 !important;
            color: #000000 !important;
            border-bottom: 2px solid #cccccc !important;
          }
          td {
            border-bottom: 1px solid #dddddd !important;
            color: #000000 !important;
          }
          .badge {
            background: transparent !important;
            border: 1px solid #666666 !important;
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ReportsPanel;
