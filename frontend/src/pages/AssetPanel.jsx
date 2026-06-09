import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../services/api";
import FormInput from "../components/FormBuilder/FormInput";
import FormSelect from "../components/FormBuilder/FormSelect";
import FormTable from "../components/FormBuilder/FormTable";

function AssetPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshToken } = useSelector((state) => state.auth);
  const isManager = user && (user.role === "admin" || user.role === "manager");

  // Assets list states
  const [assets, setAssets] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search & filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("purchaseDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Dynamic Register Asset Form State
  const [assetForm, setAssetForm] = useState({
    assetCode: "",
    assetName: "",
    assetType: "Laptop",
    purchaseDate: "",
    purchaseCost: "",
    status: "Available"
  });
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Allocation overlay states
  const [allocatingAssetId, setAllocatingAssetId] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // History modal states
  const [viewingAssetId, setViewingAssetId] = useState(null);
  const [assetHistoryList, setAssetHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch employees list for allocation
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      // res.data.employees holds the roster in paginated endpoint
      const roster = res.data.employees || res.data || [];
      setEmployeesList(roster);
    } catch (err) {
      console.error("Failed to load employees for allocation dropdown:", err);
    }
  };

  const fetchAssets = useCallback(async () => {
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
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.assetType = typeFilter;

      const res = await api.get("/assets", { params });
      setAssets(res.data.assets);
      setTotalItems(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assets inventory");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortOrder, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchAssets();
    if (isManager) {
      fetchEmployees();
    }
  }, [fetchAssets, isManager]);

  const handleAssetFormChange = (e) => {
    setAssetForm({ ...assetForm, [e.target.name]: e.target.value });
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!assetForm.assetCode || !assetForm.assetName || !assetForm.purchaseDate || !assetForm.purchaseCost) return;

    setFormSubmitLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post("/assets", assetForm);
      setSuccess(res.data.message);
      setAssetForm({
        assetCode: "",
        assetName: "",
        assetType: "Laptop",
        purchaseDate: "",
        purchaseCost: "",
        status: "Available"
      });
      fetchAssets();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create asset");
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId || !allocatingAssetId) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await api.post(`/assets/${allocatingAssetId}/allocate`, {
        employeeId: parseInt(selectedEmployeeId)
      });
      setSuccess(res.data.message);
      setAllocatingAssetId(null);
      setSelectedEmployeeId("");
      fetchAssets();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Asset allocation failed");
    }
  };

  const handleReturnAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to return this asset to inventory?")) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await api.post(`/assets/${assetId}/return`);
      setSuccess(res.data.message);
      fetchAssets();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to return asset");
    }
  };

  const fetchAssetHistory = async (assetId) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/assets/${assetId}/history`);
      setAssetHistoryList(res.data);
    } catch (err) {
      setError("Failed to fetch asset history logs");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
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
      key: "assetCode",
      label: "Code",
      sortable: true,
      render: (row) => <strong>{row.assetCode}</strong>
    },
    {
      key: "assetName",
      label: "Asset Name",
      sortable: true
    },
    {
      key: "assetType",
      label: "Type",
      sortable: true,
      render: (row) => <span className="badge badge-skill">{row.assetType}</span>
    },
    {
      key: "purchaseDate",
      label: "Purchase Date",
      sortable: true,
      render: (row) => new Date(row.purchaseDate).toLocaleDateString()
    },
    {
      key: "purchaseCost",
      label: "Cost",
      sortable: true,
      render: (row) => `₹${parseFloat(row.purchaseCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span className="badge" style={{
          backgroundColor: row.status === "Available"
            ? "rgba(16, 185, 129, 0.15)"
            : row.status === "Allocated"
              ? "rgba(99, 102, 241, 0.15)"
              : "rgba(239, 68, 68, 0.15)",
          color: row.status === "Available"
            ? "var(--success)"
            : row.status === "Allocated"
              ? "var(--primary)"
              : "var(--danger)",
          border: `1px solid ${row.status === "Available"
            ? "rgba(16, 185, 129, 0.3)"
            : row.status === "Allocated"
              ? "rgba(99, 102, 241, 0.3)"
              : "rgba(239, 68, 68, 0.3)"}`
        }}>
          {row.status}
        </span>
      )
    },
    {
      key: "assignment",
      label: "Assigned To",
      render: (row) => {
        const activeAlloc = row.allocations && row.allocations[0];
        return activeAlloc ? (
          <div>
            <strong>{activeAlloc.employee?.user?.name}</strong>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {activeAlloc.employee?.user?.email}
            </div>
          </div>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Inventory</span>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {isManager && row.status === "Available" && (
            <button
              className="btn-primary"
              style={{ margin: 0, padding: "0.35rem 0.65rem", fontSize: "0.8rem", width: "auto" }}
              onClick={() => { setAllocatingAssetId(row.id); }}
            >
              Allocate
            </button>
          )}
          {isManager && row.status === "Allocated" && (
            <button
              className="btn-danger"
              style={{ margin: 0, padding: "0.35rem 0.65rem", fontSize: "0.8rem", width: "auto", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "none" }}
              onClick={() => handleReturnAsset(row.id)}
            >
              Return
            </button>
          )}
          <button
            className="btn-secondary"
            style={{ margin: 0, padding: "0.35rem 0.65rem", fontSize: "0.8rem", width: "auto" }}
            onClick={() => { setViewingAssetId(row.id); fetchAssetHistory(row.id); }}
          >
            History
          </button>
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
          <h2>Corporate Asset Management</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Register inventory items (Laptops, Access Cards, etc.) and audit allocations to corporate staff members.
          </p>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Allocation Overlay Modal */}
          {allocatingAssetId && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.8)", display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 100
            }}>
              <div className="glass-card" style={{ maxWidth: "420px", padding: "2rem" }}>
                <h3 style={{ margin: "0 0 1rem 0" }}>Allocate Asset</h3>
                <form onSubmit={handleAllocateSubmit}>
                  <FormSelect
                    label="Assign to Employee"
                    name="employeeId"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    placeholder="-- Select Employee Profile --"
                    options={employeesList.map(emp => ({
                      value: emp.id,
                      label: `${emp.user?.name || "Unknown"} (${emp.designation || "N/A"})`
                    }))}
                    required
                  />

                  <div className="action-row" style={{ marginTop: "1.5rem" }}>
                    <button className="btn-primary" type="submit" style={{ margin: 0, width: "auto" }}>
                      Confirm Allocation
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => { setAllocatingAssetId(null); setSelectedEmployeeId(""); }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* History Overlay Modal */}
          {viewingAssetId && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.8)", display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 100
            }}>
              <div className="glass-card" style={{ maxWidth: "600px", width: "90%", padding: "2rem" }}>
                <h3 style={{ margin: "0 0 1rem 0" }}>Asset Allocation Lifecycle History</h3>
                
                {historyLoading ? (
                  <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    Loading history logs...
                  </div>
                ) : assetHistoryList.length === 0 ? (
                  <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No audit history logs recorded for this asset.
                  </div>
                ) : (
                  <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "0.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {assetHistoryList.map((hist) => (
                        <div key={hist.id} style={{
                          borderBottom: "1px solid var(--border-glass)",
                          paddingBottom: "0.75rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <span className="badge badge-skill" style={{ marginRight: "0.5rem" }}>
                              {hist.action}
                            </span>
                            <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
                              {hist.remarks}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "right" }}>
                            {new Date(hist.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="action-row" style={{ justifyContent: "flex-end" }}>
                  <button
                    className="btn-secondary"
                    onClick={() => { setViewingAssetId(null); setAssetHistoryList([]); }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={isManager ? "responsive-split-layout" : ""}>
            
            {/* Left Column: Asset Registry Form (Admins/Managers Only) */}
            {isManager && (
              <div className="glass-card" style={{ padding: "2rem", height: "fit-content" }}>
                <h3 style={{ margin: "0 0 1.5rem 0" }}>Register Asset</h3>
                <form onSubmit={handleCreateAsset}>
                  <FormInput
                    label="Asset Code"
                    name="assetCode"
                    placeholder="e.g. LAP-2026-009"
                    value={assetForm.assetCode}
                    onChange={handleAssetFormChange}
                    required
                  />

                  <FormInput
                    label="Asset Name"
                    name="assetName"
                    placeholder="e.g. MacBook Pro M3 Max"
                    value={assetForm.assetName}
                    onChange={handleAssetFormChange}
                    required
                  />

                  <FormSelect
                    label="Asset Type"
                    name="assetType"
                    value={assetForm.assetType}
                    onChange={handleAssetFormChange}
                    placeholder="Select Type"
                    options={[
                      { value: "Laptop", label: "Laptop" },
                      { value: "Mouse", label: "Mouse" },
                      { value: "Monitor", label: "Monitor" },
                      { value: "ID Card", label: "ID Card" },
                      { value: "Access Card", label: "Access Card" },
                      { value: "Software License", label: "Software License" }
                    ]}
                    required
                  />

                  <FormInput
                    label="Purchase Date"
                    name="purchaseDate"
                    type="date"
                    value={assetForm.purchaseDate}
                    onChange={handleAssetFormChange}
                    required
                  />

                  <FormInput
                    label="Purchase Cost (INR)"
                    name="purchaseCost"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 150000"
                    value={assetForm.purchaseCost}
                    onChange={handleAssetFormChange}
                    required
                  />

                  <button className="btn-primary" type="submit" style={{ margin: "1rem 0 0 0" }} disabled={formSubmitLoading}>
                    {formSubmitLoading ? "Registering..." : "Add Asset"}
                  </button>
                </form>
              </div>
            )}

            {/* Right Column: Asset Inventory List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Filter controls */}
              <div className="glass-card" style={{ maxWidth: "100%", padding: "1.25rem 2rem" }}>
                <div className="responsive-filter-grid">
                  <FormInput
                    label="Search Inventory"
                    name="search"
                    placeholder="Search name, code, type..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    style={{ marginBottom: 0 }}
                  />

                  <FormSelect
                    label="Type"
                    name="typeFilter"
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                    placeholder="All Types"
                    options={[
                      { value: "Laptop", label: "Laptop" },
                      { value: "Mouse", label: "Mouse" },
                      { value: "Monitor", label: "Monitor" },
                      { value: "ID Card", label: "ID Card" },
                      { value: "Access Card", label: "Access Card" },
                      { value: "Software License", label: "Software License" }
                    ]}
                    style={{ marginBottom: 0 }}
                  />

                  <FormSelect
                    label="Status"
                    name="statusFilter"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    placeholder="All Statuses"
                    options={[
                      { value: "Available", label: "Available" },
                      { value: "Allocated", label: "Allocated" },
                      { value: "Damaged", label: "Damaged" },
                      { value: "Lost", label: "Lost" }
                    ]}
                    style={{ marginBottom: 0 }}
                  />

                  <button
                    className="btn-secondary"
                    style={{ margin: 0, padding: "0.55rem", fontSize: "0.9rem", width: "100%" }}
                    onClick={() => { setSearch(""); setStatusFilter(""); setTypeFilter(""); setCurrentPage(1); }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Inventory Table */}
              <FormTable
                columns={columns}
                data={assets}
                loading={loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                emptyMessage="No assets registered in inventory database."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssetPanel;
